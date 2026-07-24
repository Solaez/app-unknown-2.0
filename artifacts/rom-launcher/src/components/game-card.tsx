import { Star, Download } from 'lucide-react';
import { Rom, useCreateDownload } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export function GameCard({ rom, index }: { rom: Rom, index?: number }) {
  const [, setLocation] = useLocation();

  // Ignore useToast if it fails, fallback to alert
  let toast: any;
  try {
    const hook = require('@/hooks/use-toast');
    toast = hook.useToast().toast;
  } catch (e) {
    toast = (msg: any) => console.log(msg);
  }

  const download = useCreateDownload();
  
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    download.mutate({ data: { romId: rom.id } }, {
      onSuccess: () => {
        if (toast) {
          toast({ title: "Download Started", description: `${rom.title} is now downloading.` });
        }
      }
    });
  };

  const colors = ['from-purple-500/40 to-blue-500/40', 'from-blue-500/40 to-cyan-500/40', 'from-cyan-500/40 to-emerald-500/40', 'from-pink-500/40 to-purple-500/40'];
  const gradient = colors[rom.id % colors.length];

  return (
    <motion.div
      onClick={() => setLocation(`/rom/${rom.id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index ? index * 0.05 : 0 }}
      className="group relative rounded-xl overflow-hidden glass-panel hover:-translate-y-2 transition-all duration-300 neon-glow-hover h-full flex flex-col cursor-pointer"
    >
      <div className="aspect-[3/4] w-full relative shrink-0">
        {rom.coverUrl ? (
          <img src={rom.coverUrl} alt={rom.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center p-4 text-center transition-transform duration-500 group-hover:scale-110`}>
            <span className="font-bold text-3xl opacity-30 tracking-tighter uppercase">{rom.platformName}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
        
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1 border border-white/10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium">{rom.rating.toFixed(1)}</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm z-10">
          <button 
            onClick={handleDownload}
            disabled={download.isPending}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform neon-glow disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1 bg-black/40 relative z-0">
        <h3 className="font-bold leading-tight truncate mb-2 text-white">{rom.title}</h3>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="bg-white/10 px-2 py-1 rounded text-white uppercase font-mono">{rom.platformName}</span>
          <span className="font-mono">{rom.size}</span>
        </div>
      </div>
    </motion.div>
  );
}
