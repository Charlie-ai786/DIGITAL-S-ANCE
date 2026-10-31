import os
import sys
import time
import logging
import threading
import psutil
from typing import Optional, Tuple, Dict, Any
from app.config import settings

logger = logging.getLogger("digital_seance.ai_service")
logging.basicConfig(level=logging.INFO)

# Spirit Persona Guides
SPIRIT_PROFILES = {
    "The Forgotten One": {
        "voice": "Mysterious, sorrowful, melancholic, speaks of dust, silence, lost names, and forgotten promises.",
        "perspective": "Observes from the periphery of memory, where time rots away gently and sorrow lingers in cold rooms."
    },
    "The Shadow": {
        "voice": "Dark, visceral, chilling, tense, and frightening; lingers in corners, watching behind closed doors.",
        "perspective": "Unearths the terrifying unknown lurking beneath familiar reality. Builds dread, suffocating suspense, and sudden revelation."
    },
    "The Lost Traveler": {
        "voice": "An eerie wanderer traversing phantom train tracks, forsaken stations, foggy roads, and liminal threshold spaces.",
        "perspective": "Investigates supernatural mysteries, unraveling bizarre clues that blur the boundary between wanderlust and eternal wandering."
    },
    "The Memory Keeper": {
        "voice": "Deeply emotional, nostalgic, hauntingly beautiful, poetic, reverent yet tragic.",
        "perspective": "Preserves fragments of what once was—sepia photographs, old radio static, pressed flowers, and unfinished letters."
    },
    "The Digital Phantom": {
        "voice": "A glitch in the machine, retro-futuristic techno-horror, phosphorescent green phosphor glow, dial-up cadence, corrupted packets, sentient static.",
        "perspective": "Speaks from within the circuitry, optical drives, and magnetic tapes of obsolete machinery. Blends analog hauntings with digital decay."
    }
}

# Tone guidance
TONE_INSTRUCTIONS = {
    "Psychological horror": "Focus on paranoia, distorted perception, crumbling sanity, and the unsettling realization that reality cannot be trusted.",
    "Gothic mystery": "Emphasize decaying manors, ancestral secrets, candle-lit corridors, relentless rain, and ancient curses.",
    "Supernatural suspense": "Build mounting tension, uncanny phenomena, uncanny timing, and the presence of unseen forces closing in.",
    "Melancholic remembrance": "Weave bittersweet longing, emotional resonance, ghostly grief, and the weight of things left unsaid.",
    "Cosmic horror": "Evoke unfathomable vastness, ancient non-human entities, forbidden knowledge, and insignificant human fragility."
}

# Length mapping (max new tokens)
LENGTH_MAP = {
    "short": 350,
    "medium": 650,
    "long": 950
}

