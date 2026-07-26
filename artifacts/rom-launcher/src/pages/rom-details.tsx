import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, Download, Play, Globe, Calendar,
  Users, HardDrive, Cpu, Gamepad2, ExternalLink,
  Trophy, BookOpen, Flame, ChevronRight,
} from 'lucide-react';
import { useRomById, useConsoles } from '@/hooks/use-rom-data';

/* ── small info pill ── */
function InfoPill({
  label, value, icon: Icon,
}: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</span>
      <span className="text-[14px] font-bold text-white flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-white/40 shrink-0" />}
        {value}
      </span>
    </div>
  );
}

/* ── dark card used for developer / publisher ── */
function MetaCard({
  label, value, gradient,
}: { label: string; value: string; gradient: string }) {
  return (
    <div className="rounded-xl px-4 py-3 border border-white/8 bg-black/50 backdrop-blur-md flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">{label}</span>
      <div className="flex items-center gap-2 mt-0.5">
        <div className="w-5 h-5 rounded-md shrink-0" style={{ background: gradient }} />
        <span className="text-sm font-bold truncate">{value}</span>
      </div>
    </div>
  );
}

export default function RomDetails() {
  const [, params] = useRoute('/rom/:id');
  const romId = params?.id ? decodeURIComponent(params.id) : '';
  const { data: rom, isLoading } = useRomById(romId);
  const { data: consoles } = useConsoles();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-[520px] bg-white/5 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!rom) {
    return (
      <div className="text-center py-24">
        <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="text-lg font-bold">ROM not found</p>
        <Link href="/browse" className="text-primary hover:text-primary/80 text-sm mt-2 inline-block underline underline-offset-4">
          Back to Browse
        </Link>
      </div>
    );
  }

  const console_ = consoles?.find((c) => c.id === rom.consoleId);
  const otherRoms = console_?.roms
    .filter((r) => r.id !== rom.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4) ?? [];

  const ratingColor = rom.rating >= 4.5
    ? '#10b981'
    : rom.rating >= 3.5
    ? '#f59e0b'
    : '#ef4444';

  return (
    <div className="pb-10 -mx-1">

      {/* Back */}
      <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-5 ml-1">
        <ArrowLeft className="w-4 h-4" /> Browse ROMs
      </Link>

      {/* ── Hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden border border-white/8"
        style={{ minHeight: 460 }}
      >
        {/* Blurred BG */}
        <div className="absolute inset-0 z-0">
          {rom.coverUrl ? (
            <img
              src={rom.coverUrl}
              alt=""
              className="w-full h-full object-cover object-center scale-110"
              style={{ filter: 'blur(28px) brightness(0.28) saturate(1.4)' }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: rom.consoleGradient, filter: 'blur(40px) brightness(0.3)' }} />
          )}
          {/* gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-7 flex gap-7 items-start">

          {/* ── Left column: cover + rating + meta cards ── */}
          <div className="flex flex-col gap-4 shrink-0 w-[200px]">

            {/* Cover */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10">
              {rom.coverUrl ? (
                <img
                  src={rom.coverUrl}
                  alt={rom.title}
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <div
                  className="w-full aspect-[3/4] flex items-center justify-center p-4 text-center"
                  style={{ background: rom.consoleGradient }}
                >
                  <span className="font-black text-3xl text-white/30 uppercase leading-none">{rom.title}</span>
                </div>
              )}
            </div>

            {/* Rating card */}
            <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/8 px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-white/35 font-semibold mb-1.5">Rating</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black leading-none" style={{ color: ratingColor }}>
                  {rom.rating.toFixed(1)}
                </span>
                <Flame className="w-5 h-5 mb-0.5" style={{ color: ratingColor }} />
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3 h-3"
                    style={{
                      color: s <= rom.rating ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                      fill: s <= rom.rating ? '#f59e0b' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Developer card */}
            <MetaCard label="Developer" value={rom.developer || 'Unknown'} gradient={rom.consoleGradient} />

            {/* Console card */}
            <MetaCard label="Platform" value={rom.consoleName} gradient={rom.consoleGradient} />
          </div>

          {/* ── Right column: game info ── */}
          <div className="flex-1 min-w-0 flex flex-col pt-1">

            {/* Genre tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {rom.genre.split(',').map((g) => (
                <span
                  key={g}
                  className="text-[11px] font-semibold text-white/50 uppercase tracking-wide"
                >
                  {g.trim()}
                </span>
              ))}
              {rom.genre.split(',').length > 1 &&
                <span className="text-[11px] text-white/20">·</span>}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none text-white mb-4"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
              {rom.title}
            </h1>

            {/* Description */}
            {rom.description ? (
              <p className="text-[15px] leading-relaxed text-white/65 mb-6 max-w-xl">
                {rom.description}
              </p>
            ) : (
              <p className="text-[15px] leading-relaxed text-white/30 italic mb-6">
                No description available for this ROM.
              </p>
            )}

            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 mb-6 pb-6 border-b border-white/8">
              <InfoPill label="Release Year" value={rom.year || '—'} icon={Calendar} />
              <InfoPill label="File Size" value={rom.size || '—'} icon={HardDrive} />
              <InfoPill
                label="Players"
                value={`${rom.players} Player${rom.players !== '1' ? 's' : ''}`}
                icon={Users}
              />
              <InfoPill label="Region" value={rom.region || '—'} icon={Globe} />
              <InfoPill label="Emulator" value={console_?.emulator ?? '—'} icon={Cpu} />
              <InfoPill
                label="Format"
                value={console_?.fileExtensions?.slice(0, 2).join(', ') ?? '—'}
                icon={Gamepad2}
              />
            </div>

            {/* Instructions */}
            {rom.instructions && rom.instructions.length > 0 && (
              <div className="mb-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/8 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2 mb-3">
                  <BookOpen className="w-3.5 h-3.5" /> Setup Instructions
                </p>
                <ol className="space-y-2">
                  {rom.instructions.map((step, i) => (
                    <li key={i} className="text-[13px] text-white/60 flex gap-2.5 leading-relaxed">
                      <span
                        className="text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${rom.consoleGradient}`, minWidth: '1.25rem' }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-3 mt-auto">
              {rom.downloadUrl ? (
                <a
                  href={rom.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-black text-[15px] text-black bg-white hover:bg-white/90 transition-all hover:scale-105 shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
                >
                  <Download className="w-5 h-5" />
                  Download ROM
                </a>
              ) : (
                <button disabled className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-black text-[15px] text-white/30 bg-white/10 cursor-not-allowed">
                  <Download className="w-5 h-5" /> No Link Available
                </button>
              )}

              {rom.videoId && (
                <a
                  href={`https://youtube.com/watch?v=${rom.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
                >
                  <Play className="w-4 h-4" /> Watch Trailer
                </a>
              )}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] text-white/30">Platform:</span>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-black/50"
                >
                  <Cpu className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[12px] font-bold text-white/70">{console_?.emulator ?? 'Emulator'}</span>
                </div>
              </div>
            </div>

            {/* Achievements / trophy row */}
            <div className="mt-4 flex items-center gap-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[12px] text-white/35">
                <Trophy className="w-3.5 h-3.5" />
                <span>No achievements · Emulator-native save states supported</span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── More from this console ── */}
      {otherRoms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
              <span
                className="w-1.5 h-4 rounded-full"
                style={{ background: rom.consoleGradient }}
              />
              More from {rom.consoleName}
            </h2>
            <Link href={`/browse?platformId=${rom.consoleId}`}
              className="text-[12px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherRoms.map((r) => (
              <Link key={r.id} href={`/rom/${encodeURIComponent(r.id)}`}>
                <div className="group relative rounded-xl overflow-hidden border border-white/8 hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer bg-black/40">
                  <div className="aspect-[3/4] relative">
                    {r.coverUrl ? (
                      <img src={r.coverUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3" style={{ background: rom.consoleGradient }}>
                        <span className="font-black text-lg text-white/30 uppercase text-center leading-tight">{r.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-[12px] font-bold text-white leading-tight line-clamp-2">{r.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-white/60 font-mono">{r.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
