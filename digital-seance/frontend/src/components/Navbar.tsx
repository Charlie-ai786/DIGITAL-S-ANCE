import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Menu,
  X,
  BookOpen,
  Sliders,
  Info,
  Radio,
} from 'lucide-react';
import type { ModelStatus } from '../types';
import { soundService } from '../services/audio';

interface Props {
  modelStatus: ModelStatus | null;
  onOpenWhisper: () => void;
}

export const Navbar: React.FC<Props> = ({ modelStatus, onOpenWhisper }) => {
  const [audioActive, setAudioActive] = useState(soundService.getStatus());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const active = soundService.toggleMute();
    setAudioActive(active);
  };

  const navLinks = [
    { to: '/studio', label: 'Séance Studio', icon: Flame },
    { to: '/archive', label: 'Haunted Archive', icon: BookOpen },
    { to: '/settings', label: 'Machine Specs', icon: Sliders },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#08090D]/90 backdrop-blur-md border-b border-[#171923]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="relative p-2 rounded-lg bg-[#171923] border border-[#A78BFA]/30 group-hover:border-[#A78BFA] transition-all">
            <Flame className="w-5 h-5 text-[#A78BFA] candle-glow" />
            <div className="absolute inset-0 bg-[#A78BFA]/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-wider text-[#F5F3FF] group-hover:text-[#A78BFA] transition-colors">
              DIGITAL SÉANCE
            </span>
            <span className="hidden sm:block text-[10px] tracking-widest uppercase text-[#9CA3AF] -mt-1 font-mono">
              Ghost in the Machine
            </span>
          </div>
        </NavLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-xs font-serif tracking-wider uppercase transition-colors py-1 ${
                    isActive
                      ? 'text-[#39E6B0] border-b border-[#39E6B0]'
                      : 'text-[#9CA3AF] hover:text-[#F5F3FF]'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Action Icons & Status */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Final Whisper Shortcut Button */}
          <button
            onClick={onOpenWhisper}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-semibold tracking-wider uppercase bg-[#171923] border border-[#39E6B0]/40 text-[#39E6B0] rounded-lg hover:bg-[#39E6B0]/10 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#39E6B0]" />
            <span>Final Whisper</span>
          </button>

          {/* Sound Ambiance Toggle */}
          <button
            onClick={toggleSound}
            title={audioActive ? 'Mute Supernatural Ambience' : 'Enable Supernatural Ambience'}
            className={`p-2 rounded-lg border transition-all ${
              audioActive
                ? 'bg-[#A78BFA]/20 border-[#A78BFA]/40 text-[#A78BFA]'
                : 'bg-[#171923] border-[#171923] text-[#9CA3AF] hover:text-[#F5F3FF]'
            }`}
          >
            {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#171923] rounded-full border border-[#171923] text-[11px] font-mono">
            <Radio
              className={`w-3 h-3 ${
                modelStatus?.status === 'ready'
                  ? 'text-[#39E6B0] animate-pulse'
                  : modelStatus?.status === 'loading'
                  ? 'text-[#A78BFA] animate-spin'
                  : 'text-[#9CA3AF]'
              }`}
            />
            <span className="text-[#9CA3AF] capitalize">
              {modelStatus?.status === 'ready' ? 'Online' : modelStatus?.status || 'Offline'}
            </span>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg border border-[#171923] text-[#9CA3AF]"
          >
            {audioActive ? <Volume2 className="w-4 h-4 text-[#A78BFA]" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#9CA3AF] hover:text-[#F5F3FF] rounded-lg hover:bg-[#171923]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#11131B] border-b border-[#171923] px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-serif ${
                    isActive
                      ? 'bg-[#171923] text-[#39E6B0] border border-[#39E6B0]/30'
                      : 'text-[#9CA3AF] hover:bg-[#171923] hover:text-[#F5F3FF]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            );
          })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenWhisper();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#39E6B0]/15 border border-[#39E6B0]/40 text-[#39E6B0] text-sm font-serif font-semibold mt-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>Summon The Final Whisper</span>
          </button>
        </div>
      )}
    </header>
  );
};
