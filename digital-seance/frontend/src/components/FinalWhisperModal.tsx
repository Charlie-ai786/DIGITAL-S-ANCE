import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Volume2, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'Forgotten memory', label: 'Forgotten Memory', desc: 'Echoes buried under dust and rusted lockets.' },
  { id: 'Midnight warning', label: 'Midnight Warning', desc: 'An omen whispered at the witching hour.' },
  { id: 'Lost soul', label: 'Lost Soul', desc: 'Murmurs from one who stepped between thresholds.' },
  { id: 'Digital ghost', label: 'Digital Ghost', desc: 'Corrupted signals echoing through silicon and magnetic tape.' },
  { id: 'Strange coincidence', label: 'Strange Coincidence', desc: 'Terrifying synchronicities spanning centuries.' },
];

export const FinalWhisperModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const [whisper, setWhisper] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummonWhisper = async () => {
    try {
      setLoading(true);
      setError(null);
      soundService.playSummonChime();

      const res = await api.summonWhisper({
        category: selectedCategory,
        language: language,
      });

      setWhisper(res.whisper);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'The spirits remained silent.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!whisper) return;
    navigator.clipboard.writeText(whisper);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#08090D]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#11131B] border border-[#171923] rounded-xl shadow-2xl shadow-purple-950/40 p-6 z-10 overflow-hidden"
        >
          {/* Subtle occult corner runes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#39E6B0]/10 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#F5F3FF] p-1.5 rounded-lg hover:bg-[#171923] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[#39E6B0] text-xs font-mono tracking-widest uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>The Final Whisper</span>
            </div>
            <h2 className="text-2xl font-serif text-[#F5F3FF] tracking-wide">
              Transmit into the Ether
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Channel a fleeting, cryptic omen directly from the open-weight machine intelligence.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#9CA3AF]">
              Select Category of Omens:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left p-3 rounded-lg border text-xs transition-all ${
                    selectedCategory === cat.id
                      ? 'border-[#39E6B0] bg-[#39E6B0]/10 text-[#F5F3FF] shadow-sm shadow-[#39E6B0]/20'
                      : 'border-[#171923] bg-[#171923]/60 text-[#9CA3AF] hover:border-[#A78BFA]/40 hover:text-[#F5F3FF]'
                  }`}
                >
                  <p className="font-semibold text-sm">{cat.label}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-snug">{cat.desc}</p>
                </button>
              ))}
            </div>

            {/* Language toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#9CA3AF]">Tongue of the Spirit:</span>
              <div className="flex items-center gap-1 bg-[#171923] p-1 rounded-lg border border-[#171923]">
                <button
                  onClick={() => setLanguage('English')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    language === 'English' ? 'bg-[#A78BFA] text-[#08090D] font-semibold' : 'text-[#9CA3AF] hover:text-[#F5F3FF]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('Hindi')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    language === 'Hindi' ? 'bg-[#A78BFA] text-[#08090D] font-semibold' : 'text-[#9CA3AF] hover:text-[#F5F3FF]'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>
          </div>

          {/* Summon Button */}
          <button
            onClick={handleSummonWhisper}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#A78BFA] to-[#39E6B0] text-[#08090D] font-serif font-bold text-sm tracking-widest uppercase rounded-lg shadow-lg shadow-purple-900/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Attuning to the Void...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Hear the Whisper</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-[#D97757]/15 border border-[#D97757]/40 rounded-lg text-xs text-[#D97757] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Whisper Inaudible</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Whisper Result */}
          {whisper && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-[#171923] border border-[#39E6B0]/30 rounded-xl relative overflow-hidden spectral-glow"
            >
              <div className="flex items-center justify-between text-xs text-[#39E6B0] mb-2 font-mono">
                <span>[ {selectedCategory.toUpperCase()} ]</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[#9CA3AF] hover:text-[#F5F3FF] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#39E6B0]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Captured' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-base font-serif italic text-[#F5F3FF] leading-relaxed">
                "{whisper}"
              </p>
              <p className="text-[10px] text-[#9CA3AF]/70 mt-3 border-t border-[#11131B] pt-2 italic">
                * Fictional atmospheric fragment generated by open-weight artificial intelligence.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

