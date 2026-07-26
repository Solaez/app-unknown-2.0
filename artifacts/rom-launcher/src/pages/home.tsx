import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import {
  Gamepad2, HardDrive, Download, ChevronRight, Sparkles,
  TrendingUp, Clock, Star, ExternalLink, Layers3, Newspaper,
  Activity, Zap,
} from 'lucide-react';
import { useAllRoms, useConsoles, useRomStats, useIgdbGameInfo } from '@/hooks/use-rom-data';
import { useGetDownloads, useGetLatestNews } from '@workspace/api-client-react';
import type { FlatRom } from '@/types/rom-types';

/* ---------- helpers ---------- */
function getHour() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/* ---------- stat card ---------- */
function StatCard({
  label, value, icon: Icon, color, sub, delay,
}: {
  label: string; value: string | number; icon: any; color: string; sub?: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel rounded-xl p-4 flex items-center gap-3 relative overflow-hidden group cursor-default"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `radial-gradient(circle at 0% 50%, ${color}18 0%, transparent 70%)` }} />
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white/8"
        style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[22px] font-black leading-tight tracking-tight" style={{ color: 'white' }}>{value}</p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium truncate">{label}</p>
      </div>
      {sub && (
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
          {sub}
        </span>
      )}
    </motion.div>
  );
}

