import { useGetRom, useCreateDownload } from '@workspace/api-client-react';
import { useRoute, Link } from 'wouter';
import { Star, Download, ArrowLeft, Gamepad2, Calendar, HardDrive, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RomDetails() {
  const [, params] = useRoute('/rom/:id');
  const romId = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: rom, isLoading } = useGetRom(romId, { query: { enabled: !!romId } });
  const download = useCreateDownload();

  let toast: any;
  try { toast = require('@/hooks/use-toast').useToast().toast; } catch (e) { toast = (m:any) => console.log(m); }

  const handleDownload = () => {
    if (!rom) return;
    download.mutate({ data: { romId: rom.id } }, {
      onSuccess: () => {
        toast({ title: "Download Started", description: `${rom.title} is now downloading.` });
      }
    });
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-white/5 rounded-3xl" />;
  }

  if (!rom) {
    return <div className="text-center py-20">ROM not found</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <Link href="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Database
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1"
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-panel border-white/10 relative shadow-2xl neon-glow">
            {rom.coverUrl ? (
              <img src={rom.coverUrl} alt={rom.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center p-6 text-center">
                <span className="font-black text-4xl opacity-30 uppercase break-words leading-none">{rom.title}</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/10">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-sm">{rom.rating.toFixed(1)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 md:col-span-2 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/20 text-primary border border-primary/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 neon-glow">
              {rom.platformName}
            </span>
            <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {rom.genre}
            </span>
            <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {rom.region}
            </span>
          </div>

          <h1 className="text-5xl font-black uppercase tracking-tight neon-text mb-6 leading-none">
            {rom.title}
          </h1>

          <div className="flex items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white/50" />
              <span className="font-mono">{rom.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-white/50" />
              <span className="font-mono">{rom.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-white/50" />
              <span className="font-mono">{rom.downloadCount} DLs</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-lg leading-relaxed text-white/80">
              {rom.description || `${rom.title} is a classic ${rom.genre.toLowerCase()} game released for the ${rom.platformName} in ${rom.year}. Experience the retro magic and relive the memories with this highly-rated title.`}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-4">
            <button 
              onClick={handleDownload}
              disabled={download.isPending}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-primary/90 transition-all hover:scale-105 neon-glow text-lg disabled:opacity-50 disabled:hover:scale-100"
            >
              <Download className="w-6 h-6" /> Download ROM
            </button>
            <button className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
