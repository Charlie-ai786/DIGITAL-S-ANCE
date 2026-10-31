import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Trash2,
  Copy,
  ChevronRight,
  Flame,
  Ghost,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { Story, SpiritName, StoryTone } from '../types';
import { api } from '../services/api';

const SPIRIT_FILTERS: (SpiritName | 'all')[] = [
  'all',
  'The Forgotten One',
  'The Shadow',
  'The Lost Traveler',
  'The Memory Keeper',
  'The Digital Phantom',
];

const TONE_FILTERS: (StoryTone | 'all')[] = [
  'all',
  'Psychological horror',
  'Gothic mystery',
  'Supernatural suspense',
  'Melancholic remembrance',
  'Cosmic horror',
];

export const HauntedArchive: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpirit, setSelectedSpirit] = useState<string>('all');
  const [selectedTone, setSelectedTone] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchArchive = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStories({
        search: searchTerm || undefined,
        spirit: selectedSpirit !== 'all' ? selectedSpirit : undefined,
        tone: selectedTone !== 'all' ? selectedTone : undefined,
        sort: sortOrder,
      });
      setStories(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve archive.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, [searchTerm, selectedSpirit, selectedTone, sortOrder]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you certain you wish to purge this chronicle from the Spirit Archive?')) {
      return;
    }

    try {
      await api.deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete story');
    }
  };

  const handleCopy = (story: Story, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `${story.title}\n\n${story.generated_story}${
      story.alternate_ending ? `\n\n--- ALTERNATE ENDING ---\n${story.alternate_ending}` : ''
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#F5F3FF]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#39E6B0] mb-1">
            <BookOpen className="w-4 h-4 text-[#39E6B0]" />
            <span>The Spirit Archive // Persistent Chronicles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F3FF] tracking-wide">
            Haunted Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 font-serif italic">
            Chronicles etched into persistent SQLite storage. Resurrect past incantations anytime.
          </p>
        </div>

        <Link
          to="/studio"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#A78BFA] to-[#39E6B0] text-[#08090D] font-serif font-bold text-xs tracking-wider uppercase shadow-lg shadow-purple-950/40 hover:opacity-95 transition-all self-start md:self-auto"
        >
          <Flame className="w-4 h-4 text-[#08090D]" />
          <span>Summon New Story</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#11131B] border border-[#171923] rounded-xl p-4 mb-8 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chronicles by title or memory fragments..."
              className="w-full bg-[#171923] border border-[#171923] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F3FF] placeholder-[#9CA3AF]/60 focus:border-[#A78BFA] outline-none transition-colors"
            />
          </div>

          {/* Spirit Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-[#9CA3AF] font-mono whitespace-nowrap">Spirit:</span>
            <select
              value={selectedSpirit}
              onChange={(e) => setSelectedSpirit(e.target.value)}
              className="bg-[#171923] border border-[#171923] text-xs text-[#F5F3FF] rounded-lg px-3 py-2 outline-none focus:border-[#A78BFA]"
            >
              <option value="all">All Spirits</option>
              {SPIRIT_FILTERS.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Tone Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-[#9CA3AF] font-mono whitespace-nowrap">Tone:</span>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="bg-[#171923] border border-[#171923] text-xs text-[#F5F3FF] rounded-lg px-3 py-2 outline-none focus:border-[#A78BFA]"
            >
              <option value="all">All Tones</option>
              {TONE_FILTERS.filter((t) => t !== 'all').map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-[#9CA3AF] font-mono whitespace-nowrap">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-[#171923] border border-[#171923] text-xs text-[#F5F3FF] rounded-lg px-3 py-2 outline-none focus:border-[#A78BFA]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-[#D97757]/15 border border-[#D97757]/40 rounded-xl text-xs text-[#D97757] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#A78BFA]/30 border-t-[#39E6B0] animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-[#9CA3AF] uppercase tracking-widest">
            Unsealing Vault Parchments...
          </p>
        </div>
      ) : stories.length > 0 ? (
        /* Stories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#11131B] border border-[#171923] hover:border-[#A78BFA]/40 rounded-xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-purple-950/20"
            >
              <div>
                {/* Badges & Meta */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/25">
                    {story.spirit}
                  </span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">
                    {story.created_at ? new Date(story.created_at).toLocaleDateString() : 'Recorded'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-lg text-[#F5F3FF] group-hover:text-[#39E6B0] transition-colors mb-2 line-clamp-1">
                  {story.title}
                </h3>

                {/* Original Memory Excerpt */}
                <p className="text-[11px] font-mono text-[#9CA3AF] italic mb-3 line-clamp-2 border-l-2 border-[#171923] pl-2">
                  "{story.original_input}"
                </p>

                {/* Story Excerpt */}
                <p className="text-xs font-serif text-[#F5F3FF]/80 leading-relaxed line-clamp-4">
                  {story.generated_story}
                </p>

                {story.alternate_ending && (
                  <div className="mt-3 p-2 bg-[#171923] rounded border border-[#39E6B0]/30 text-[10px] font-mono text-[#39E6B0] flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    <span>Includes Alternate Ending</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-[#171923] flex items-center justify-between text-xs">
                <Link
                  to={`/archive/${story.id}`}
                  className="inline-flex items-center gap-1 text-[#A78BFA] hover:text-[#39E6B0] font-serif font-semibold tracking-wider uppercase transition-colors"
                >
                  <span>Open Story</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleCopy(story, e)}
                    className="p-1.5 rounded hover:bg-[#171923] text-[#9CA3AF] hover:text-[#F5F3FF] transition-colors"
                    title="Copy story"
                  >
                    {copiedId === story.id ? (
                      <Check className="w-3.5 h-3.5 text-[#39E6B0]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDelete(story.id, e)}
                    className="p-1.5 rounded hover:bg-[#D97757]/20 text-[#9CA3AF] hover:text-[#D97757] transition-colors"
                    title="Purge chronicle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#171923] border border-[#171923] flex items-center justify-center text-[#A78BFA] mx-auto">
            <Ghost className="w-8 h-8 opacity-40 candle-glow" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#F5F3FF]">
            The Vault Is Empty
          </h3>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            No supernatural chronicles match your search or have been archived yet. Step into the Séance Studio to summon your first tale.
          </p>
          <div className="pt-2">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#A78BFA] text-[#08090D] font-serif font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              <Flame className="w-4 h-4 text-[#08090D]" />
              <span>Begin a Séance</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
