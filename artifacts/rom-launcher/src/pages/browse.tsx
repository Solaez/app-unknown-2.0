import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useAllRoms, useConsoles } from '@/hooks/use-rom-data';
import { GameCard } from '@/components/game-card';

export default function Browse() {
  const [locationHref] = useLocation();
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [consoleId, setConsoleId] = useState(searchParams.get('platformId') || '');
  const [genre, setGenre] = useState('');

  const { data: roms, isLoading } = useAllRoms({ search, consoleId, genre });
  const { data: consoles } = useConsoles();

  // Collect unique genres from all roms
  const { data: allRoms } = useAllRoms();
  const genres = allRoms
    ? [...new Set(allRoms.map((r) => r.genre))].sort()
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight neon-text">ROM Database</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {roms?.length ?? 0} ROMs found across {consoles?.length ?? 0} platforms
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ROMs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all w-48"
            />
          </div>

          {/* Platform filter */}
          <div className="relative">
            <select
              value={consoleId}
              onChange={(e) => setConsoleId(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none appearance-none pr-8 cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="">All Platforms</option>
              {consoles?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <SlidersHorizontal className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Genre filter */}
          <div className="relative">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none appearance-none pr-8 cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <SlidersHorizontal className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {(search || consoleId || genre) && (
            <button
              onClick={() => { setSearch(''); setConsoleId(''); setGenre(''); }}
              className="text-[12px] text-muted-foreground hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : roms && roms.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {roms.map((rom, i) => (
            <GameCard key={rom.id} rom={rom} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl"
        >
          <Filter className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-lg font-bold mb-1">No ROMs Found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={() => { setSearch(''); setConsoleId(''); setGenre(''); }}
            className="mt-4 text-primary hover:text-primary/80 text-sm underline underline-offset-4"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
