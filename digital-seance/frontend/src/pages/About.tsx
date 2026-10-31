import React from 'react';
import {
  Flame,
  Cpu,
  Ghost,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-[#F5F3FF]">
      {/* Page Title */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#39E6B0] mb-1 justify-center sm:justify-start">
          <Ghost className="w-4 h-4 text-[#A78BFA] candle-glow" />
          <span>About the Project // Ghost in the Machine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F3FF] tracking-wide">
          DIGITAL SÉANCE
        </h1>
        <p className="text-base sm:text-lg text-[#39E6B0] font-serif italic mt-2">
          "The past has a story. Let the machine tell it."
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-[#9CA3AF]">
        {/* Challenge Context */}
        <section className="bg-[#11131B] border border-[#171923] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#A78BFA]">
            <Flame className="w-4 h-4" />
            <span>Hacktoberfest 2026 Open-Source AI Challenge</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F5F3FF]">
            Week 4: Ghost in the Machine
          </h2>
          <p>
            In folklore, a séance is a ritual gathering to transmit messages across the veil of the unknown.
            In computing, the "ghost in the machine" refers to consciousness, anomalous emergence, and the poetic
            boundaries of silicon calculation.
          </p>
          <p>
            <strong>Digital Séance</strong> bridges these two worlds. It is an open-source storytelling application
            designed to transmute real human memories, forgotten diary fragments, sepia photographs, and eerie coincidences
            into atmospheric supernatural tales through the generative intelligence of an open-weight language model.
          </p>
        </section>

        {/* The Open-Weight AI Imperative */}
        <section className="bg-[#11131B] border border-[#171923] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#39E6B0]">
            <Cpu className="w-4 h-4" />
            <span>Why Open-Weight Models?</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F5F3FF]">
            Freedom, Privacy, and True Open Source
          </h2>
          <p>
            Most modern AI projects are thin wrappers around closed commercial APIs (OpenAI, Gemini, Claude).
            This creates heavy dependency on proprietary black boxes that monetize and retain user data.
          </p>
          <p>
            Digital Séance rejects this model entirely:
          </p>
          <ul className="space-y-2.5 list-disc list-inside text-xs sm:text-sm text-[#F5F3FF]/90 pl-2">
            <li>
              <strong>Default Model:</strong> Powered natively by <span className="text-[#39E6B0] font-mono">Qwen/Qwen2.5-3B-Instruct</span>, licensed under Apache 2.0.
            </li>
            <li>
              <strong>Native Inference:</strong> Uses Hugging Face <code className="text-[#A78BFA]">transformers</code> and PyTorch directly on your machine or designated server.
            </li>
            <li>
              <strong>Memory Privacy:</strong> Your deeply personal memories and stories are processed locally; they are never sent to commercial data aggregators.
            </li>
            <li>
              <strong>Honest Diagnostics:</strong> The system never returns fake stories or pretends that models are running when hardware memory is unavailable.
            </li>
          </ul>
        </section>

        {/* The 5 Spirits of the Séance */}
        <section className="bg-[#11131B] border border-[#171923] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#A78BFA]">
            <Ghost className="w-4 h-4" />
            <span>Personas of the Machine</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F5F3FF]">
            The Five Guiding Spirits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-2">
            <div className="p-4 bg-[#171923] rounded-lg border border-[#171923]">
              <p className="font-bold text-[#A78BFA] font-serif text-sm">1. The Forgotten One</p>
              <p className="text-[11px] text-[#39E6B0] font-mono mb-1">Mysterious and melancholic</p>
              <p className="text-[#9CA3AF]">Focuses on rotted memories, silence, dust, and names forgotten by family trees.</p>
            </div>
            <div className="p-4 bg-[#171923] rounded-lg border border-[#171923]">
              <p className="font-bold text-[#D97757] font-serif text-sm">2. The Shadow</p>
              <p className="text-[11px] text-[#D97757] font-mono mb-1">Dark and frightening</p>
              <p className="text-[#9CA3AF]">Dwells in unlit corners, producing visceral, suffocating horror and sudden twists.</p>
            </div>
            <div className="p-4 bg-[#171923] rounded-lg border border-[#171923]">
              <p className="font-bold text-[#39E6B0] font-serif text-sm">3. The Lost Traveler</p>
              <p className="text-[11px] text-[#39E6B0] font-mono mb-1">Supernatural mystery</p>
              <p className="text-[#9CA3AF]">Explores phantom railways, liminal threshold stations, and eternal wanderings.</p>
            </div>
            <div className="p-4 bg-[#171923] rounded-lg border border-[#171923]">
              <p className="font-bold text-[#F5F3FF] font-serif text-sm">4. The Memory Keeper</p>
              <p className="text-[11px] text-[#A78BFA] font-mono mb-1">Emotional and nostalgic</p>
              <p className="text-[#9CA3AF]">Honors the tragic beauty of love, loss, sepia photographs, and pressed flowers.</p>
            </div>
            <div className="p-4 bg-[#171923] rounded-lg border border-[#171923] sm:col-span-2">
              <p className="font-bold text-[#39E6B0] font-serif text-sm">5. The Digital Phantom</p>
              <p className="text-[11px] text-[#39E6B0] font-mono mb-1">Retro computer horror</p>
              <p className="text-[#9CA3AF]">A ghost manifested inside green phosphor CRTs, corrupted magnetic tapes, and obsolete dial-up modems.</p>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="bg-[#11131B] border border-[#171923] rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#A78BFA]">
            <Code2 className="w-4 h-4" />
            <span>Architecture & Stack</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F5F3FF]">
            Engineered for Production
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#171923] rounded-lg border border-[#171923]">
              <span className="text-[#A78BFA] font-bold block mb-1">Frontend</span>
              <p className="text-[#9CA3AF]">React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Lucide React</p>
            </div>
            <div className="p-3 bg-[#171923] rounded-lg border border-[#171923]">
              <span className="text-[#39E6B0] font-bold block mb-1">Backend</span>
              <p className="text-[#9CA3AF]">FastAPI + Python 3.12 + Uvicorn + Pydantic v2 + SQLAlchemy 2.0</p>
            </div>
            <div className="p-3 bg-[#171923] rounded-lg border border-[#171923]">
              <span className="text-[#A78BFA] font-bold block mb-1">AI Engine</span>
              <p className="text-[#9CA3AF]">Hugging Face Transformers + PyTorch + Qwen2.5-3B-Instruct (local inference)</p>
            </div>
            <div className="p-3 bg-[#171923] rounded-lg border border-[#171923]">
              <span className="text-[#39E6B0] font-bold block mb-1">Storage & Deploy</span>
              <p className="text-[#9CA3AF]">SQLite persistent disk + Render (render.yaml Blueprint)</p>
            </div>
          </div>
        </section>

        {/* Next Step Call to action */}
        <div className="text-center pt-4">
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-[#A78BFA] to-[#39E6B0] text-[#08090D] font-serif font-bold text-sm tracking-widest uppercase hover:opacity-95 transition-opacity"
          >
            <Flame className="w-4 h-4 text-[#08090D]" />
            <span>Enter the Séance Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
