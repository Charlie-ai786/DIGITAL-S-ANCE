import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Trash2,
  Check,
  Clock,
  Cpu,
  FileText,
  GitBranch,
  RefreshCw,
  Bookmark,
  AlertCircle,
} from 'lucide-react';
import type { Story } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/audio';

export const StoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');

  // Alternate ending generation directly from details
  const [altLoading, setAltLoading] = useState(false);
  const [altError, setAltError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadStory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getStory(id);
        setStory(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve story from archive.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [id]);

  const handleCopy = () => {
    if (!story) return;
    const text = `${story.title}\n\n${story.generated_story}${
      story.alternate_ending ? `\n\n--- ALTERNATE ENDING ---\n${story.alternate_ending}` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!story) return;
    if (!window.confirm('Are you certain you wish to purge this chronicle from the Spirit Archive?')) {
      return;
    }
    try {
      await api.deleteStory(story.id);
      navigate('/archive');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete story');
    }
  };

  const handleGenerateAlternateEnding = async () => {
    if (!story) return;
    try {
      setAltLoading(true);
      setAltError(null);
      soundService.playSummonChime();

      const res = await api.generateAlternateEnding({
        original_input: story.original_input,
        original_story: story.generated_story,
        spirit: story.spirit,
        tone: story.tone,
        language: story.language,
      });

      // Save to backend story model
      await api.saveAlternateEnding(story.id, res.alternate_ending);

      setStory({
        ...story,
        alternate_ending: res.alternate_ending,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Alternate ending generation failed.';
      setAltError(msg);
    } finally {
      setAltLoading(false);
    }
  };

  const handleExportText = () => {
    if (!story) return;
    const content = `DIGITAL SÉANCE ARCHIVE
Title: ${story.title}
Spirit: ${story.spirit}
Tone: ${story.tone}
Language: ${story.language}
Recorded At: ${story.created_at || 'Unknown'}
Model: ${story.model_id}

ORIGINAL SEED MEMORY:
${story.original_input}

CHRONICLE:
${story.generated_story}

${story.alternate_ending ? `ALTERNATE ENDING:\n${story.alternate_ending}` : ''}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center text-[#9CA3AF]">
        <div className="w-12 h-12 rounded-full border-2 border-[#A78BFA]/30 border-t-[#39E6B0] animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono tracking-widest uppercase">Unsealing Chronicle...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#D97757] mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-[#F5F3FF]">Chronicle Not Found</h2>
        <p className="text-xs text-[#9CA3AF]">{error || 'This parchment has vanished or was never archived.'}</p>
        <Link
          to="/archive"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#171923] text-[#F5F3FF] rounded-lg text-xs hover:bg-[#A78BFA]/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Archive</span>
        </Link>
      </div>
    );
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'huge':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'large':
        return 'text-base sm:text-lg leading-relaxed';
      default:
        return 'text-sm sm:text-base leading-relaxed';
    }
  };

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-[#F5F3FF]">
      {/* Top Navigation & Controls */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#171923]">
        <Link
          to="/archive"
          className="inline-flex items-center gap-2 text-xs font-serif font-semibold text-[#9CA3AF] hover:text-[#39E6B0] uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
        </Link>

        {/* Font Size Selector */}
        <div className="flex items-center gap-1 bg-[#171923] p-1 rounded-lg border border-[#171923] text-xs">
          <button
            onClick={() => setFontSize('normal')}
            className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-[#A78BFA] text-[#08090D] font-bold' : 'text-[#9CA3AF]'}`}
          >
            A
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-2 py-0.5 rounded ${fontSize === 'large' ? 'bg-[#A78BFA] text-[#08090D] font-bold' : 'text-[#9CA3AF]'}`}
          >
            A+
          </button>
          <button
            onClick={() => setFontSize('huge')}
            className={`px-2 py-0.5 rounded ${fontSize === 'huge' ? 'bg-[#A78BFA] text-[#08090D] font-bold' : 'text-[#9CA3AF]'}`}
          >
            A++
          </button>
        </div>
      </div>

      {/* Story Document Chamber */}
      <article className="bg-[#11131B] border border-[#171923] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle candle glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#A78BFA]/10 to-transparent pointer-events-none" />

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9CA3AF] mb-6">
          <span className="px-2.5 py-0.5 rounded bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30">
            {story.spirit}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-[#39E6B0]/15 text-[#39E6B0] border border-[#39E6B0]/30">
            {story.tone}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-[#171923] text-[#F5F3FF]">
            {story.language}
          </span>

          <span className="ml-auto text-[11px] flex items-center gap-1 text-[#9CA3AF]">
            <Clock className="w-3.5 h-3.5 text-[#39E6B0]" />
            <span>{story.created_at ? new Date(story.created_at).toLocaleString() : ''}</span>
          </span>
        </div>

        {/* Story Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-wide text-[#F5F3FF] mb-8 leading-tight drop-shadow-[0_0_20px_rgba(167,139,250,0.2)]">
          {story.title}
        </h1>

        {/* Original Seed Memory Box */}
        <div className="mb-8 p-4 bg-[#171923]/70 rounded-xl border border-[#171923] text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-[#A78BFA] mb-1.5">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Original Seed Memory</span>
          </div>
          <p className="font-serif italic text-[#F5F3FF]/90 leading-relaxed">
            "{story.original_input}"
          </p>
        </div>

        {/* Story Body */}
        <div className={`font-serif text-[#F5F3FF]/95 space-y-6 ${getFontSizeClass()}`}>
          {story.generated_story.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="first-letter:text-3xl first-letter:font-bold first-letter:text-[#A78BFA] first-letter:mr-1">
              {paragraph.trim()}
            </p>
          ))}
        </div>

        {/* Alternate Ending Section */}
        {story.alternate_ending ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-6 bg-[#171923] border border-[#39E6B0]/40 rounded-xl relative spectral-glow"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-[#39E6B0] uppercase tracking-wider mb-3">
              <GitBranch className="w-4 h-4" />
              <span>Alternate Climax & Resolution</span>
            </div>
            <div className={`font-serif italic text-[#F5F3FF]/90 space-y-3 ${getFontSizeClass()}`}>
              {story.alternate_ending.split('\n\n').map((p, idx) => (
                <p key={idx}>{p.trim()}</p>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Generate Alternate Ending Prompt Button */
          <div className="mt-10 p-6 bg-[#171923]/50 border border-[#171923] rounded-xl text-center space-y-3">
            <h3 className="font-serif text-sm font-bold text-[#F5F3FF] tracking-wide uppercase">
              The Path Not Taken
            </h3>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              Want to see how this supernatural tale could have resolved differently? Summon an alternate ending using the open-weight model.
            </p>
            <button
              onClick={handleGenerateAlternateEnding}
              disabled={altLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#39E6B0]/15 hover:bg-[#39E6B0]/25 text-[#39E6B0] border border-[#39E6B0]/40 text-xs font-serif font-bold tracking-wider uppercase transition-all disabled:opacity-50"
            >
              {altLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
              <span>Conjure Alternate Ending</span>
            </button>
            {altError && <p className="text-xs text-[#D97757] mt-2">{altError}</p>}
          </div>
        )}

        {/* Model Spec Footer Tag */}
        <div className="mt-12 pt-6 border-t border-[#171923] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#39E6B0]" />
            <span>Model: {story.model_id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-[#171923] hover:bg-[#171923]/80 text-[#9CA3AF] hover:text-[#F5F3FF] border border-[#171923] text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#39E6B0]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Tale'}</span>
            </button>

            <button
              onClick={handleExportText}
              className="px-3 py-1.5 rounded-lg bg-[#171923] hover:bg-[#171923]/80 text-[#9CA3AF] hover:text-[#F5F3FF] border border-[#171923] text-xs flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export .txt</span>
            </button>

            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-[#D97757]/15 hover:bg-[#D97757]/25 text-[#D97757] border border-[#D97757]/30 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