class AIService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(AIService, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.model_id = settings.MODEL_ID
        self.device = self._determine_device(settings.MODEL_DEVICE)
        self.dtype = self._determine_dtype(settings.MODEL_DTYPE)
        self.tokenizer = None
        self.model = None
        self.status = "unloaded"  # "unloaded", "loading", "ready", "error"
        self.error_message: Optional[str] = None
        self.loaded_at: Optional[float] = None
        self._load_lock = threading.Lock()
        self._generate_lock = threading.Lock()
        self._initialized = True

        if settings.MODEL_LOAD_ON_STARTUP:
            logger.info("Auto-loading model on startup as configured...")
            threading.Thread(target=self._load_model_thread, daemon=True).start()

    def _determine_device(self, configured_device: str) -> str:
        if configured_device.lower() == "auto":
            try:
                import torch
                if torch.cuda.is_available():
                    return "cuda"
                elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                    return "mps"
                return "cpu"
            except ImportError:
                return "cpu"
        return configured_device

    def _determine_dtype(self, configured_dtype: str):
        import torch
        if configured_dtype.lower() == "auto":
            if self.device == "cuda":
                # Check for bfloat16 capability
                if torch.cuda.is_bf16_supported():
                    return torch.bfloat16
                return torch.float16
            return torch.float32
        
        dtype_map = {
            "float32": torch.float32,
            "float16": torch.float16,
            "bfloat16": torch.bfloat16
        }
        return dtype_map.get(configured_dtype.lower(), torch.float32)

    def load_model(self) -> bool:
        """Synchronous load of the model weights."""
        with self._load_lock:
            if self.status == "ready" and self.model is not None:
                return True
            if self.status == "loading":
                logger.info("Model is already being loaded by another thread...")
                return False

            self.status = "loading"
            self.error_message = None
            logger.info(f"Initiating open-weight model load: {self.model_id} on {self.device}")

            try:
                import torch
                from transformers import AutoTokenizer, AutoModelForCausalLM

                start_time = time.time()
                logger.info(f"Loading tokenizer for {self.model_id}...")
                self.tokenizer = AutoTokenizer.from_pretrained(
                    self.model_id,
                    trust_remote_code=True,
                    padding_side="left"
                )

                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token

                logger.info(f"Loading model weights for {self.model_id} with dtype {self.dtype}...")
                
                model_kwargs = {
                    "torch_dtype": self.dtype,
                    "trust_remote_code": True,
                    "low_cpu_mem_usage": True
                }

                if self.device == "cuda":
                    model_kwargs["device_map"] = "auto"

                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_id,
                    **model_kwargs
                )

                if self.device != "cuda":
                    self.model.to(self.device)

                self.model.eval()
                self.status = "ready"
                self.loaded_at = time.time()
                load_duration = self.loaded_at - start_time
                logger.info(f"Open-weight model {self.model_id} successfully loaded in {load_duration:.2f}s on {self.device}")
                return True

            except Exception as e:
                self.status = "error"
                self.error_message = f"Failed to load model weights: {str(e)}"
                logger.error(f"Error loading model weights: {e}", exc_info=True)
                return False

    def _load_model_thread(self):
        self.load_model()

    def get_status(self) -> Dict[str, Any]:
        """Returns the current model status and memory info."""
        mem = psutil.virtual_memory()
        mem_info = {
            "system_total_gb": round(mem.total / (1024 ** 3), 2),
            "system_available_gb": round(mem.available / (1024 ** 3), 2),
            "system_used_percent": mem.percent
        }

        try:
            import torch
            if torch.cuda.is_available():
                mem_info["gpu_name"] = torch.cuda.get_device_name(0)
                mem_info["gpu_memory_allocated_mb"] = round(torch.cuda.memory_allocated(0) / (1024 ** 2), 2)
                mem_info["gpu_memory_reserved_mb"] = round(torch.cuda.memory_reserved(0) / (1024 ** 2), 2)
        except Exception:
            pass

        return {
            "model_id": self.model_id,
            "is_loaded": self.status == "ready" and self.model is not None,
            "status": self.status,
            "device": self.device,
            "dtype": str(self.dtype),
            "generation_available": self.status == "ready" and self.model is not None,
            "error_message": self.error_message,
            "max_new_tokens": settings.MAX_NEW_TOKENS,
            "memory_info": mem_info
        }

    def generate_story(
        self,
        prompt: str,
        spirit: str,
        length: str = "medium",
        tone: str = "Psychological horror",
        language: str = "English",
        temperature: Optional[float] = None,
        max_new_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes actual story generation using the open-weight model.
        Never generates fake or mock outputs.
        """
        if self.status != "ready" or self.model is None or self.tokenizer is None:
            # Try to load if currently unloaded
            if self.status in ("unloaded", "error"):
                logger.info("Attempting on-demand load of open-weight model...")
                loaded = self.load_model()
                if not loaded:
                    raise RuntimeError(
                        f"Open-weight model '{self.model_id}' is not loaded. Status: {self.status}. "
                        f"Reason: {self.error_message or 'Model weights have not been initialized.'}"
                    )
            elif self.status == "loading":
                raise RuntimeError(f"Open-weight model '{self.model_id}' is currently loading weights into memory. Please wait.")
            else:
                raise RuntimeError(f"Open-weight model '{self.model_id}' is unavailable. Status: {self.status}.")

        spirit_info = SPIRIT_PROFILES.get(spirit, SPIRIT_PROFILES["The Forgotten One"])
        tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["Psychological horror"])
        tokens_budget = max_new_tokens or LENGTH_MAP.get(length.lower(), settings.MAX_NEW_TOKENS)
        temp = temperature if temperature is not None else settings.TEMPERATURE

        system_prompt = (
            "You are the supernatural narrative spirit of the 'Digital Séance' machine.\n"
            "Your task is to transform human memories, diary fragments, and forgotten artifacts into "
            "atmospheric, evocative, spine-chilling supernatural tales.\n\n"
            f"GUIDING SPIRIT IDENTITY: {spirit}\n"
            f"SPIRIT VOICE: {spirit_info['voice']}\n"
            f"PERSPECTIVE: {spirit_info['perspective']}\n\n"
            f"TONE INSTRUCTION: {tone_instruction}\n"
            f"LANGUAGE: Write exclusively in {language}.\n\n"
            "MANDATORY NARRATIVE RULES:\n"
            "1. Craft a completely original supernatural narrative based directly upon the user's provided memory/fragment.\n"
            "2. Preserve the core emotional truth and seed details of the user's memory.\n"
            "3. Format your output strictly starting with a title on the first line: 'TITLE: <An Evocative Gothic Title>'\n"
            "   Followed by a blank line and then the complete story narrative.\n"
            "4. Do NOT claim the story represents genuine historical facts or real deceased persons.\n"
            "5. Do NOT speak as an AI assistant (no 'Here is your story', 'Sure!'). Immerse the reader immediately.\n"
            "6. Provide a rich, complete narrative arc with a haunting, memorable conclusion."
        )

        user_content = (
            f"Fragment / Memory provided for the Séance:\n\"\"\"{prompt}\"\"\"\n\n"
            f"Invoke the spirit of {spirit} with a tone of {tone} in {language}."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        start_time = time.time()

        with self._generate_lock:
            import torch
            try:
                # Format using tokenizer chat template
                if hasattr(self.tokenizer, "apply_chat_template"):
                    input_text = self.tokenizer.apply_chat_template(
                        messages,
                        tokenize=False,
                        add_generation_prompt=True
                    )
                else:
                    input_text = f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{user_content}<|im_end|>\n<|im_start|>assistant\n"

                inputs = self.tokenizer(
                    input_text,
                    return_tensors="pt",
                    truncation=True,
                    max_length=4096
                )

                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                prompt_length = inputs["input_ids"].shape[1]

                with torch.no_grad():
                    outputs = self.model.generate(
                        **inputs,
                        max_new_tokens=tokens_budget,
                        temperature=temp,
                        top_p=settings.TOP_P,
                        repetition_penalty=settings.REPETITION_PENALTY,
                        do_sample=True,
                        pad_token_id=self.tokenizer.pad_token_id,
                        eos_token_id=self.tokenizer.eos_token_id
                    )

                # Decode only generated tokens
                generated_tokens = outputs[0][prompt_length:]
                raw_text = self.tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

                title, story_body = self._parse_title_and_story(raw_text, spirit)
                duration = round(time.time() - start_time, 2)

                return {
                    "title": title,
                    "story": story_body,
                    "spirit": spirit,
                    "tone": tone,
                    "language": language,
                    "duration_seconds": duration,
                    "model_id": self.model_id
                }

            except Exception as e:
                logger.error(f"Inference error during story generation: {e}", exc_info=True)
                raise RuntimeError(f"Open-weight model inference failed: {str(e)}")

    def generate_alternate_ending(
        self,
        original_input: str,
        original_story: str,
        spirit: str,
        tone: str = "Psychological horror",
        language: str = "English",
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Generates an alternate ending for an existing story using the open-weight model.
        """
        if self.status != "ready" or self.model is None or self.tokenizer is None:
            if self.status in ("unloaded", "error"):
                loaded = self.load_model()
                if not loaded:
                    raise RuntimeError(f"Model '{self.model_id}' is not loaded. {self.error_message or ''}")
            else:
                raise RuntimeError(f"Model '{self.model_id}' is not ready. Current status: {self.status}")

        spirit_info = SPIRIT_PROFILES.get(spirit, SPIRIT_PROFILES["The Forgotten One"])
        tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["Psychological horror"])
        temp = temperature or (settings.TEMPERATURE + 0.05)

        system_prompt = (
            "You are the supernatural narrative spirit of the 'Digital Séance' machine.\n"
            f"You are channeling the spirit of {spirit}. Voice: {spirit_info['voice']}.\n"
            f"Tone: {tone_instruction}.\n"
            f"Language: {language}.\n\n"
            "TASK: Create a radically different, unexpected, and gripping ALTERNATE ENDING "
            "for the following supernatural story.\n"
            "CRITICAL REQUIREMENTS:\n"
            "1. Seamlessly branch off from the established premise and midpoint tension of the story.\n"
            "2. Provide a totally unique resolution that subverts or overturns the original ending.\n"
            "3. Do NOT repeat paragraphs from the original text.\n"
            "4. Maintain a chilling supernatural atmosphere matching the chosen spirit.\n"
            "5. Do NOT include assistant chit-chat or introductory comments. Begin directly with the alternate climax/ending."
        )

        user_content = (
            f"ORIGINAL SEED MEMORY:\n\"\"\"{original_input}\"\"\"\n\n"
            f"ORIGINAL STORY:\n\"\"\"{original_story}\"\"\"\n\n"
            "Now write a distinct, haunting alternate ending (2-4 paragraphs) that changes the fate of what occurred."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        start_time = time.time()

        with self._generate_lock:
            import torch
            try:
                if hasattr(self.tokenizer, "apply_chat_template"):
                    input_text = self.tokenizer.apply_chat_template(
                        messages,
                        tokenize=False,
                        add_generation_prompt=True
                    )
                else:
                    input_text = f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{user_content}<|im_end|>\n<|im_start|>assistant\n"

                inputs = self.tokenizer(input_text, return_tensors="pt", truncation=True, max_length=4096)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                prompt_length = inputs["input_ids"].shape[1]

                with torch.no_grad():
                    outputs = self.model.generate(
                        **inputs,
                        max_new_tokens=450,
                        temperature=temp,
                        top_p=settings.TOP_P,
                        repetition_penalty=settings.REPETITION_PENALTY,
                        do_sample=True,
                        pad_token_id=self.tokenizer.pad_token_id,
                        eos_token_id=self.tokenizer.eos_token_id
                    )

                generated_tokens = outputs[0][prompt_length:]
                alternate_ending = self.tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()
                duration = round(time.time() - start_time, 2)

                return {
                    "alternate_ending": alternate_ending,
                    "duration_seconds": duration,
                    "model_id": self.model_id
                }
            except Exception as e:
                logger.error(f"Inference error during alternate ending generation: {e}", exc_info=True)
                raise RuntimeError(f"Open-weight model inference failed: {str(e)}")

    def generate_whisper(self, category: str, language: str = "English") -> Dict[str, Any]:
        """
        Generates a short, cryptic, atmospheric supernatural whisper.
        Feature: 'The Final Whisper'.
        """
        if self.status != "ready" or self.model is None or self.tokenizer is None:
            if self.status in ("unloaded", "error"):
                loaded = self.load_model()
                if not loaded:
                    raise RuntimeError(f"Model '{self.model_id}' is not loaded. {self.error_message or ''}")
            else:
                raise RuntimeError(f"Model '{self.model_id}' is currently {self.status}.")

        category_prompts = {
            "Forgotten memory": "a forgotten memory lost to time, rust, or dust",
            "Midnight warning": "an urgent, cryptic warning that arrives at 3:00 AM",
            "Lost soul": "a melancholic phrase murmured by an entity wandering between worlds",
            "Digital ghost": "an anomalous transmission echoing from corrupted magnetic tape or dark silicon",
            "Strange coincidence": "a terrifying synchronicity connecting two disconnected lives across centuries"
        }

        theme = category_prompts.get(category, "a mysterious supernatural transmission")

        system_prompt = (
            "You are the Spirit in the Machine of Digital Séance.\n"
            "You generate short, cryptic, poetic, and spine-chilling occult whispers.\n"
            f"The theme is: {theme}.\n"
            f"Language: {language}.\n"
            "Format: Exactly 1 to 3 haunting sentences. No quotes, no intro, no emojis, purely visceral supernatural prose."
        )

        user_content = f"Whisper a message of '{category}' into the machine."

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        with self._generate_lock:
            import torch
            try:
                if hasattr(self.tokenizer, "apply_chat_template"):
                    input_text = self.tokenizer.apply_chat_template(
                        messages,
                        tokenize=False,
                        add_generation_prompt=True
                    )
                else:
                    input_text = f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{user_content}<|im_end|>\n<|im_start|>assistant\n"

                inputs = self.tokenizer(input_text, return_tensors="pt", truncation=True, max_length=1024)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                prompt_length = inputs["input_ids"].shape[1]

                with torch.no_grad():
                    outputs = self.model.generate(
                        **inputs,
                        max_new_tokens=100,
                        temperature=0.85,
                        top_p=0.92,
                        repetition_penalty=1.15,
                        do_sample=True,
                        pad_token_id=self.tokenizer.pad_token_id,
                        eos_token_id=self.tokenizer.eos_token_id
                    )

                whisper_text = self.tokenizer.decode(outputs[0][prompt_length:], skip_special_tokens=True).strip()
                # Clean any outer quotes or accidental prefixes
                whisper_text = whisper_text.strip('"\' \n')

                return {
                    "whisper": whisper_text,
                    "category": category,
                    "model_id": self.model_id,
                    "disclaimer": "Fictional atmospheric AI-generated fragment."
                }
            except Exception as e:
                logger.error(f"Inference error during whisper generation: {e}", exc_info=True)
                raise RuntimeError(f"Open-weight model inference failed: {str(e)}")

    def _parse_title_and_story(self, raw_text: str, spirit: str) -> Tuple[str, str]:
        """Extracts the title and clean narrative from the model output."""
        lines = raw_text.splitlines()
        title = f"The Manifestation of {spirit}"
        story_lines = []
        found_title = False

        for i, line in enumerate(lines):
            clean = line.strip()
            if not found_title and (clean.upper().startswith("TITLE:") or clean.upper().startswith("**TITLE:**")):
                t = clean.split(":", 1)[-1].strip().strip("*\"'# ")
                if len(t) > 2:
                    title = t
                    found_title = True
                    continue
            elif not found_title and clean.startswith("# "):
                title = clean[2:].strip().strip("*\"'")
                found_title = True
                continue
            story_lines.append(line)

        story_body = "\n".join(story_lines).strip()
        if not story_body:
            story_body = raw_text

        return title, story_body

ai_service = AIService()
