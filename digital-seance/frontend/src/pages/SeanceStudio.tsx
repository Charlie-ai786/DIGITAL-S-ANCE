import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  RefreshCw,
  Copy,
  BookmarkPlus,
  Compass,
  Eye,
  Ghost,
  Cpu,
  Trash2,
  Clock,
  Check,
  AlertCircle,
  FileText,
  GitBranch,
  CheckCircle2,
} from 'lucide-react';
import type {
  SpiritName,
  StoryTone,
  StoryLength,
  StoryLanguage,
  StoryGenerateResponse,
  ModelStatus,
} from '../types';
import { api } from '../services/api';
import { soundService } from '../services/audio';

interface Props {
  modelStatus: ModelStatus | null;
  onRefreshModel: () => void;
}

const SPIRITS: {
  name: SpiritName;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    name: 'The Forgotten One',
    tagline: 'Mysterious and melancholic',
    description: 'Speaks of silence, rotted promises, dust, and names lost to time.',
    icon: Ghost,
    color: '#A78BFA',
  },
  {
    name: 'The Shadow',
    tagline: 'Dark and frightening',
    description: 'Lingers in unlit corners; builds visceral dread and suffocating dread.',
    icon: Eye,
    color: '#D97757',
  },
  {
    name: 'The Lost Traveler',
    tagline: 'Supernatural mystery',
    description: 'Wanders phantom train lines, fogbound roads, and eerie threshold spaces.',
    icon: Compass,
    color: '#39E6B0',
  },
  {
    name: 'The Memory Keeper',
    tagline: 'Emotional and nostalgic',
    description: 'Preserves sepia relics, tragic devotion, pressed roses, and ghostly grief.',
    icon: FileText,
    color: '#F5F3FF',
  },
  {
    name: 'The Digital Phantom',
    tagline: 'Retro computer horror',
    description: 'An anomaly inside the circuit boards, green phosphor displays, and tape drives.',
    icon: Cpu,
    color: '#39E6B0',
  },
];

const TONES: StoryTone[] = [
  'Psychological horror',
  'Gothic mystery',
  'Supernatural suspense',
  'Melancholic remembrance',
  'Cosmic horror',
];

const LENGTHS: { id: StoryLength; label: string; desc: string }[] = [
  { id: 'short', label: 'Short', desc: '~300 words' },
  { id: 'medium', label: 'Medium', desc: '~600 words' },
  { id: 'long', label: 'Long', desc: '~950 words' },
];

const EXAMPLE_PROMPTS = [
  "I found an old photograph in my grandfather's room. There was a person standing behind him, but nobody in the family recognized that face.",
  "Every night at exactly 3:14 AM, the antique grandfather clock in the hallway ticks backward for ten seconds.",
  "A cassette tape labeled 'DO NOT PLAY - 1988' was tucked inside the floorboards of our newly bought cottage.",
  "My sister found a porcelain doll buried in our garden. Whenever we turn off the bedroom light, the music box beside it starts winding itself.",
];

