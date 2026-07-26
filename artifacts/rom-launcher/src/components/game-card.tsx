import { Star, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import type { FlatRom } from '@/types/rom-types';

export function GameCard({ rom, index }: { rom: FlatRom; index?: number }) {
  const [, setLocation] = useLocation();

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (rom.downloadUrl) {
      window.open(rom.downloadUrl, '_blank', 'noopener');
    }
  };

  return (
    <motion.div
      onClick={() => setLocation(`/rom/${encodeURIComponent(rom.id)}`)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.04 }}
      className="group relative rounded-xl overflow-hidden glass-panel hover:-translate-y-1.5 transition-all duration-300 neon-glow-hover flex flex-col cursor-pointer"
    >
      {/* Cover */}
      <div className="aspect-[3/4] w-full relative shrink-0 overflow-hidden">
        {rom.coverUrl ? (
          <img
            src={rom.coverUrl}
            alt={rom.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-4 text-center transition-transform duration-500 group-hover:scale-105"
            style={{ background: rom.consoleGradient }}
          >
            <span className="font-black text-2xl text-white/40 uppercase leading-tight">
              {rom.consoleShortName}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

        {/* Rating */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 border border-white/10">
          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
          <span className="text-[11px] font-bold">{rom.rating}</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm z-10">
          <button
            onClick={handleDownload}
            className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform neon-glow"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 bg-black/40">
        <h3 className="font-bold text-[13px] leading-tight truncate mb-1.5 text-white">{rom.title}</h3>
        <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
          <span
            className="px-2 py-0.5 rounded text-white font-mono text-[10px] uppercase font-bold"
            style={{ background: rom.consoleGradient }}
          >
            {rom.consoleShortName}
          </span>
          <span className="font-mono opacity-70">{rom.size}</span>
        </div>
      </div>
    </motion.div>
  );
}
