import { useRoute, Link } from 'wouter';
import { Star, Download, ArrowLeft, Calendar, HardDrive, Users, ExternalLink, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRomById } from '@/hooks/use-rom-data';

export default function RomDetails() {
  const [, params] = useRoute('/rom/:id');
  const romId = params?.id ? decodeURIComponent(params.id) : '';
  const { data: rom, isLoading } = useRomById(romId);

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-white/5 rounded-3xl" />;
  }

  if (!rom) {
    return (
      <div className="text-center py-20">
        <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-lg font-bold">ROM not found</p>
        <Link href="/browse" className="text-primary hover:text-primary/80 text-sm mt-2 inline-block underline underline-offset-4">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Database
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1"
        >
          <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-panel relative shadow-2xl neon-glow">
            {rom.coverUrl ? (
              <img src={rom.coverUrl} alt={rom.title} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-6 text-center"
                style={{ background: rom.consoleGradient }}
              >
                <span className="font-black text-4xl text-white/40 uppercase break-words leading-none">
                  {rom.title}
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-white/10">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-sm">{rom.rating}/5</span>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 md:col-span-2 flex flex-col"
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/10"
              style={{ background: rom.consoleGradient }}
            >
              {rom.consoleName}
            </span>
            <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">{rom.genre}</span>
            <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">{rom.region}</span>
          </div>

          <h1 className="text-4xl font-black uppercase tracking-tight neon-text mb-4 leading-none">
            {rom.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-muted-foreground mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/40" />
              <span className="font-mono text-sm">{rom.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-white/40" />
              <span className="font-mono text-sm">{rom.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/40" />
              <span className="font-mono text-sm">{rom.players} player{rom.players !== '1' ? 's' : ''}</span>
            </div>
            {rom.developer && (
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-white/40" />
                <span className="font-mono text-sm">{rom.developer}</span>
              </div>
            )}
          </div>

          {rom.description && (
            <p className="text-[15px] leading-relaxed text-white/70 mb-6">
              {rom.description}
            </p>
          )}

          {/* Instructions */}
          {rom.instructions && rom.instructions.length > 0 && (
            <div className="mb-6 glass-panel rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Setup Instructions</p>
              <ol className="space-y-1.5">
                {rom.instructions.map((step, i) => (
                  <li key={i} className="text-[13px] text-white/70 flex gap-2">
                    <span className="text-primary font-mono font-bold shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-auto flex items-center gap-3">
            {rom.downloadUrl ? (
              <a
                href={rom.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground px-7 py-3 rounded-xl font-bold flex items-center gap-2.5 hover:bg-primary/90 transition-all hover:scale-105 neon-glow"
              >
                <Download className="w-5 h-5" /> Download ROM
              </a>
            ) : (
              <button disabled className="bg-primary/40 text-white/50 px-7 py-3 rounded-xl font-bold flex items-center gap-2.5 cursor-not-allowed">
                <Download className="w-5 h-5" /> No Link Available
              </button>
            )}
            {rom.videoId && (
              <a
                href={`https://youtube.com/watch?v=${rom.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
