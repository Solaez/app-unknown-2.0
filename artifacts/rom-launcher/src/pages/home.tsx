import { useGetStats, useGetFeaturedRoms, useGetRoms, useGetLatestNews, useGetPlatforms } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, HardDrive, Download, ChevronRight, Play, Clock, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useState, useEffect } from 'react';
import { GameCard } from '@/components/game-card';

export default function Home() {
  const { data: stats } = useGetStats();
  const { data: featuredRoms } = useGetFeaturedRoms();
  const { data: recentRoms } = useGetRoms({ limit: 8 });
  const { data: platforms } = useGetPlatforms();
  const { data: news } = useGetLatestNews();

  const [activeFeatured, setActiveFeatured] = useState(0);

  useEffect(() => {
    if (!featuredRoms?.length) return;
    const interval = setInterval(() => {
      setActiveFeatured((prev) => (prev + 1) % featuredRoms.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredRoms]);

  const StatCard = ({ label, value, icon: Icon, color, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${color}`} />
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-white/10 ${color.split(' ')[0].replace('from-', 'bg-').replace('/20', '/10')}`}>
        <Icon className={`w-6 h-6 ${color.split(' ')[0].replace('from-', 'text-').replace('/20', '')}`} />
      </div>
      <div>
        <div className="text-3xl font-black neon-text tracking-tight">{value || 0}</div>
        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Carousel */}
      <section className="relative h-[45vh] min-h-[400px] rounded-3xl overflow-hidden border border-white/10 group">
        <AnimatePresence mode="wait">
          {featuredRoms && featuredRoms.length > 0 ? (
            <motion.div
              key={activeFeatured}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {featuredRoms[activeFeatured].coverUrl ? (
                <img src={featuredRoms[activeFeatured].coverUrl} alt="Featured" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-10 max-w-2xl w-full">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-primary/20 text-primary border border-primary/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 neon-glow">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                    <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white border border-white/10">
                      {featuredRoms[activeFeatured].platformName}
                    </span>
                  </div>
                  <h1 className="text-5xl font-black text-white mb-4 leading-tight neon-text uppercase drop-shadow-2xl">
                    {featuredRoms[activeFeatured].title}
                  </h1>
                  <p className="text-gray-300 mb-8 line-clamp-2 text-lg">
                    {featuredRoms[activeFeatured].description || `Experience the classic masterpiece on ${featuredRoms[activeFeatured].platformName}. Download now and dive back into the retro era.`}
                  </p>
                  
                  <div className="flex gap-4">
                    <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 neon-glow">
                      <Download className="w-5 h-5" /> Download ROM
                    </button>
                    <Link href={`/browse?platformId=${featuredRoms[activeFeatured].platformId}`} className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all">
                      More {featuredRoms[activeFeatured].platformName}
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Loading featured content...
            </div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 right-8 flex gap-2 z-10">
          {featuredRoms?.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveFeatured(i)}
              className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                i === activeFeatured ? 'bg-primary neon-glow' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total ROMs" value={stats?.totalRoms} icon={HardDrive} color="from-primary/20 to-transparent" delay={0.1} />
        <StatCard label="Platforms" value={stats?.totalPlatforms} icon={Gamepad2} color="from-secondary/20 to-transparent" delay={0.2} />
        <StatCard label="Downloads" value={stats?.totalDownloads} icon={Download} color="from-accent/20 to-transparent" delay={0.3} />
        <StatCard label="Library Size" value={stats?.librarySize} icon={Clock} color="from-purple-500/20 to-transparent" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-primary w-6 h-6" /> Recently Added
            </h2>
            <Link href="/browse" className="text-sm text-primary hover:text-primary/80 flex items-center group">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentRoms?.map((rom, i) => (
              <GameCard key={rom.id} rom={rom} index={i} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <LayersIcon className="text-secondary w-6 h-6" /> Quick Platforms
            </h2>
            <Link href="/platforms" className="text-sm text-secondary hover:text-secondary/80 flex items-center group">
              All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {platforms?.slice(0, 6).map((platform, i) => (
              <Link key={platform.id} href={`/browse?platformId=${platform.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors border-l-4 group"
                  style={{ borderLeftColor: platform.color }}
                >
                  <div className="font-bold group-hover:text-white transition-colors">{platform.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{platform.romCount} ROMs</div>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <NewspaperIcon className="text-accent w-6 h-6" /> Latest News
            </h2>
            <div className="space-y-3">
              {news?.slice(0, 3).map((article, i) => (
                <Link key={article.id} href={`/news`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="glass-panel p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="text-xs text-accent mb-1 font-mono">{new Date(article.publishedAt).toLocaleDateString()}</div>
                    <div className="font-bold line-clamp-2 group-hover:text-accent transition-colors">{article.title}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 12 12 17 22 12"/>
      <polyline points="2 17 12 22 22 17"/>
    </svg>
  );
}

function NewspaperIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8"/>
      <path d="M15 18h-5"/>
      <path d="M10 6h8v4h-8V6Z"/>
    </svg>
  );
}
