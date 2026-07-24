import { useGetLibrary } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Play, Clock, Library as LibraryIcon } from 'lucide-react';
import { useState } from 'react';

export default function Library() {
  const { data: library, isLoading } = useGetLibrary();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight neon-text flex items-center gap-3">
            <LibraryIcon className="w-8 h-8 text-primary" /> My Library
          </h1>
          <p className="text-muted-foreground mt-1">Your installed collection, ready to play.</p>
        </div>
        <div className="text-sm font-mono text-muted-foreground bg-black/40 px-4 py-2 rounded-full border border-white/5">
          {library?.length || 0} Games Installed
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : library && library.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {library.map((entry, i) => {
            const colors = ['from-emerald-500/40 to-teal-500/40', 'from-blue-500/40 to-indigo-500/40', 'from-purple-500/40 to-fuchsia-500/40'];
            const gradient = colors[entry.id % colors.length];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onMouseEnter={() => setHoveredId(entry.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative rounded-xl overflow-hidden glass-panel hover:-translate-y-2 transition-all duration-300 neon-glow-cyan cursor-pointer h-full flex flex-col"
              >
                <div className="aspect-[3/4] w-full relative shrink-0">
                  {entry.coverUrl ? (
                    <img src={entry.coverUrl} alt={entry.romTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center p-4 text-center`}>
                      <span className="font-bold text-2xl opacity-40 uppercase">{entry.platformName}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-sm z-10 gap-4">
                    <button className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform neon-glow-cyan shadow-xl">
                      <Play className="w-8 h-8 ml-1" />
                    </button>
                    <span className="font-bold tracking-widest uppercase text-sm">Launch</span>
                  </div>

                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono border border-white/10 text-white/70">
                    {entry.fileSize}
                  </div>
                </div>
                
                <div className="p-4 bg-black/40 flex-1 flex flex-col z-0">
                  <h3 className="font-bold leading-tight truncate text-white">{entry.romTitle}</h3>
                  <div className="text-xs text-primary mt-1 uppercase tracking-wider">{entry.platformName}</div>
                  
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{entry.timesPlayed} plays</span>
                    </div>
                    {entry.lastPlayedAt ? (
                      <span>{new Date(entry.lastPlayedAt).toLocaleDateString()}</span>
                    ) : (
                      <span>Never</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border-dashed">
          <LibraryIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
          <h3 className="text-2xl font-bold mb-2">Library Empty</h3>
          <p className="text-muted-foreground max-w-md">
            You haven't installed any ROMs yet. Head over to the database to start your collection.
          </p>
        </div>
      )}
    </div>
  );
}
