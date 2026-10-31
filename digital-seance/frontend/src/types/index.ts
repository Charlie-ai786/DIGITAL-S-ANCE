export type SpiritName =
  | 'The Forgotten One'
  | 'The Shadow'
  | 'The Lost Traveler'
  | 'The Memory Keeper'
  | 'The Digital Phantom';

export type StoryTone =
  | 'Psychological horror'
  | 'Gothic mystery'
  | 'Supernatural suspense'
  | 'Melancholic remembrance'
  | 'Cosmic horror';

export type StoryLength = 'short' | 'medium' | 'long';
export type StoryLanguage = 'English' | 'Hindi';

export interface SpiritProfile {
  name: SpiritName;
  tagline: string;
  description: string;
  iconName: string;
  color: string;
  auraColor: string;
}

export interface Story {
  id: string;
  title: string;
  original_input: string;
  generated_story: string;
  spirit: SpiritName | string;
  tone: StoryTone | string;
  language: StoryLanguage | string;
  created_at?: string;
  model_id: string;
  duration_seconds?: number;
  alternate_ending?: string | null;
}

export interface StoryGenerateRequest {
  prompt: string;
  spirit: SpiritName;
  length: StoryLength;
  tone: StoryTone;
  language: StoryLanguage;
  temperature?: number;
  max_new_tokens?: number;
}

export interface StoryGenerateResponse {
  title: string;
  story: string;
  spirit: string;
  tone: string;
  language: string;
  duration_seconds: number;
  model_id: string;
}

export interface AlternateEndingRequest {
  original_input: string;
  original_story: string;
  spirit: string;
  tone: string;
  language?: string;
  temperature?: number;
}

export interface AlternateEndingResponse {
  alternate_ending: string;
  duration_seconds: number;
  model_id: string;
}

export interface WhisperRequest {
  category: string;
  language?: string;
}

export interface WhisperResponse {
  whisper: string;
  category: string;
  model_id: string;
  disclaimer: string;
}

export interface ModelStatus {
  model_id: string;
  is_loaded: boolean;
  status: 'unloaded' | 'loading' | 'ready' | 'error';
  device: string;
  dtype: string;
  generation_available: boolean;
  error_message?: string | null;
  max_new_tokens: number;
  memory_info?: {
    system_total_gb?: number;
    system_available_gb?: number;
    system_used_percent?: number;
    gpu_name?: string;
    gpu_memory_allocated_mb?: number;
    gpu_memory_reserved_mb?: number;
  };
}

export interface HealthStatus {
  status: string;
  database: string;
  model_status: string;
  model_id: string;
  version: string;
}