export const SeanceStudio: React.FC<Props> = ({ modelStatus, onRefreshModel }) => {
  const [prompt, setPrompt] = useState('');
  const [spirit, setSpirit] = useState<SpiritName>('The Forgotten One');
  const [tone, setTone] = useState<StoryTone>('Psychological horror');
  const [length, setLength] = useState<StoryLength>('medium');
  const [language, setLanguage] = useState<StoryLanguage>('English');
  const [temperature, setTemperature] = useState<number>(0.7);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StoryGenerateResponse | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Alternate ending state
  const [alternateEnding, setAlternateEnding] = useState<string | null>(null);
  const [altLoading, setAltLoading] = useState(false);
  const [altError, setAltError] = useState<string | null>(null);

  const charCount = prompt.length;
  const isInputValid = charCount >= 5 && charCount <= 5000;

  const handleSummon = async () => {
    if (!isInputValid) {
      setError('Please provide at least 5 characters for the seed memory.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setAlternateEnding(null);
      setSavedSuccess(false);
      soundService.playSummonChime();

      const response = await api.generateStory({
        prompt: prompt.trim(),
        spirit,
        length,
        tone,
        language,
        temperature,
      });

      setResult(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Story generation failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!result) return;
    try {
      await api.saveStory({
        title: result.title,
        original_input: prompt,
        generated_story: result.story,
        spirit: result.spirit,
        tone: result.tone,
        language: result.language,
        model_id: result.model_id,
        duration_seconds: result.duration_seconds,
        alternate_ending: alternateEnding,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save to Haunted Archive.';
      setError(msg);
    }
  };

  const handleCopyStory = () => {
    if (!result) return;
    const fullText = `${result.title}\n\n${result.story}${
      alternateEnding ? `\n\n--- ALTERNATE ENDING ---\n${alternateEnding}` : ''
    }`;
    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleGenerateAlternateEnding = async () => {
    if (!result) return;
    try {
      setAltLoading(true);
      setAltError(null);
      soundService.playSummonChime();

      const res = await api.generateAlternateEnding({
        original_input: prompt,
        original_story: result.story,
        spirit: result.spirit,
        tone: result.tone,
        language: result.language,
        temperature: temperature + 0.05,
      });

      setAlternateEnding(res.alternate_ending);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Alternate ending generation failed.';
      setAltError(msg);
    } finally {
      setAltLoading(false);
    }
  };

  const handleExportText = () => {
    if (!result) return;
    const text = `DIGITAL SÉANCE ARCHIVE ENTRY
Title: ${result.title}
Spirit: ${result.spirit}
Tone: ${result.tone}
Language: ${result.language}
Model: ${result.model_id}
Duration: ${result.duration_seconds}s

SEED MEMORY:
${prompt}

STORY:
${result.story}

${alternateEnding ? `ALTERNATE ENDING:\n${alternateEnding}` : ''}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#F5F3FF]">
      {/* Page Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#39E6B0] mb-1 justify-center sm:justify-start">
          <Flame className="w-4 h-4 text-[#A78BFA] candle-glow" />
          <span>Séance Studio // The Summoning</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide text-[#F5F3FF]">
          Incantation Chamber
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 font-serif italic">
          Place your memory upon the altar. Select a spirit guide to transmute reality into a ghost story.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input and Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Seed Memory Text Input */}
          <div className="bg-[#11131B] border border-[#171923] rounded-xl p-5 shadow-xl relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Memory, Diary Fragment, or Artifact Seed</span>
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono ${charCount > 4800 ? 'text-[#D97757]' : 'text-[#9CA3AF]'}`}>
                  {charCount} / 5000
                </span>
                {prompt && (
                  <button
                    onClick={() => setPrompt('')}
                    className="text-[#9CA3AF] hover:text-[#D97757] p-1 text-xs rounded transition-colors"
                    title="Clear text"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a memory, a photograph, a cold room, an unfinished sentence, or an uncanny real-life coincidence..."
              rows={5}
              className="w-full bg-[#171923]/90 border border-[#171923] rounded-lg p-3 text-sm text-[#F5F3FF] placeholder-[#9CA3AF]/50 focus:border-[#A78BFA] focus:ring-1 focus:ring-[#A78BFA] outline-none transition-all font-sans leading-relaxed resize-y"
            />

            {/* Example prompt pills */}
            <div className="mt-3">
              <span className="text-[11px] text-[#9CA3AF] block mb-1.5 font-mono">
                Or invoke from forgotten fragments:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROMPTS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(ex)}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#171923] hover:bg-[#A78BFA]/20 text-[#9CA3AF] hover:text-[#F5F3FF] border border-[#171923] hover:border-[#A78BFA]/30 transition-all text-left truncate max-w-xs"
                    title={ex}
                  >
                    "{ex.slice(0, 42)}..."
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spirit Selection */}
          <div className="bg-[#11131B] border border-[#171923] rounded-xl p-5 shadow-xl">
            <label className="text-xs font-mono uppercase tracking-wider text-[#39E6B0] block mb-3 flex items-center gap-1.5">
              <Ghost className="w-3.5 h-3.5" />
              <span>Choose Guiding Spirit</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SPIRITS.map((s) => {
                const Icon = s.icon;
                const isSelected = spirit === s.name;
                return (
                  <button
                    key={s.name}
                    onClick={() => setSpirit(s.name)}
                    className={`text-left p-3 rounded-lg border transition-all relative ${
                      isSelected
                        ? 'border-[#A78BFA] bg-[#A78BFA]/10 text-[#F5F3FF] shadow-sm shadow-[#A78BFA]/20'
                        : 'border-[#171923] bg-[#171923]/60 text-[#9CA3AF] hover:border-[#A78BFA]/30 hover:text-[#F5F3FF]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-[#A78BFA]" />
                      <span className="font-serif font-bold text-xs tracking-wide text-[#F5F3FF]">
                        {s.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#39E6B0] font-mono mb-0.5">{s.tagline}</p>
                    <p className="text-[11px] text-[#9CA3AF] leading-tight">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Séance Parameters: Tone, Length, Language, Temperature */}
          <div className="bg-[#11131B] border border-[#171923] rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Incantation Parameters</span>
            </h3>

            {/* Tone Selection */}
            <div>
              <label className="text-[11px] text-[#9CA3AF] block mb-1.5 font-mono">Atmospheric Tone:</label>
              <div className="flex flex-wrap gap-1.5">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded text-xs transition-all ${
                      tone === t
                        ? 'bg-[#39E6B0]/20 border border-[#39E6B0] text-[#39E6B0] font-semibold'
                        : 'bg-[#171923] border border-[#171923] text-[#9CA3AF] hover:text-[#F5F3FF]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Length & Language Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Length */}
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1.5 font-mono">Tale Length:</label>
                <div className="grid grid-cols-3 gap-1 bg-[#171923] p-1 rounded-lg border border-[#171923]">
                  {LENGTHS.map((len) => (
                    <button
                      key={len.id}
                      onClick={() => setLength(len.id)}
                      className={`py-1 text-xs rounded transition-colors text-center ${
                        length === len.id
                          ? 'bg-[#A78BFA] text-[#08090D] font-bold'
                          : 'text-[#9CA3AF] hover:text-[#F5F3FF]'
                      }`}
                    >
                      {len.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1.5 font-mono">Tongue / Language:</label>
                <div className="grid grid-cols-2 gap-1 bg-[#171923] p-1 rounded-lg border border-[#171923]">
                  <button
                    onClick={() => setLanguage('English')}
                    className={`py-1 text-xs rounded transition-colors text-center ${
                      language === 'English'
                        ? 'bg-[#A78BFA] text-[#08090D] font-bold'
                        : 'text-[#9CA3AF] hover:text-[#F5F3FF]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('Hindi')}
                    className={`py-1 text-xs rounded transition-colors text-center ${
                      language === 'Hindi'
                        ? 'bg-[#A78BFA] text-[#08090D] font-bold'
                        : 'text-[#9CA3AF] hover:text-[#F5F3FF]'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>
            </div>

            {/* Creative Temperature Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] mb-1">
                <span>Spectral Variance (Temperature):</span>
                <span className="text-[#39E6B0]">{temperature}</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={1.1}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#A78BFA] bg-[#171923] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9CA3AF]/60 font-mono mt-0.5">
                <span>Disciplined (0.3)</span>
                <span>Uncanny (0.7)</span>
                <span>Wild Delirium (1.1)</span>
              </div>
            </div>
          </div>

          {/* Primary Summon Button */}
          <button
            onClick={handleSummon}
            disabled={loading || !isInputValid}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#A78BFA] via-[#8B5CF6] to-[#39E6B0] text-[#08090D] font-serif font-black text-sm tracking-widest uppercase shadow-xl shadow-purple-950/50 hover:opacity-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#08090D]" />
                <span>Channelling the Open-Weight Machine...</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5 text-[#08090D] group-hover:scale-125 transition-transform" />
                <span>SUMMON THE STORY</span>
              </>
            )}
          </button>

          {/* Error Notice */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#D97757]/15 border border-[#D97757]/40 rounded-xl text-xs text-[#D97757] flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Séance Interrupted</p>
                <p>{error}</p>
                {modelStatus?.status === 'unloaded' && (
                  <button
                    onClick={async () => {
                      await api.loadModel();
                      onRefreshModel();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#D97757]/20 border border-[#D97757]/40 text-[#F5F3FF] rounded text-xs hover:bg-[#D97757]/30 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Initialize Model Weights</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Reading Panel & Output (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#11131B] border border-[#171923] rounded-xl p-6 shadow-2xl min-h-[580px] flex flex-col justify-between relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#A78BFA]/10 to-transparent pointer-events-none" />

            {/* Loading Atmosphere Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-[#08090D]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-[#A78BFA]/30 border-t-[#39E6B0] animate-spin" />
                  <Flame className="w-8 h-8 text-[#A78BFA] candle-glow absolute inset-0 m-auto" />
                </div>
                <h3 className="font-serif text-lg text-[#F5F3FF] tracking-wider uppercase">
                  Summoning {spirit}
                </h3>
                <p className="text-xs text-[#39E6B0] font-mono mt-1">
                  Model: {modelStatus?.model_id || 'Qwen/Qwen2.5-3B-Instruct'}
                </p>
                <p className="text-xs text-[#9CA3AF] max-w-xs mt-3 italic">
                  Attuning neural layers to your memory... Running local Hugging Face Transformers inference.
                </p>
              </div>
            )}

            {/* Generated Story Content */}
            {result ? (
              <div className="space-y-5">
                {/* Story Header */}
                <div className="border-b border-[#171923] pb-4">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30">
                      {result.spirit}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#39E6B0]/15 text-[#39E6B0] border border-[#39E6B0]/30">
                      {result.tone}
                    </span>
                    <span className="text-[11px] font-mono text-[#9CA3AF] ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#39E6B0]" />
                      <span>{result.duration_seconds}s</span>
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#F5F3FF] tracking-wide leading-tight">
                    {result.title}
                  </h2>
                </div>

                {/* Story Body */}
                <div className="text-sm font-serif text-[#F5F3FF]/90 leading-relaxed space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  {result.story.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-[#A78BFA]">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>

                {/* Alternate Ending Display if Generated */}
                {alternateEnding && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[#171923] border border-[#39E6B0]/40 rounded-xl relative mt-4 spectral-glow"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-[#39E6B0] mb-2">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>ALTERNATE ENDING (Manifested by {result.spirit})</span>
                    </div>
                    <div className="text-xs font-serif italic text-[#F5F3FF]/90 leading-relaxed space-y-2">
                      {alternateEnding.split('\n\n').map((p, idx) => (
                        <p key={idx}>{p.trim()}</p>
                      ))}
                    </div>
                  </motion.div>
                )}

                {altError && (
                  <div className="p-2 text-xs text-[#D97757] bg-[#D97757]/10 rounded border border-[#D97757]/20">
                    {altError}
                  </div>
                )}

                {/* Story Actions Toolbar */}
                <div className="pt-4 border-t border-[#171923] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyStory}
                      className="px-3 py-1.5 rounded-lg bg-[#171923] hover:bg-[#171923]/80 text-[#9CA3AF] hover:text-[#F5F3FF] border border-[#171923] text-xs flex items-center gap-1.5 transition-colors"
                      title="Copy Story"
                    >
                      {copySuccess ? <Check className="w-3.5 h-3.5 text-[#39E6B0]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleSaveToArchive}
                      disabled={savedSuccess}
                      className="px-3 py-1.5 rounded-lg bg-[#171923] hover:bg-[#171923]/80 text-[#A78BFA] border border-[#A78BFA]/30 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Save to Haunted Archive"
                    >
                      {savedSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#39E6B0]" />
                          <span className="text-[#39E6B0]">Archived</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleExportText}
                      className="px-2.5 py-1.5 rounded-lg bg-[#171923] text-[#9CA3AF] hover:text-[#F5F3FF] border border-[#171923] text-xs flex items-center gap-1 transition-colors"
                      title="Export as Text file"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateAlternateEnding}
                      disabled={altLoading}
                      className="px-3 py-1.5 rounded-lg bg-[#39E6B0]/15 hover:bg-[#39E6B0]/25 text-[#39E6B0] border border-[#39E6B0]/40 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {altLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                      <span>{alternateEnding ? 'Regenerate Ending' : 'Alternate Ending'}</span>
                    </button>

                    <button
                      onClick={handleSummon}
                      className="px-3 py-1.5 rounded-lg bg-[#171923] text-[#9CA3AF] hover:text-[#F5F3FF] border border-[#171923] text-xs flex items-center gap-1 transition-colors"
                      title="Generate Another Version"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle Empty State */
              <div className="flex flex-col items-center justify-center my-auto text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#171923] border border-[#171923] flex items-center justify-center text-[#A78BFA] shadow-lg">
                  <Ghost className="w-8 h-8 opacity-40 candle-glow" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#F5F3FF] font-semibold tracking-wide">
                    The Scroll Lies Dormant
                  </h3>
                  <p className="text-xs text-[#9CA3AF] max-w-sm mt-1">
                    Provide a fragment on the altar and summon the narrative. Your tale will manifest here in pure open-weight prose.
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-[11px] font-mono text-[#39E6B0]/80">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Real Transformers Inference</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
