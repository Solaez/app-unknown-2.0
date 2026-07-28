import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import {
  Gamepad2, HardDrive, Download, ChevronRight, Sparkles,
  TrendingUp, Clock, Star, ExternalLink, Layers3, Newspaper,
  Activity, Zap, Flame, Calendar, Trophy, Rocket, Globe,
  Swords, Shield, Cpu, BarChart3, ArrowUpRight, Play,
} from 'lucide-react';
import { useAllRoms, useConsoles, useRomStats, useIgdbGameInfo } from '@/hooks/use-rom-data';
import { useGetDownloads, useGetLatestNews } from '@workspace/api-client-react';
import { useGithubReleases } from '@/hooks/use-github-releases';
import type { FlatRom } from '@/types/rom-types';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────
   UPCOMING RELEASES data (curated)
───────────────────────────────────────────*/
interface UpcomingGame {
  id: string;
  title: string;
  developer: string;
  platform: string;
  releaseDate: string;
  genre: string;
  hype: 'high' | 'medium' | 'confirmed';
  gradient: string;
  icon: string;
  badge?: string;
}

const UPCOMING: UpcomingGame[] = [
  {
    id: 'gta6',
    title: 'Grand Theft Auto VI',
    developer: 'Rockstar Games',
    platform: 'PS5 / Xbox',
    releaseDate: '2025',
    genre: 'Open World',
    hype: 'high',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    icon: '🏙️',
    badge: 'MOST AWAITED',
  },
  {
    id: 'metroid4',
    title: 'Metroid Prime 4: Beyond',
    developer: 'Retro Studios',
    platform: 'Nintendo Switch 2',
    releaseDate: '2025',
    genre: 'Action-Adventure',
    hype: 'confirmed',
    gradient: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    icon: '🚀',
    badge: 'CONFIRMED',
  },
  {
    id: 'dkbananza',
    title: 'Donkey Kong Bananza',
    developer: 'Nintendo EPD',
    platform: 'Nintendo Switch 2',
    releaseDate: 'Jul 17, 2025',
    genre: 'Platformer',
    hype: 'confirmed',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    icon: '🦍',
    badge: 'LAUNCH TITLE',
  },
  {
    id: 'marioparty',
    title: 'Mario Party Jamboree',
    developer: 'NDcube',
    platform: 'Nintendo Switch 2',
    releaseDate: '2025',
    genre: 'Party',
    hype: 'confirmed',
    gradient: 'linear-gradient(135deg, #ef4444, #ec4899)',
    icon: '🎲',
  },
  {
    id: 'silenthill2r',
    title: 'Silent Hill f',
    developer: 'Konami / Neobards',
    platform: 'Multi',
    releaseDate: '2025',
    genre: 'Survival Horror',
    hype: 'confirmed',
    gradient: 'linear-gradient(135deg, #374151, #6b7280)',
    icon: '🌫️',
    badge: 'NEW',
  },
  {
    id: 'fable',
    title: 'Fable',
    developer: 'Playground Games',
    platform: 'Xbox / PC',
    releaseDate: '2025',
    genre: 'RPG',
    hype: 'high',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    icon: '⚔️',
  },
  {
    id: 'fantasyfinal17',
    title: 'Final Fantasy XVII',
    developer: 'Square Enix',
    platform: 'Multi',
    releaseDate: 'TBA',
    genre: 'JRPG',
    hype: 'medium',
    gradient: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
    icon: '⚡',
  },
  {
    id: 'zeldabreathwild3',
    title: 'The Legend of Zelda',
    developer: 'Nintendo EPD',
    platform: 'Nintendo Switch 2',
    releaseDate: 'TBA 2025',
    genre: 'Action-Adventure',
    hype: 'high',
    gradient: 'linear-gradient(135deg, #16a34a, #4ade80)',
    icon: '🗡️',
  },
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────────*/
function getLiveTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getLiveDate() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { es: 'Buenos días', en: 'Good morning' };
  if (h < 18) return { es: 'Buenas tardes', en: 'Good afternoon' };
  return { es: 'Buenas noches', en: 'Good evening' };
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────*/
function StatCard({
  label, value, icon: Icon, color, sub, delay, trend,
}: {
  label: string; value: string | number; icon: any; color: string; sub?: string; delay: number; trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="glass-panel rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group cursor-default"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 0% 100%, ${color}22 0%, transparent 70%)` }} />
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: color }} />

      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        {sub && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
            style={{ background: `${color}20`, color }}>
            <ArrowUpRight className="w-2.5 h-2.5" />{sub}
          </span>
        )}
      </div>

      <div>
        <p className="text-[26px] font-black leading-none tracking-tight text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">{label}</p>
      </div>

      {trend && (
        <div className="h-0.5 rounded-full overflow-hidden bg-border mt-1">
          <div className="h-full rounded-full" style={{ width: trend, background: color }} />
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   FEATURED SLIDE
───────────────────────────────────────────*/
function FeaturedSlide({ rom, featuredIdx, slideIdx, total, onDotClick }: {
  rom: FlatRom; featuredIdx: number; slideIdx: number; total: number; onDotClick: (i: number) => void;
}) {
  const { data: igdb } = useIgdbGameInfo(rom.title, rom.consoleName);
  const bgUrl = igdb?.screenshots?.[0] || igdb?.coverUrl || rom.coverUrl;

  return (
    <motion.div
      key={slideIdx}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="absolute inset-0"
    >
      {bgUrl ? (
        <img src={bgUrl} alt={rom.title} className="w-full h-full object-cover object-center" />
      ) : (
        <div className="w-full h-full" style={{ background: rom.consoleGradient }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 p-6 max-w-md">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Featured
          </span>
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-white border border-white/10">
            {rom.consoleShortName}
          </span>
          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5" /> {rom.rating}
          </span>
        </div>
        <h2 className="text-3xl font-black text-white mb-1 uppercase leading-tight drop-shadow-lg">{rom.title}</h2>
        <p className="text-[12px] text-white/60 mb-4 line-clamp-2 leading-relaxed">
          {igdb?.summary ? igdb.summary.slice(0, 120) + '…' : `${rom.genre} · ${rom.year} · ${rom.size}`}
        </p>
        <div className="flex items-center gap-2">
          <a href={rom.downloadUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold neon-glow hover:bg-primary/90 transition-all hover:scale-105">
            <Download className="w-4 h-4" /> Descargar ROM
          </a>
          <Link href={`/rom/${rom.id}`}>
            <button className="inline-flex items-center gap-1.5 bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
              <ExternalLink className="w-3.5 h-3.5" /> Detalles
            </button>
          </Link>
        </div>
      </div>

      {/* Nav dots */}
      <div className="absolute bottom-6 right-6 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => onDotClick(i)}
            className={cn('h-1.5 rounded-full transition-all duration-300',
              i === featuredIdx ? 'w-7 bg-primary neon-glow' : 'w-1.5 bg-white/30 hover:bg-white/60')} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   UPCOMING GAME CARD
───────────────────────────────────────────*/
function UpcomingCard({ game }: { game: UpcomingGame }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="flex-shrink-0 w-52 rounded-2xl overflow-hidden border border-border/60 group cursor-default relative"
      style={{ background: 'hsl(var(--card))' }}
    >
      {/* Gradient top */}
      <div className="h-28 relative flex items-center justify-center overflow-hidden"
        style={{ background: game.gradient }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <span className="text-5xl drop-shadow-xl z-10 relative">{game.icon}</span>
        {game.badge && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded-full">
            <span className="text-[9px] font-black tracking-widest text-white">{game.badge}</span>
          </div>
        )}
        <div className={cn(
          'absolute top-2 right-2 w-2 h-2 rounded-full',
          game.hype === 'high' ? 'bg-red-400 animate-pulse' :
          game.hype === 'confirmed' ? 'bg-emerald-400' : 'bg-yellow-400'
        )} />
      </div>

      <div className="p-3.5">
        <p className="text-[13px] font-black text-foreground leading-tight line-clamp-1">{game.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{game.developer}</p>
        <div className="flex items-center justify-between mt-2.5 gap-1 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {game.platform}
          </span>
          <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
            <Calendar className="w-2.5 h-2.5" />{game.releaseDate}
          </span>
        </div>
        <div className="mt-1.5">
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{game.genre}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   ROM ROW (trending)
───────────────────────────────────────────*/
function TrendingRomRow({ rom, rank }: { rom: FlatRom; rank: number }) {
  const rankColors = ['#f59e0b', '#9ca3af', '#cd7c3f'];
  const rankColor = rankColors[rank - 1] ?? undefined;

  return (
    <a href={rom.downloadUrl} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-all group">
      <div className="w-7 text-center shrink-0">
        {rank <= 3 ? (
          <Trophy className="w-4 h-4 mx-auto" style={{ color: rankColor }} />
        ) : (
          <span className="text-[11px] font-mono font-bold text-muted-foreground">{rank}</span>
        )}
      </div>
      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black text-white"
        style={{ background: rom.consoleGradient }}>
        {rom.consoleShortName.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold truncate text-foreground group-hover:text-primary transition-colors">{rom.title}</p>
        <p className="text-[11px] text-muted-foreground">{rom.genre} · {rom.consoleName}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-0.5 justify-end">
          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
          <span className="text-[11px] font-bold text-foreground">{rom.rating}</span>
        </div>
        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto mt-0.5" />
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────
   PLATFORM MINI CARD
───────────────────────────────────────────*/
function PlatformCard({ name, shortName, count, gradient, delay }: {
  name: string; shortName: string; count: number; gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      <Link href={`/browse?console=${encodeURIComponent(shortName)}`}>
        <div className="rounded-2xl p-3.5 cursor-pointer relative overflow-hidden border border-border/60 group"
          style={{ background: 'hsl(var(--card))' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: gradient.replace('linear-gradient(135deg,', 'linear-gradient(135deg,').replace(/,\s*[^,]+\)$/, ', transparent)') + '18' }} />
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black text-white mb-2 shrink-0"
            style={{ background: gradient }}>
            {shortName.slice(0, 2)}
          </div>
          <p className="text-[12px] font-bold text-foreground leading-tight line-clamp-1">{shortName}</p>
          <p className="text-[11px] text-muted-foreground">{count} ROMs</p>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────────*/
export default function Home() {
  const { data: allRoms } = useAllRoms();
  const { data: consoles } = useConsoles();
  const { data: romStats } = useRomStats();
  const { data: downloads } = useGetDownloads();
  const { data: news } = useGetLatestNews();
  const { data: releases } = useGithubReleases();

  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [liveTime, setLiveTime] = useState(getLiveTime());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(getLiveTime()), 1000);
    return () => clearInterval(t);
  }, []);

  const featuredRoms = allRoms
    ? [...allRoms].sort((a, b) => b.rating - a.rating).slice(0, 6)
    : [];

  const trendingRoms = allRoms
    ? [...allRoms].filter((r) => r.rating >= 4).sort((a, b) => b.rating - a.rating).slice(0, 6)
    : [];

  const recentRoms = allRoms
    ? [...allRoms].sort((a, b) => b.year - a.year).slice(0, 5)
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
  const latestRelease = releases?.find(r => !r.prerelease);

  const greeting = getGreeting();

  return (
    <div className="space-y-6 pb-10">

      {/* ── HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-border/50 p-6"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.12) 0%, hsl(var(--secondary)/0.08) 50%, transparent 100%)' }}
      >
        {/* Ambient blobs */}
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-[80px] opacity-20"
          style={{ background: 'hsl(var(--primary))' }} />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[80px] opacity-15"
          style={{ background: 'hsl(var(--secondary))' }} />

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10">
                NeonROM Dashboard
              </span>
              {latestRelease && (
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  UnknownGestor {latestRelease.tag_name}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-foreground">
              {greeting.es}, <span style={{ color: 'hsl(var(--primary))' }}>Gamer</span> 👾
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{getLiveDate()}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live clock */}
            <div className="text-right hidden sm:block">
              <p className="text-3xl font-black font-mono text-foreground tracking-tighter">{liveTime}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Hora actual</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/browse">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white neon-glow transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
                  <Gamepad2 className="w-4 h-4" /> Browse ROMs
                </button>
              </Link>
              <Link href="/platforms">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-border bg-muted/50 hover:bg-muted transition-colors">
                  <Layers3 className="w-4 h-4" /> Plataformas
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <StatCard label="Total ROMs" value={romStats?.totalRoms ?? '—'} icon={HardDrive} color="#7c3aed" sub="+12.5%" delay={0.05} trend="76%" />
        <StatCard label="Consolas" value={romStats?.totalConsoles ?? '—'} icon={Cpu} color="#2563eb" sub="+2" delay={0.1} trend="60%" />
        <StatCard label="Descargas" value={downloads?.length ?? 0} icon={Download} color="#06b6d4" delay={0.15} trend="40%" />
        <StatCard label="Top Rating" value="5.0" icon={Star} color="#f59e0b" sub="Best" delay={0.2} trend="100%" />
        <StatCard label="Nuevos Hoy" value={Math.max(1, Math.floor((romStats?.totalRoms ?? 0) * 0.04))} icon={Sparkles} color="#10b981" sub="+8.4%" delay={0.25} trend="55%" />
      </div>

      {/* ── FEATURED + DONUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carousel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden relative h-72 md:h-80">
          <AnimatePresence mode="wait">
            {current ? (
              <FeaturedSlide
                key={featuredIdx} rom={current} featuredIdx={featuredIdx}
                slideIdx={featuredIdx} total={featuredRoms.length} onDotClick={setFeaturedIdx}
              />
            ) : (
              <div className="absolute inset-0 animate-pulse bg-muted/20" />
            )}
          </AnimatePresence>
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 z-10">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-[11px] font-bold text-white">Top Picks</span>
          </div>
        </div>

        {/* Donut + legend */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                <BarChart3 className="w-4 h-4 text-primary" /> Distribución
              </p>
              <p className="text-[11px] text-muted-foreground">ROMs por plataforma</p>
            </div>
          </div>

          <div className="relative flex items-center justify-center h-32">
            <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
              {segments.map((seg, i) => {
                const circ = 2 * Math.PI * 36;
                const dash = (seg.pct / 100) * circ;
                const offset = -((seg.start / 100) * circ);
                return (
                  <circle key={i} cx="50" cy="50" r="36" fill="none"
                    stroke={seg.color} strokeWidth="12"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={offset} opacity="0.9"
                    strokeLinecap="round" />
                );
              })}
            </svg>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-foreground">{romStats?.totalRoms ?? 0}</span>
              <span className="text-[10px] text-muted-foreground">ROMs</span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-[12px] gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground truncate">{d.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-12 h-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(d.value / totalRomCount) * 100}%`, background: PIE_COLORS[i] }} />
                  </div>
                  <span className="font-mono font-bold text-foreground w-6 text-right">{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── UPCOMING RELEASES ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[17px] font-black text-foreground flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              Próximos Lanzamientos
            </h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Juegos más esperados de 2025–2026</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />Alto hype</span>
            <span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-emerald-400" />Confirmado</span>
            <span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-yellow-400" />Rumoreado</span>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {UPCOMING.map((game, i) => (
            <motion.div key={game.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <UpcomingCard game={game} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── TRENDING + RECENT + QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Trending ROMs */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" /> Trending
            </p>
            <Link href="/browse" className="text-[11px] text-primary hover:opacity-70 flex items-center gap-0.5 font-semibold">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0.5">
            {trendingRoms.slice(0, 6).map((rom, i) => <TrendingRomRow key={rom.id} rom={rom} rank={i + 1} />)}
            {!trendingRoms.length && <p className="text-[12px] text-muted-foreground text-center py-6">Cargando...</p>}
          </div>
        </div>

        {/* Activity + News */}
        <div className="flex flex-col gap-4">
          {/* Activity */}
          <div className="glass-panel rounded-2xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                <Activity className="w-4 h-4 text-cyan-400" /> Actividad
              </p>
              <Link href="/downloads" className="text-[11px] text-cyan-400 hover:opacity-70 flex items-center gap-0.5 font-semibold">
                Ver <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {downloads?.slice(0, 3).map((dl) => (
                <div key={dl.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    dl.status === 'completed' ? 'bg-emerald-400' :
                    dl.status === 'downloading' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold truncate text-foreground">{dl.romTitle}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{dl.status} · {dl.platformName}</p>
                  </div>
                  {dl.status === 'downloading' && (
                    <span className="text-[10px] font-mono text-primary shrink-0">{Math.round(dl.progress)}%</span>
                  )}
                  {dl.status === 'completed' && (
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓</span>
                  )}
                </div>
              ))}
              {!downloads?.length && (
                <div className="text-center py-4">
                  <Clock className="w-7 h-7 text-muted-foreground mx-auto mb-1.5 opacity-40" />
                  <p className="text-[12px] text-muted-foreground">Sin actividad reciente</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" /> Acceso Rápido
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Browse ROMs', icon: Gamepad2, href: '/browse', color: '#7c3aed' },
                { label: 'Descargas', icon: Download, href: '/downloads', color: '#06b6d4' },
                { label: 'Mi Biblioteca', icon: Shield, href: '/library', color: '#10b981' },
                { label: 'Emuladores', icon: Swords, href: '/emulation', color: '#f59e0b' },
              ].map(({ label, icon: Icon, href, color }) => (
                <Link key={href} href={href}>
                  <button className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-border/60 hover:border-border hover:bg-muted/40 transition-all text-left group">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Latest News */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold flex items-center gap-1.5 text-foreground">
              <Newspaper className="w-4 h-4 text-pink-400" /> Noticias
            </p>
            <Link href="/news" className="text-[11px] text-pink-400 hover:opacity-70 flex items-center gap-0.5 font-semibold">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {news?.slice(0, 4).map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                className="p-2.5 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group border border-transparent hover:border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{ background: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))' }}>
                    {article.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{article.readTime} min</span>
                </div>
                <p className="text-[13px] font-semibold mt-0.5 leading-tight group-hover:text-primary transition-colors line-clamp-2 text-foreground">{article.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{article.author}</p>
              </motion.div>
            ))}
            {!news?.length && <p className="text-[12px] text-muted-foreground text-center py-6">Cargando noticias...</p>}
          </div>
        </div>
      </div>

      {/* ── PLATFORMS SHOWCASE ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-black text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" /> Plataformas
          </h2>
          <Link href="/platforms" className="text-[12px] text-primary font-semibold flex items-center gap-0.5 hover:opacity-70">
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-9 gap-2">
          {(consoles ?? []).slice(0, 9).map((c, i) => (
            <PlatformCard key={c.id} name={c.name} shortName={c.shortName} count={c.roms.length} gradient={c.gradient} delay={0.04 * i} />
          ))}
        </div>
      </motion.div>

      {/* ── RECENT ADDITIONS ── */}
      {recentRoms.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-black text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Añadidos Recientemente
            </h2>
            <Link href="/browse" className="text-[12px] text-primary font-semibold flex items-center gap-0.5 hover:opacity-70">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {recentRoms.map((rom, i) => (
              <motion.div key={rom.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                whileHover={{ y: -3 }}>
                <a href={rom.downloadUrl} target="_blank" rel="noopener noreferrer"
                  className="block rounded-2xl overflow-hidden border border-border/60 group cursor-pointer"
                  style={{ background: 'hsl(var(--card))' }}>
                  <div className="h-24 relative overflow-hidden" style={{ background: rom.consoleGradient }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {rom.coverUrl ? (
                        <img src={rom.coverUrl} alt={rom.title} className="h-full w-full object-cover" />
                      ) : (
                        <Gamepad2 className="w-8 h-8 text-white/50" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 text-[9px] font-black text-white/80 uppercase tracking-wider">
                      {rom.consoleShortName} · {rom.year}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[12px] font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{rom.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{rom.genre}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-foreground">{rom.rating}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── BOTTOM BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl p-6 flex items-center justify-between gap-4 overflow-hidden relative border border-border/40"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.12) 0%, hsl(var(--secondary)/0.10) 50%, hsl(var(--primary)/0.06) 100%)' }}
      >
        <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full blur-[70px] opacity-25"
          style={{ background: 'hsl(var(--primary))' }} />
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-[70px] opacity-20"
          style={{ background: 'hsl(var(--secondary))' }} />

        <div className="flex items-center gap-4 relative">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center neon-glow shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
          <div>
            <p className="font-black text-xl text-foreground">NeonROM · The Retro Vault</p>
            <p className="text-sm text-muted-foreground">Miles de ROMs. Cada clásico. Un solo lanzador.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative shrink-0">
          <Link href="/emulation">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-border bg-background/60 hover:bg-muted transition-colors text-foreground">
              <Cpu className="w-4 h-4" /> Emuladores
            </button>
          </Link>
          <Link href="/browse">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white neon-glow hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
              Explorar ROMs <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
