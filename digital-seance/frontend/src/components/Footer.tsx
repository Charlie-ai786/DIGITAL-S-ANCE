import React from 'react';
import { Flame, Heart, Shield, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#08090D] border-t border-[#171923] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#9CA3AF] relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#A78BFA] candle-glow" />
            <span className="font-serif text-base font-bold text-[#F5F3FF] tracking-wider">
              DIGITAL SÉANCE
            </span>
          </div>
          <p className="font-serif italic text-xs text-[#9CA3AF]">
            "The past has a story. Let the machine tell it."
          </p>
          <p className="text-[11px] text-[#9CA3AF]/80 leading-relaxed">
            Crafted for the Hacktoberfest Open-Source AI Challenge: Week 4 — Ghost in the Machine.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#F5F3FF]">
            Chambers
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link to="/studio" className="hover:text-[#A78BFA] transition-colors">
                The Summoning (Studio)
              </Link>
            </li>
            <li>
              <Link to="/archive" className="hover:text-[#A78BFA] transition-colors">
                The Spirit Archive
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-[#A78BFA] transition-colors">
                Machine Diagnostics & Setup
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#A78BFA] transition-colors">
                About & AI Manifest
              </Link>
            </li>
          </ul>
        </div>

        {/* Open-Source AI Ethics */}
        <div className="space-y-2">
          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#F5F3FF] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#39E6B0]" /> Open-Weight AI
          </h4>
          <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
            Powered natively by <span className="text-[#39E6B0]">Qwen/Qwen2.5-3B-Instruct</span> (Apache 2.0).
            No proprietary closed APIs or hidden subscriptions.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#39E6B0] mt-1 font-mono">
            <Cpu className="w-3 h-3" />
            <span>Zero Data Exfiltration</span>
          </div>
        </div>

        {/* Ghost in the Machine Info */}
        <div className="space-y-2">
          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#F5F3FF]">
            Hacktoberfest 2026
          </h4>
          <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
            Exploring the threshold where artificial neural networks meet gothic folklore and forgotten human narratives.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 bg-[#171923] border border-[#171923] hover:border-[#A78BFA]/50 text-[#F5F3FF] rounded text-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Repository</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#171923] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p>© 2026 Digital Séance. Open-source under Apache 2.0 License.</p>
        <p className="flex items-center gap-1 text-[#9CA3AF]">
          Summoned with <Heart className="w-3 h-3 text-[#D97757]" /> for Hacktoberfest Week 4
        </p>
      </div>
    </footer>
  );
};
