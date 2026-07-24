import { useState } from 'react';
import { useGetRoms, useGetPlatforms } from '@workspace/api-client-react';
import { GameCard } from '@/components/game-card';
import { useLocation } from 'wouter';
import { Filter, Search, SortDesc } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Browse() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialPlatform = searchParams.get('platformId') || '';

  const [search, setSearch] = useState(initialSearch);
  const [platformId, setPlatformId] = useState(initialPlatform);
  const [genre, setGenre] = useState('');

  const { data: roms, isLoading } = useGetRoms({ search, platformId, genre });
  const { data: platforms } = useGetPlatforms();

  const genres = ['Action', 'RPG', 'Platformer', 'Fighting', 'Racing', 'Sports', 'Puzzle', 'Shooter'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight neon-text">ROM Database</h1>
          <p className="text-muted-foreground mt-1">Browse and discover retro classics.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search database..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
          
          <select 
            value={platformId} 
            onChange={(e) => setPlatformId(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none appearance-none cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="">All Platforms</option>
            {platforms?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none appearance-none cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : roms && roms.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {roms.map((rom, i) => (
            <GameCard key={rom.id} rom={rom} index={i} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl"
        >
          <Filter className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No ROMs Found</h3>
          <p className="text-muted-foreground max-w-md">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
          <button 
            onClick={() => { setSearch(''); setPlatformId(''); setGenre(''); }}
            className="mt-6 text-primary hover:text-primary/80 font-medium text-sm underline underline-offset-4"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
