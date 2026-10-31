import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  BookOpen,
  Sparkles,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Zap,
} from 'lucide-react';

interface Props {
  onOpenWhisper: () => void;
}

export const LandingPage: React.FC<Props> = ({ onOpenWhisper }) => {
  return (
    <div className="relative min-h-screen text-[#F5F3FF]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        {/* Supernatural Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#171923] border border-[#A78BFA]/30 text-xs font-mono text-[#A78BFA] mb-6 shadow-sm shadow-[#A78BFA]/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#39E6B0]" />
          <span>Hacktoberfest Week 4: Ghost in the Machine</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-widest uppercase text-[#F5F3FF] mb-4 drop-shadow-[0_0_35px_rgba(167,139,250,0.35)]"
        >
          DIGITAL SÉANCE
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-2xl font-serif italic text-[#39E6B0] max-w-2xl mb-8 leading-relaxed"
        >
          "The past has a story. Let the machine tell it."
        </motion.p>

        {/* Core Manifesto */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-sm sm:text-base text-[#9CA3AF] max-w-2xl mb-10 leading-relaxed font-sans"
        >
          Some stories are never forgotten. Digital Séance uses open-weight artificial intelligence to transform memories, fragments, and forgotten words into supernatural narratives.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            to="/studio"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-[#A78BFA] to-[#39E6B0] text-[#08090D] font-serif font-bold text-sm tracking-widest uppercase shadow-lg shadow-purple-900/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
          >
            <Flame className="w-4 h-4 text-[#08090D] group-hover:scale-110 transition-transform" />
            <span>Enter the Séance</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            to="/archive"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#171923] border border-[#171923] hover:border-[#A78BFA]/50 text-[#F5F3FF] font-serif font-semibold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#A78BFA]" />
            <span>Explore the Archive</span>
          </Link>
        </motion.div>

        {/* Atmospheric Terminal Preview Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-14 max-w-xl w-full p-4 rounded-xl bg-[#11131B]/80 border border-[#171923] text-left font-mono text-xs text-[#9CA3AF] shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#171923] text-[10px] text-[#A78BFA]">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#39E6B0]" />
              <span>TERMINAL // MANIFESTATION_SEED</span>
            </span>
            <span>MODEL: QWEN-2.5-3B</span>
          </div>
          <p className="italic text-[#F5F3FF]/90">
            "I found an old photograph in my grandfather's room. There was a person standing behind him, but nobody in the family recognized that face..."
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-[#39E6B0] uppercase tracking-wider">Status: Ready for Incantation</span>
            <button
              onClick={onOpenWhisper}
              className="text-[11px] text-[#A78BFA] hover:underline flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>Channel whisper</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F3FF] tracking-wider uppercase">
            The Three Vessels
          </h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-2 font-mono">
            How the supernatural machine resurrects forgotten echoes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#171923]/80 border border-[#171923] hover:border-[#A78BFA]/50 rounded-xl p-6 transition-all duration-300 group hover:shadow-xl hover:shadow-[#A78BFA]/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] mb-4 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 candle-glow" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#F5F3FF] mb-2 tracking-wide">
                1. The Summoning
              </h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                Input your memory, diary fragment, or unsolved family legend. Choose from 5 distinct spirits and tones to conjure a rich supernatural narrative.
              </p>
            </div>
            <Link
              to="/studio"
              className="inline-flex items-center gap-1.5 text-xs text-[#A78BFA] font-serif font-semibold tracking-wider uppercase group-hover:text-[#39E6B0] transition-colors"
            >
              <span>Begin Summoning</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-[#171923]/80 border border-[#171923] hover:border-[#39E6B0]/50 rounded-xl p-6 transition-all duration-300 group hover:shadow-xl hover:shadow-[#39E6B0]/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#39E6B0]/10 border border-[#39E6B0]/30 flex items-center justify-center text-[#39E6B0] mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#F5F3FF] mb-2 tracking-wide">
                2. The Spirit Archive
              </h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                Preserve generated supernatural chronicles in persistent local storage. Search by keyword, filter by spirit guide, or revisit cold tales across time.
              </p>
            </div>
            <Link
              to="/archive"
              className="inline-flex items-center gap-1.5 text-xs text-[#39E6B0] font-serif font-semibold tracking-wider uppercase group-hover:text-[#A78BFA] transition-colors"
            >
              <span>Enter the Vault</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-[#171923]/80 border border-[#171923] hover:border-[#A78BFA]/50 rounded-xl p-6 transition-all duration-300 group hover:shadow-xl hover:shadow-[#A78BFA]/5 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#F5F3FF] mb-2 tracking-wide">
                3. The Final Whisper
              </h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                Explore alternate endings that alter the fate of existing stories, or transmit short cryptic omens across five supernatural frequency bands.
              </p>
            </div>
            <button
              onClick={onOpenWhisper}
              className="inline-flex items-center gap-1.5 text-xs text-[#A78BFA] font-serif font-semibold tracking-wider uppercase group-hover:text-[#39E6B0] transition-colors"
            >
              <span>Channel Whisper</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Open-Source AI Ethics Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10">
        <div className="bg-[#11131B] border border-[#171923] rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#A78BFA]/10 to-transparent pointer-events-none" />

          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#39E6B0] mb-3">
            <Cpu className="w-4 h-4" />
            <span>Open-Weight AI Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F3FF] mb-4">
            No Closed Endpoints. Pure Open-Weight Intelligence.
          </h2>

          <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6 font-sans">
            Unlike commercial AI wrappers that funnel intimate human memories into closed proprietary clouds (OpenAI, Gemini, Claude), Digital Séance is powered strictly by <strong>open-weight models</strong> like <strong>Qwen/Qwen2.5-3B-Instruct</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#171923]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F5F3FF] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#39E6B0]" />
                <span>Absolute Privacy</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                Your personal diary entries and memories never train third-party commercial corporate models.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F5F3FF] text-xs font-semibold">
                <Terminal className="w-4 h-4 text-[#A78BFA]" />
                <span>Local Transformers</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                Inference executes natively via Hugging Face Transformers on your own device hardware.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F5F3FF] text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-[#39E6B0]" />
                <span>Honest Transparency</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                We never fake responses or simulate AI. If hardware memory is constrained, the machine reports truthfully.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

