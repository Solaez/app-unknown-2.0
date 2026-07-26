import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronDown, ChevronUp, Download,
  Play, Star, Users, Calendar, HardDrive, Globe,
  Cpu, Gamepad2, Shield, Check, ThumbsUp,
  Monitor, Package, ExternalLink,
} from 'lucide-react';
import { useRomById, useConsoles } from '@/hooks/use-rom-data';

/* ── accent colour for this page ── */
const A = '#c8a84b'; // gold/amber

/* ── helpers ── */
function Accordion({
  title, count, defaultOpen = false, children,
}: { title: string; count?: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/6 rounded-xl overflow-hidden" style={{ background: '#1a1a12' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <span className="font-bold text-[15px] text-white flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-[12px] text-white/40 font-normal">{count}</span>
          )}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/6"
          >
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureLine({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-white/60">
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: A }} />
      {text}
    </div>
  );
}

/* ── star bar chart row ── */
function StarBar({ stars, pct }: { stars: number; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-white/40">
      <span className="w-3 text-right">{stars}</span>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: A }} />
      </div>
      <span className="w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function RomDetails() {
  const [, params] = useRoute('/rom/:id');
  const romId = params?.id ? decodeURIComponent(params.id) : '';
  const { data: rom, isLoading } = useRomById(romId);
  const { data: consoles } = useConsoles();

  const [activeThumb, setActiveThumb] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 -mx-6 -mt-6 bg-white/5 animate-pulse" />
        <div className="grid grid-cols-[1fr_340px] gap-6 mt-4">
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-white/5 animate-pulse rounded-lg" />
            <div className="h-64 bg-white/5 animate-pulse rounded-xl" />
          </div>
          <div className="h-80 bg-white/5 animate-pulse rounded-xl" />
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

  /* build media array */
  const media: { type: 'image' | 'video'; url: string; thumb: string }[] = [];
  if (rom.videoId) {
    media.push({
      type: 'video',
      url: `https://youtube.com/watch?v=${rom.videoId}`,
      thumb: `https://img.youtube.com/vi/${rom.videoId}/mqdefault.jpg`,
    });
  }
  if (rom.coverUrl) {
    media.push({ type: 'image', url: rom.coverUrl, thumb: rom.coverUrl });
  }
  if (media.length === 0) media.push({ type: 'image', url: '', thumb: '' });

  const current = media[activeThumb];

  /* fake review distribution based on rating */
  const r = rom.rating;
  const bars = [
    { stars: 5, pct: Math.round(r >= 4.5 ? 80 : r >= 4 ? 60 : 35) },
    { stars: 4, pct: Math.round(r >= 4 ? 15 : r >= 3 ? 30 : 20) },
    { stars: 3, pct: Math.round(r >= 3 ? 4 : 15) },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 1 },
  ];
  const reviewCount = Math.round(r * 30 + 19);

  /* related ROMs */
  const related = (console_?.roms ?? [])
    .filter((r2) => r2.id !== rom.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    /* break out of parent padding for hero */
    <div className="-mx-6 -mt-6" style={{ background: '#111108' }}>

      {/* ══ HERO ══ */}
      <div className="relative h-64 overflow-hidden">
        {rom.coverUrl ? (
          <img src={rom.coverUrl} alt={rom.title}
            className="w-full h-full object-cover object-top"
            style={{ filter: 'brightness(0.55) saturate(1.2)' }} />
        ) : (
          <div className="w-full h-full" style={{ background: rom.consoleGradient, filter: 'brightness(0.45)' }} />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111108] via-[#111108]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111108]/80 via-transparent to-transparent" />
      </div>

      {/* ══ CONTENT WRAPPER ══ */}
      <div className="px-6 pb-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-white/30 mb-3 -mt-2">
          <Link href="/" className="hover:text-white/60 transition-colors">ROMs</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-white/60 cursor-pointer transition-colors">{rom.genre}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/50">{rom.title}</span>
        </div>

        {/* Title + meta pills */}
        <div className="mb-6">
          <h1 className="text-4xl font-black text-white mb-3 leading-tight">
            {rom.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/45">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: A }} />
              Releases date: <strong className="text-white/70">{rom.year}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: A }} />
              Multi language: <strong className="text-white/70">Yes</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" style={{ color: A }} />
              {rom.players} player{rom.players !== '1' ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" style={{ color: A }} />
              {rom.size}
            </span>
          </div>
        </div>

        {/* ══ TWO-COLUMN LAYOUT ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-4">

            {/* Screenshots accordion */}
            <Accordion title="Screenshots" defaultOpen>
              <div className="flex gap-3">
                {/* Thumbnail strip */}
                {media.length > 1 && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {media.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveThumb(i)}
                        className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          i === activeThumb ? 'border-[#c8a84b]' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        {m.thumb ? (
                          <img src={m.thumb} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" style={{ background: rom.consoleGradient }} />
                        )}
                        {m.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Main preview */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-black/40">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeThumb}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative"
                    >
                      {current.url ? (
                        <img src={current.url} alt={rom.title}
                          className="w-full aspect-video object-cover block" />
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center"
                          style={{ background: rom.consoleGradient }}>
                          <span className="font-black text-4xl text-white/20 uppercase">{rom.title}</span>
                        </div>
                      )}

                      {/* Video overlay */}
                      {current.type === 'video' && (
                        <a href={current.url} target="_blank" rel="noopener noreferrer"
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group">
                          <div className="w-14 h-14 rounded-full bg-black/70 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                          </div>
                        </a>
                      )}

                      {/* Bottom bar with counter */}
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/60">
                        {activeThumb + 1} / {media.length}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </Accordion>

            {/* Description accordion */}
            <Accordion title="Description" defaultOpen>
              <p className="text-[14px] leading-relaxed text-white/55">
                {rom.description || 'No description available for this ROM.'}
                {rom.description && rom.description.length > 200 && (
                  <button className="ml-1 underline underline-offset-2" style={{ color: A }}>
                    Read more...
                  </button>
                )}
              </p>
            </Accordion>

            {/* Requirements / Setup */}
            {rom.instructions && rom.instructions.length > 0 && (
              <Accordion title="Setup / Requirements">
                <ol className="space-y-3">
                  {rom.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-white/55 leading-relaxed">
                      <span
                        className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: A, color: '#111108' }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Accordion>
            )}

            {/* Reviews */}
            <Accordion title="Reviews" count={reviewCount}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Rating summary */}
                <div className="flex gap-5 items-start">
                  <div>
                    <p className="text-5xl font-black" style={{ color: A }}>{rom.rating.toFixed(1)}</p>
                    <div className="flex gap-0.5 mt-1.5 mb-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5"
                          style={{ color: s <= rom.rating ? A : 'rgba(255,255,255,0.1)', fill: s <= rom.rating ? A : 'transparent' }} />
                      ))}
                    </div>
                    <p className="text-[11px] text-white/30">{reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5 pt-1">
                    {bars.map((b) => <StarBar key={b.stars} {...b} />)}
                  </div>
                </div>

                {/* Featured review */}
                <div className="rounded-xl bg-black/30 border border-white/6 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-[11px] font-black text-white">
                        {rom.developer?.slice(0, 1) ?? 'U'}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white">{rom.developer ?? 'Anonymous'}</p>
                        <p className="text-[10px] text-white/30">{rom.consoleName}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-white/30 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {Math.round(reviewCount * 0.7)}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-white mb-1">
                    {rom.rating >= 4.5 ? 'Absolute classic! ⭐⭐⭐⭐⭐' : rom.rating >= 4 ? 'Great ROM! ⭐⭐⭐⭐' : 'Worth playing ⭐⭐⭐'}
                  </p>
                  <p className="text-[12px] text-white/45 leading-relaxed">
                    {rom.description
                      ? rom.description.slice(0, 140) + '...'
                      : `One of the best ${rom.genre} games for ${rom.consoleName}. Highly recommended for fans of the genre.`}
                  </p>
                </div>
              </div>
            </Accordion>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4 lg:sticky lg:top-4">

            {/* Download card */}
            <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#1a1a12' }}>
              {/* Edition tabs */}
              <div className="grid grid-cols-2 border-b border-white/6">
                {['Standard', 'Emulation'].map((tab, i) => (
                  <button key={tab}
                    className={`py-3 text-[12px] font-bold transition-all ${
                      i === 0
                        ? 'text-white border-b-2'
                        : 'text-white/35 hover:text-white/60'
                    }`}
                    style={i === 0 ? { borderBottomColor: A } : undefined}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* "Price" */}
                <div className="mb-4">
                  <p className="text-[11px] text-white/30 line-through mb-0.5">$59.99</p>
                  <div className="flex items-end gap-3">
                    <p className="text-3xl font-black text-white">FREE</p>
                    <span className="mb-1 text-[11px] font-bold px-2 py-0.5 rounded text-black"
                      style={{ background: A }}>
                      ROM
                    </span>
                  </div>
                  <p className="text-[11px] text-white/25 mt-1">
                    Requires {console_?.emulator ?? 'an emulator'} to run
                  </p>
                </div>

                {/* Download button */}
                {rom.downloadUrl ? (
                  <a href={rom.downloadUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-black mb-2.5 hover:brightness-110 active:scale-[0.98] transition-all"
                    style={{ background: A }}>
                    <Download className="w-4 h-4" />
                    Download ROM →
                  </a>
                ) : (
                  <button disabled
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-white/20 mb-2.5 cursor-not-allowed"
                    style={{ background: '#2a2a18' }}>
                    <Download className="w-4 h-4" /> No Link Available
                  </button>
                )}

                {/* Add to library */}
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-white/70 border border-white/10 hover:bg-white/5 transition-colors mb-5">
                  <Package className="w-4 h-4" /> Add to Library
                </button>

                {/* Feature list */}
                <div className="space-y-3 border-t border-white/6 pt-4">
                  <FeatureLine icon={Check} text={`Works on ${console_?.emulator ?? 'multiple emulators'}`} />
                  <FeatureLine icon={Shield} text={`Region: ${rom.region || 'Multi-region'}`} />
                  <FeatureLine icon={Monitor} text={`Format: ${console_?.fileExtensions?.slice(0,2).join(', ') ?? 'ROM'}`} />
                  <FeatureLine icon={HardDrive} text={`File size: ${rom.size}`} />
                  <FeatureLine icon={Users} text={`${rom.players} Player${rom.players !== '1' ? 's' : ''} supported`} />
                  {console_?.emulatorUrlWin && (
                    <a href={console_.emulatorUrlWin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] transition-colors hover:brightness-110"
                      style={{ color: A }}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      Download {console_.emulator}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Related ROMs (like bundles) */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#1a1a12' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                  <p className="font-bold text-[13px] text-white">More from {rom.consoleName}</p>
                  <Link href={`/browse?platformId=${rom.consoleId}`}
                    className="text-[11px] hover:brightness-110 transition-colors"
                    style={{ color: A }}>
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-white/4">
                  {related.map((r2) => (
                    <Link key={r2.id} href={`/rom/${encodeURIComponent(r2.id)}`}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/8">
                          {r2.coverUrl ? (
                            <img src={r2.coverUrl} alt={r2.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full" style={{ background: rom.consoleGradient }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-white truncate group-hover:text-[#c8a84b] transition-colors">{r2.title}</p>
                          <p className="text-[11px] text-white/35">{r2.genre}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-3 h-3 fill-[#c8a84b]" style={{ color: A }} />
                          <span className="text-[12px] font-mono text-white/50">{r2.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Console info card */}
            <div className="rounded-2xl border border-white/8 p-4" style={{ background: '#1a1a12' }}>
              <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold mb-3">Platform</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black text-black"
                  style={{ background: rom.consoleGradient }}>
                  {rom.consoleShortName.slice(0, 2)}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">{rom.consoleName}</p>
                  <p className="text-[12px] text-white/35">Emulator: {console_?.emulator ?? '—'}</p>
                </div>
              </div>
              {console_?.description && (
                <p className="text-[12px] text-white/35 mt-3 leading-relaxed border-t border-white/6 pt-3">
                  {console_.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
