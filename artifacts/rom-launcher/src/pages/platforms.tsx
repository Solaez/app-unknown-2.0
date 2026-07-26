import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useConsoles } from '@/hooks/use-rom-data';
import { Cpu } from 'lucide-react';

export default function Platforms() {
  const { data: consoles, isLoading } = useConsoles();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight neon-text">Game Systems</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Select a console to browse its library</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consoles?.map((console_, i) => (
          <Link key={console_.id} href={`/browse?platformId=${console_.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative overflow-hidden rounded-2xl group cursor-pointer h-44 glass-panel border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 duration-200"
            >
              {/* Background gradient */}
              <div
                className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity"
                style={{ background: console_.gradient }}
              />
              <div className="absolute inset-0 bg-black/40" />

              {/* Glow blob */}
              <div
                className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity"
                style={{ background: console_.gradient }}
              />

              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white group-hover:scale-105 transition-transform origin-left">
                      {console_.name}
                    </h2>
                    <p className="text-[12px] text-white/50 mt-0.5 font-mono">{console_.emulator}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10"
                  >
                    <Cpu className="w-5 h-5 text-white/70" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: console_.gradient, boxShadow: `0 0 6px ${console_.gradient}` }}
                    />
                    <span className="text-sm font-bold">{console_.roms.length} ROMs</span>
                  </div>
                  <div className="flex gap-1">
                    {console_.fileExtensions.slice(0, 3).map((ext) => (
                      <span key={ext} className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