/* ---------- popular row ---------- */
function RomRow({ rom, rank }: { rom: FlatRom; rank: number }) {
  return (
    <a
      href={rom.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
    >
      <span className="text-[11px] font-mono text-muted-foreground w-4 shrink-0">{rank}</span>
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white"
        style={{ background: rom.consoleGradient }}
      >
        {rom.consoleShortName.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold truncate">{rom.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{rom.genre}</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </a>
  );
}

/* ---------- Featured slide — fetches its own IGDB data ---------- */
function FeaturedSlide({ rom, featuredIdx, slideIdx, total, onDotClick }: {
  rom: FlatRom;
  featuredIdx: number;
  slideIdx: number;
  total: number;
  onDotClick: (i: number) => void;
}) {
  const { data: igdb } = useIgdbGameInfo(rom.title, rom.consoleName);

  /* Prefer: IGDB screenshot → IGDB cover → local cover */
  const bgUrl = igdb?.screenshots?.[0] || igdb?.coverUrl || rom.coverUrl;

  return (
    <motion.div
      key={slideIdx}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="absolute inset-0"
    >
      {bgUrl ? (
        <img src={bgUrl} alt={rom.title}
          className="w-full h-full object-cover object-center" />
      ) : (
        <div className="w-full h-full" style={{ background: rom.consoleGradient }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 p-6 max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider neon-glow flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Featured
          </span>
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase text-white border border-white/10">
            {rom.consoleShortName}
          </span>
          {igdb?.screenshots?.length ? (
            <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(147,112,219,0.35)', color: '#d8b4fe', border: '1px solid rgba(147,112,219,0.4)' }}>
              IGDB
            </span>
          ) : null}
        </div>
        <h2 className="text-2xl font-black text-white mb-1 uppercase leading-tight">{rom.title}</h2>
        <p className="text-[12px] text-white/60 mb-4 line-clamp-2">
          {igdb?.summary ? igdb.summary.slice(0, 100) + '…' : `${rom.genre} · ${rom.year} · ${rom.size}`}
        </p>
        <a
          href={rom.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-bold neon-glow hover:bg-primary/90 transition-all"
        >
          <Download className="w-4 h-4" /> Download ROM
        </a>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 right-5 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => onDotClick(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === featuredIdx ? 'w-6 bg-primary neon-glow' : 'w-1.5 bg-white/30 hover:bg-white/50'}`} />
        ))}
      </div>
    </motion.div>
  );
}

/* ---------- main ---------- */
export default function Home() {
  const { data: allRoms } = useAllRoms();
  const { data: consoles } = useConsoles();
  const { data: romStats } = useRomStats();
  const { data: downloads } = useGetDownloads();
  const { data: news } = useGetLatestNews();

  const [featuredIdx, setFeaturedIdx] = useState(0);

  const featuredRoms = allRoms
    ? [...allRoms].sort((a, b) => b.rating - a.rating).slice(0, 6)
    : [];

  const popularRoms = allRoms
    ? [...allRoms].filter((r) => r.rating >= 4).sort((a, b) => b.rating - a.rating).slice(0, 5)
    : [];

  const pieData = consoles
    ? consoles.slice(0, 6).map((c) => ({ name: c.shortName, value: c.roms.length }))
    : [];

  const PIE_COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const totalRomCount = pieData.reduce((s, d) => s + d.value, 0) || 1;
  let cumulativePct = 0;
  const segments = pieData.map((d, i) => {
    const pct = (d.value / totalRomCount) * 100;
    const start = cumulativePct;
    cumulativePct += pct;
    return { ...d, pct, start, color: PIE_COLORS[i % PIE_COLORS.length] };
  });

  useEffect(() => {
    if (!featuredRoms.length) return;
    const t = setInterval(() => setFeaturedIdx((p) => (p + 1) % featuredRoms.length), 6000);
    return () => clearInterval(t);
  }, [featuredRoms.length]);

  const current = featuredRoms[featuredIdx];

  return (
    <div className="space-y-5 pb-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{getHour()}, Gamer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s happening in your ROM vault today.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/browse">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white neon-glow transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
              <Gamepad2 className="w-4 h-4" /> Browse ROMs
            </button>
          </Link>
          <Link href="/platforms">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <Layers3 className="w-4 h-4" /> Platforms
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <StatCard label="Total ROMs" value={romStats?.totalRoms ?? '...'} icon={HardDrive} color="#7c3aed" sub="+12.5%" delay={0.05} />
        <StatCard label="Consoles" value={romStats?.totalConsoles ?? '...'} icon={Gamepad2} color="#2563eb" sub="+2" delay={0.1} />
        <StatCard label="Downloads" value={downloads?.length ?? 0} icon={Download} color="#06b6d4" delay={0.15} />
        <StatCard label="Top Rating" value="5.0" icon={Star} color="#f59e0b" sub="Best" delay={0.2} />
        <StatCard label="New Today" value={Math.floor((romStats?.totalRoms ?? 0) * 0.04)} icon={Sparkles} color="#10b981" sub="+8.4%" delay={0.25} />
      </div>

      {/* ── Main 2-col ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Featured carousel — left 2/3 */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden relative h-64 md:h-72">
          <AnimatePresence mode="wait">
            {current ? (
              <FeaturedSlide
                key={featuredIdx}
                rom={current}
                featuredIdx={featuredIdx}
                slideIdx={featuredIdx}
                total={featuredRoms.length}
                onDotClick={setFeaturedIdx}
              />
            ) : (
              <div className="absolute inset-0 animate-pulse bg-white/5" />
            )}
          </AnimatePresence>

          {/* Label */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 z-10">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-bold">Top Picks</span>
          </div>
        </div>

        {/* Quick Info Panel */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" /> Quick Info
              </p>
              <p className="text-[11px] text-muted-foreground">ROM stats at a glance</p>
            </div>
          </div>

          {/* CSS Donut chart */}
          <div className="relative flex items-center justify-center h-28">
            <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
              {segments.map((seg, i) => {
                const circumference = 2 * Math.PI * 38;
                const dash = (seg.pct / 100) * circumference;
                const offset = -((seg.start / 100) * circumference);
                return (
                  <circle key={i} cx="50" cy="50" r="38" fill="none"
                    stroke={seg.color} strokeWidth="10"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={offset} opacity="0.85" />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black">{romStats?.totalRoms ?? 0}</span>
              <span className="text-[10px] text-muted-foreground">ROMs</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-2 border-t border-white/5">
            <p className="text-[11px] text-muted-foreground text-center">Use recommended emulator for best experience</p>
          </div>
        </div>
      </div>

      {/* ── Bottom 3-col ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Popular ROMs */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400" /> Popular ROMs
            </p>
            <Link href="/browse" className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0.5">
            {popularRoms.map((rom, i) => <RomRow key={rom.id} rom={rom} rank={i + 1} />)}
            {!popularRoms.length && <p className="text-[12px] text-muted-foreground text-center py-4">Loading...</p>}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-accent" /> Recent Activity
            </p>
            <Link href="/downloads" className="text-[11px] text-accent hover:text-accent/80 flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {downloads?.slice(0, 5).map((dl) => (
              <div key={dl.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${dl.status === 'completed' ? 'bg-emerald-400' : dl.status === 'downloading' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold truncate">{dl.romTitle}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{dl.status} &middot; {dl.platformName}</p>
                </div>
                {dl.status === 'downloading' && (
                  <span className="text-[10px] font-mono text-primary shrink-0">{Math.round(dl.progress)}%</span>
                )}
                {dl.status === 'completed' && <span className="text-[10px] text-emerald-400 shrink-0">Done</span>}
              </div>
            ))}
            {!downloads?.length && (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-[12px] text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest News */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-secondary" /> Latest News
            </p>
            <Link href="/news" className="text-[11px] text-secondary hover:text-secondary/80 flex items-center gap-0.5">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {news?.slice(0, 4).map((article) => (
              <div key={article.id} className="p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                <span className="text-[10px] font-mono text-accent uppercase tracking-wider">{article.category}</span>
                <p className="text-[13px] font-semibold mt-0.5 leading-tight group-hover:text-primary transition-colors line-clamp-2">{article.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{article.author} · {article.readTime} min read</p>
              </div>
            ))}
            {!news?.length && <p className="text-[12px] text-muted-foreground text-center py-4">Loading news...</p>}
          </div>
        </div>
      </div>

      {/* ── Bottom Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-5 flex items-center justify-between gap-4 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #7c3aed22 0%, #2563eb22 50%, #06b6d422 100%)' }}
      >
        <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-[60px]" />
        <div className="flex items-center gap-4 relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center neon-glow"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-lg text-white">NeonROM · The Retro Vault</p>
            <p className="text-sm text-muted-foreground">Thousands of ROMs. Every classic. One launcher.</p>
          </div>
        </div>
        <Link href="/browse">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white neon-glow hover:scale-105 transition-transform shrink-0 relative"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
            Explore ROMs <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
