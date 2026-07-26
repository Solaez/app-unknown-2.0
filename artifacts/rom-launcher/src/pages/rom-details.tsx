import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bookmark, ChevronLeft, ChevronRight,
  Play, Download, User, Users, Trophy, Lock,
  Gamepad2, Cpu, Globe, Calendar, Star, Flame,
  ChevronDown, Monitor,
} from 'lucide-react';
import { useRomById, useConsoles } from '@/hooks/use-rom-data';

/* ─── Avatar cluster (fake review avatars) ─── */
const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#06b6d4'];
function AvatarCluster({ count = 3 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1.5">
        {AVATAR_COLORS.slice(0, count).map((c, i) => (
          <div key={i} className="w-5 h-5 rounded-full border-2 border-[#1c1c28] flex items-center justify-center text-[8px] font-black text-white"
            style={{ background: c }}>
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dark pill card (developer / publisher) ─── */
function PillCard({ label, value, gradient }: { label: string; value: string; gradient: string }) {
  return (
    <div className="rounded-2xl bg-[#1a1a28] border border-white/6 px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-black text-white"
        style={{ background: gradient }}>
        {value.slice(0, 1)}
      </div>
      <div>
        <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">{label}</p>
        <p className="text-[14px] font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

/* ─── Metadata column ─── */
function MetaCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-white/35 uppercase tracking-wider font-semibold">{label}</span>
      <div className="text-[14px] font-bold text-white">{children}</div>
    </div>
  );
}

/* ─── Icon button ─── */
function IconBtn({ icon: Icon, active }: { icon: any; active?: boolean }) {
  return (
    <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
      active ? 'bg-[#7c3aed]/30 border border-[#7c3aed]/60 neon-glow' : 'bg-white/5 border border-white/8 hover:bg-white/10'
    }`}>
      <Icon className={`w-4 h-4 ${active ? 'text-[#7c3aed]' : 'text-white/40'}`} />
    </button>
  );
}

export default function RomDetails() {
  const [, params] = useRoute('/rom/:id');
  const romId = params?.id ? decodeURIComponent(params.id) : '';
  const { data: rom, isLoading } = useRomById(romId);
  const { data: consoles } = useConsoles();

  const [slideIdx, setSlideIdx] = useState(0);

  /* ── loading skeleton ── */
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-7 w-28 bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-3">
            <div className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl" />
            <div className="h-24 bg-white/5 animate-pulse rounded-2xl" />
            <div className="h-14 bg-white/5 animate-pulse rounded-2xl" />
            <div className="h-14 bg-white/5 animate-pulse rounded-2xl" />
          </div>
          <div className="col-span-2 space-y-4 pt-2">
            <div className="h-10 w-3/4 bg-white/5 animate-pulse rounded-xl" />
            <div className="h-4 w-1/3 bg-white/5 animate-pulse rounded" />
            <div className="h-16 bg-white/5 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!rom) {
    return (
      <div className="text-center py-24">
        <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="text-lg font-bold">ROM not found</p>
        <Link href="/browse" className="text-primary text-sm mt-2 inline-block underline underline-offset-4">
          Back to Browse
        </Link>
      </div>
    );
  }

  const console_ = consoles?.find((c) => c.id === rom.consoleId);

  /* Gallery: YouTube thumbnail + cover as slides */
  const slides = [
    ...(rom.videoId ? [`https://img.youtube.com/vi/${rom.videoId}/maxresdefault.jpg`] : []),
    ...(rom.coverUrl ? [rom.coverUrl] : []),
  ];
  if (slides.length === 0) slides.push(''); // always at least one slide

  const totalSlides = Math.max(slides.length, 1);
  const prev = () => setSlideIdx((i) => (i - 1 + totalSlides) % totalSlides);
  const next = () => setSlideIdx((i) => (i + 1) % totalSlides);

  const ratingColor =
    rom.rating >= 4.5 ? '#10b981' : rom.rating >= 3 ? '#f59e0b' : '#ef4444';

  const worksOn = console_?.emulator
    ? `${console_.emulator} (Win / Mac / Linux)`
    : 'Emulator required';

  const releaseDateStr = rom.year
    ? new Date(rom.year, 0, 1).toLocaleDateString('en-US', { year: 'numeric' })
    : '—';

  return (
    <div className="pb-6 space-y-6">

      {/* Back breadcrumb */}
      <Link href="/browse"
        className="inline-flex items-center gap-1.5 text-[13px] text-white/35 hover:text-white/70 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Browse ROMs
      </Link>

      {/* ══════════════════════════════════════════
          MAIN GRID — left column + right column
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-[220px_1fr] gap-8 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-3">

          {/* Cover art */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.7)] border border-white/8"
          >
            {rom.coverUrl ? (
              <img src={rom.coverUrl} alt={rom.title}
                className="w-full aspect-[3/4] object-cover block" />
            ) : (
              <div className="w-full aspect-[3/4] flex items-center justify-center p-4 text-center"
                style={{ background: rom.consoleGradient }}>
                <span className="font-black text-3xl text-white/30 uppercase leading-tight">{rom.title}</span>
              </div>
            )}
          </motion.div>

          {/* Rating card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-[#1a1a28] border border-white/6 px-4 py-3.5"
          >
            <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold mb-2">Rating</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black leading-none" style={{ color: ratingColor }}>
                  {rom.rating.toFixed(1)}
                </span>
                <Flame className="w-5 h-5" style={{ color: ratingColor }} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <AvatarCluster count={3} />
              <span className="text-[11px] text-white/30 font-mono">
                Reviews: {(rom.rating * 30 + 19) | 0}
              </span>
            </div>
          </motion.div>

          {/* Developer */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <PillCard label="Developer" value={rom.developer || 'Unknown'} gradient={rom.consoleGradient} />
          </motion.div>

          {/* Publisher (use console name as publisher) */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
            <PillCard label="Publisher" value={rom.developer || rom.consoleName} gradient={rom.consoleGradient} />
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 }}
          className="flex flex-col gap-5 pt-1 min-w-0"
        >
          {/* Title */}
          <div>
            <div className="flex items-start gap-2 mb-1">
              <Bookmark className="w-5 h-5 text-primary mt-1 shrink-0" />
              <h1 className="text-3xl font-black text-white leading-tight">
                {rom.title}
              </h1>
            </div>
            <p className="text-[13px] text-white/40 font-semibold ml-7">
              {rom.genre}
            </p>
          </div>

          {/* Description */}
          <p className="text-[14px] leading-relaxed text-white/55 italic max-w-lg">
            {rom.description || 'No description available for this ROM.'}
          </p>

          {/* Metadata 2×2 grid */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-4 border-t border-b border-white/6 py-4">
            {/* Row 1 */}
            <MetaCol label="Language">
              <span>
                Multi{' '}
                <span className="text-white/30 font-normal text-[12px]">· {rom.region || 'EUR'}</span>
              </span>
            </MetaCol>

            <MetaCol label="Works on">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-white/40" />
                {worksOn}
              </span>
            </MetaCol>

            {/* Row 2 */}
            <MetaCol label="Release date">
              {releaseDateStr}
            </MetaCol>

            <MetaCol label="Age rating">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-black text-white">18</span>
                <span className="text-[13px] text-white/60">NC-17</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#1a1a28] border border-white/10 text-[10px] font-bold text-white/60 flex items-center gap-1">
                  <Gamepad2 className="w-2.5 h-2.5" /> PARTIAL
                </span>
              </div>
            </MetaCol>
          </div>

          {/* Icon action buttons */}
          <div className="flex items-center gap-2">
            <IconBtn icon={User} />
            <IconBtn icon={Users} />
            <IconBtn icon={Download} />
            <IconBtn icon={Trophy} />
            <IconBtn icon={Lock} />
            <IconBtn icon={Gamepad2} active />
          </div>

          {/* Platform selector + CTA */}
          <div className="flex flex-col gap-3">
            {/* Platform hint */}
            <div className="flex items-center gap-3">
              {/* Emulator badge (styled like platform icons) */}
              <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center neon-glow">
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white/30" />
              </div>
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white/30" />
              </div>
            </div>

            {/* Download/launch button */}
            {rom.downloadUrl ? (
              <a
                href={rom.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-2xl font-black text-[15px] text-black bg-white hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_24px_rgba(255,255,255,0.12)] w-fit"
              >
                <Download className="w-4 h-4" />
                Download ROM
              </a>
            ) : (
              <button disabled
                className="inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl font-black text-[15px] bg-white/15 text-white/30 cursor-not-allowed w-fit">
                <Download className="w-4 h-4" /> No Link Available
              </button>
            )}

            <p className="text-[11px] text-white/25">
              Select an emulator to run this ROM on your system.
            </p>
          </div>

          {/* Instructions (collapsed by default) */}
          {rom.instructions && rom.instructions.length > 0 && (
            <details className="group rounded-2xl bg-[#1a1a28] border border-white/6 overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none text-[12px] font-bold text-white/40 uppercase tracking-widest hover:text-white/60 transition-colors">
                Setup Instructions
                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              </summary>
              <ol className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                {rom.instructions.map((step, i) => (
                  <li key={i} className="text-[13px] text-white/55 flex gap-2.5 leading-relaxed">
                    <span className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: rom.consoleGradient }}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM — Screenshot / Trailer gallery
      ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="relative"
      >
        {/* Nav arrows (left side, stacked) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          <button onClick={next}
            className="w-8 h-8 rounded-xl bg-primary/70 hover:bg-primary border border-primary/50 flex items-center justify-center transition-all hover:scale-110 neon-glow">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
          <button onClick={prev}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all hover:scale-110">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Main slide */}
        <div className="rounded-2xl overflow-hidden border border-white/8 shadow-[0_8px_40px_rgba(0,0,0,0.6)] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={slideIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              {slides[slideIdx] ? (
                <img
                  src={slides[slideIdx]}
                  alt={`Screenshot ${slideIdx + 1}`}
                  className="w-full h-64 object-cover object-center"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center"
                  style={{ background: rom.consoleGradient }}>
                  <span className="font-black text-5xl text-white/20 uppercase">{rom.title}</span>
                </div>
              )}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Play button */}
              {rom.videoId && slideIdx === 0 && (
                <a
                  href={`https://youtube.com/watch?v=${rom.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-black/80 transition-all">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </div>
                </a>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[12px] font-bold font-mono">
                {slideIdx + 1} of {totalSlides}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${((slideIdx + 1) / totalSlides) * 100}%`,
                    background: rom.consoleGradient,
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scroll Down hint */}
        <div className="absolute right-0 bottom-6 flex items-center gap-2 text-[11px] text-white/25">
          Scroll Down
          <ChevronDown className="w-4 h-4" />
        </div>

        {/* Dot indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slideIdx ? 'w-6 h-1.5' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
                style={i === slideIdx ? { background: rom.consoleGradient } : undefined}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── More from console ── */}
      {(() => {
        const others = (console_?.roms ?? [])
          .filter((r) => r.id !== rom.id)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        if (!others.length) return null;
        return (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full" style={{ background: rom.consoleGradient }} />
                More from {rom.consoleName}
              </h2>
              <Link href={`/browse?platformId=${rom.consoleId}`}
                className="text-[11px] text-primary/60 hover:text-primary transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {others.map((r) => (
                <Link key={r.id} href={`/rom/${encodeURIComponent(r.id)}`}>
                  <div className="group rounded-xl overflow-hidden border border-white/6 hover:border-white/20 transition-all hover:-translate-y-0.5 cursor-pointer bg-[#1a1a28]">
                    <div className="aspect-[3/4] relative">
                      {r.coverUrl ? (
                        <img src={r.coverUrl} alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3"
                          style={{ background: rom.consoleGradient }}>
                          <span className="font-black text-base text-white/25 uppercase text-center leading-tight">{r.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-[12px] font-bold text-white leading-tight line-clamp-2">{r.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-white/50 font-mono">{r.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
