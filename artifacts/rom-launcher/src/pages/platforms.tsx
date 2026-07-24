import { useGetPlatforms } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

export default function Platforms() {
  const { data: platforms, isLoading } = useGetPlatforms();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-white/5 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight neon-text">Systems</h1>
        <p className="text-muted-foreground mt-1">Select a console to view its library.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms?.map((platform, i) => (
          <Link key={platform.id} href={`/browse?platformId=${platform.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl group cursor-pointer h-48 glass-panel border-white/10 hover:border-white/30 transition-colors"
            >
              {/* Background Glow */}
              <div 
                className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: platform.color }}
              />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight drop-shadow-md group-hover:scale-105 transition-transform origin-left">
                      {platform.name}
                    </h2>
                    <p className="text-sm text-white/70 font-mono mt-1">{platform.manufacturer}</p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 shadow-xl"
                    style={{ boxShadow: `0 0 20px ${platform.color}40` }}
                  >
                    {platform.iconUrl ? (
                      <img src={platform.iconUrl} alt="icon" className="w-8 h-8 opacity-80" />
                    ) : (
                      <span className="font-black text-xl" style={{ color: platform.color }}>{platform.name.charAt(0)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color, boxShadow: `0 0 8px ${platform.color}` }}></span>
                    <span className="text-sm font-bold">{platform.romCount} ROMs</span>
                  </div>
                  <span className="text-xs text-white/50 font-mono">EST. {platform.year}</span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
