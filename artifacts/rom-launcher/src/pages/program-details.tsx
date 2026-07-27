import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronDown, ChevronUp, Download,
  Play, Star, Calendar, HardDrive, Globe,
  Cpu, Shield, Check, ThumbsUp,
  Monitor, ExternalLink, X,
  AppWindow, Tag, Package, RefreshCw, Puzzle,
} from 'lucide-react';
import { useProgramById } from '@/hooks/use-programs';
import type { ProgramDownload } from '@/hooks/use-programs';

const A = '#c8a84b';

const CATEGORY_COLORS: Record<string, string> = {
  Programas:   '#6366f1',
  Desarrollos: '#0078d4',
  Diseño:      '#f24e1e',
  Drivers:     '#05ff71',
  Juegos:      '#bb00ff',
  Emuladores:  '#c8a84b',
};

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

const DL_GROUPS = [
  { type: 'main',   label: 'Principal',   Icon: Download,  color: '#c8a84b', bg: 'rgba(200,168,75,0.12)',  border: 'rgba(200,168,75,0.30)',  iconBg: 'rgba(200,168,75,0.18)',  badge: '#000' },
  { type: 'update', label: 'Actualización',Icon: RefreshCw, color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.28)',  iconBg: 'rgba(96,165,250,0.15)',  badge: '#fff' },
  { type: 'dlc',    label: 'DLC / Extra',  Icon: Puzzle,    color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.28)', iconBg: 'rgba(167,139,250,0.15)', badge: '#fff' },
  { type: 'portable',label: 'Portable',   Icon: Package,   color: '#34d399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.28)',  iconBg: 'rgba(52,211,153,0.15)',  badge: '#000' },
];

function DownloadSheet({
  app, downloads, catColor, onClose,
}: { app: { name: string; coverUrl?: string; icon: string; category: string; version?: string; size?: string }; downloads: ProgramDownload[]; catColor: string; onClose: () => void }) {
  // Map known types to groups; anything unmatched goes to "main"
  const normalised = downloads.map(dl => ({
    ...dl,
    type: DL_GROUPS.find(g => g.type === dl.type) ? dl.type : 'main',
  }));

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto rounded-t-3xl overflow-hidden"
        style={{ background: '#141410', border: `1px solid ${catColor}26`, borderBottom: 'none' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Cover + title header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 flex items-center justify-center text-2xl"
            style={{ background: app.coverUrl ? undefined : `${catColor}22` }}>
            {app.coverUrl
              ? <img src={app.coverUrl} alt={app.name} className="w-full h-full object-cover" />
              : app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[16px] text-white truncate">{app.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                style={{ background: catColor }}>{app.category.toUpperCase()}</span>
              {app.version && <span className="text-[11px] text-white/40">v{app.version}</span>}
              {app.size && <span className="text-[11px] text-white/30">{app.size}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/8 shrink-0"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Download rows grouped by type */}
        <div className="px-4 py-3 space-y-2.5 max-h-[55vh] overflow-y-auto">
          {DL_GROUPS.flatMap(g => {
            const items = normalised.filter(d => d.type === g.type);
            const { Icon } = g;

            if (items.length > 0) {
              return items.map((item, i) => (
                <a key={`${g.type}-${i}`}
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] group cursor-pointer"
                  style={{ background: g.bg, border: `1px solid ${g.border}` }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: g.iconBg }}>
                    <Icon className="w-5 h-5" style={{ color: g.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-bold text-[14px] text-white truncate">{item.label || g.label}</p>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0"
                        style={{ background: g.color, color: g.badge }}>{g.label.toUpperCase()}</span>
                    </div>
                    <p className="text-[12px] text-white/45">{item.size || app.size || '—'}</p>
                  </div>
                  <Download className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: g.color }} />
                </a>
              ));
            }
            return [];
          })}

          {/* If no groups matched at all, render everything as plain rows */}
          {normalised.every(d => !DL_GROUPS.find(g => g.type === d.type)) &&
            normalised.map((dl, i) => (
              <a key={i}
                href={dl.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] group cursor-pointer"
                style={{ background: `${catColor}12`, border: `1px solid ${catColor}30` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${catColor}20` }}>
                  <Download className="w-5 h-5" style={{ color: catColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-white truncate">{dl.label}</p>
                  <p className="text-[12px] text-white/45">{dl.size || app.size || '—'}</p>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: catColor }} />
              </a>
            ))
          }
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] text-center text-white/25">
            Las descargas provienen de repositorios de terceros
          </p>
        </div>
      </motion.div>
    </>
  );
}

export default function ProgramDetails() {
  const [, params] = useRoute('/program/:id');
  const programId = params?.id ?? '';
  const { data: app, isLoading } = useProgramById(programId);

  const [activeThumb, setActiveThumb] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showDownloadSheet, setShowDownloadSheet] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 -mx-6 -mt-6 bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-4">
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-white/5 animate-pulse rounded-lg" />
            <div className="h-64 bg-white/5 animate-pulse rounded-xl" />
          </div>
          <div className="h-80 bg-white/5 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-24">
        <AppWindow className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="text-lg font-bold text-white">Programa no encontrado</p>
        <Link href="/programs" className="text-primary text-sm mt-2 inline-block underline underline-offset-4">
          Volver a Programas
        </Link>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[app.category] ?? A;

  /* build media array */
  const media: { type: 'image' | 'video'; url: string; thumb: string; videoId?: string }[] = [];

  if (app.videoId) {
    media.push({
      type: 'video',
      url: `https://youtube.com/watch?v=${app.videoId}`,
      thumb: `https://img.youtube.com/vi/${app.videoId}/mqdefault.jpg`,
      videoId: app.videoId,
    });
  }

  if (app.screenshots?.length) {
    for (const s of app.screenshots) {
      media.push({ type: 'image', url: s, thumb: s });
    }
  } else if (app.coverUrl) {
    media.push({ type: 'image', url: app.coverUrl, thumb: app.coverUrl });
  }

  if (media.length === 0) media.push({ type: 'image', url: '', thumb: '' });

  const safeThumb = Math.min(activeThumb, media.length - 1);
  const current = media[safeThumb];

  /* downloads */
  const downloads: ProgramDownload[] = app.downloads?.length
    ? app.downloads
    : app.downloadUrl
      ? [{ label: 'Descargar', url: app.downloadUrl, size: app.size ?? '', type: 'main' }]
      : [];

  /* rating display */
  const rating = app.rating ?? 0;
  const reviewCount = app.reviews ?? Math.round(rating * 30 + 19);
  const bars = [
    { stars: 5, pct: Math.round(rating >= 4.5 ? 80 : rating >= 4 ? 60 : 35) },
    { stars: 4, pct: Math.round(rating >= 4 ? 15 : rating >= 3 ? 30 : 20) },
    { stars: 3, pct: Math.round(rating >= 3 ? 4 : 15) },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 1 },
  ];

  return (
    <div className="-mx-6 -mt-6" style={{ background: '#111108' }}>

      {/* ══ HERO ══ */}
      <div className="relative h-64 overflow-hidden">
        {app.coverUrl ? (
          <img src={app.coverUrl} alt={app.name}
            className="w-full h-full object-cover object-top"
            style={{ filter: 'brightness(0.55) saturate(1.2)' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl"
            style={{ background: `${catColor}22` }}>
            {app.icon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111108] via-[#111108]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111108]/80 via-transparent to-transparent" />
      </div>

      {/* ══ CONTENT WRAPPER ══ */}
      <div className="px-6 pb-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-white/30 mb-3 -mt-2">
          <Link href="/programs" className="hover:text-white/60 transition-colors">Programas</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-white/60 cursor-pointer transition-colors">{app.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/50">{app.name}</span>
        </div>

        {/* Title + meta pills */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-white/10"
              style={{ background: `${app.color ?? catColor}cc` }}>
              {app.icon}
            </div>
            <h1 className="text-4xl font-black text-white leading-tight">{app.name}</h1>
            {app.isNew && (
              <span className="text-[11px] font-black px-2 py-0.5 rounded text-black self-start mt-1" style={{ background: A }}>NEW</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/45">
            {app.version && (
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" style={{ color: catColor }} />
                v{app.version}
              </span>
            )}
            {app.releaseDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" style={{ color: A }} />
                {app.releaseDate}
              </span>
            )}
            {app.platform && (
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5" style={{ color: A }} />
                {app.platform.split(',')[0]}
              </span>
            )}
            {app.size && (
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" style={{ color: A }} />
                {app.size}
              </span>
            )}
            {app.developer && (
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" style={{ color: A }} />
                {app.developer}
              </span>
            )}
            {app.language && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" style={{ color: A }} />
                {app.language}
              </span>
            )}
          </div>
        </div>

        {/* ══ TWO-COLUMN LAYOUT ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-4">

            {/* Media accordion */}
            {media.length > 0 && media[0].url && (
              <Accordion title={app.screenshots?.length ? 'Capturas de pantalla' : 'Media'} defaultOpen>
                <div className="flex gap-3">
                  {/* Thumbnail strip */}
                  {media.length > 1 && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {media.map((m, i) => (
                        <button
                          key={i}
                          onClick={() => { setActiveThumb(i); setVideoPlaying(false); }}
                          className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                            i === safeThumb ? 'border-[#c8a84b]' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {m.thumb ? (
                            <img src={m.thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: `${catColor}22` }}>
                              {app.icon}
                            </div>
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
                        key={safeThumb}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="relative"
                      >
                        {current.type === 'video' && videoPlaying && current.videoId ? (
                          <iframe
                            className="w-full aspect-video block"
                            src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&rel=0&modestbranding=1`}
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                          />
                        ) : current.url && current.type === 'image' ? (
                          <img src={current.url} alt={app.name}
                            className="w-full aspect-video object-cover block" />
                        ) : current.type === 'video' ? (
                          <img src={current.thumb} alt={app.name}
                            className="w-full aspect-video object-cover block" />
                        ) : (
                          <div className="w-full aspect-video flex items-center justify-center"
                            style={{ background: `${catColor}22` }}>
                            <span className="text-6xl">{app.icon}</span>
                          </div>
                        )}

                        {current.type === 'video' && !videoPlaying && (
                          <button
                            onClick={() => setVideoPlaying(true)}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group hover:bg-black/50 transition-colors"
                          >
                            <div className="w-16 h-16 rounded-full bg-red-600 border-2 border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-500 transition-all shadow-lg">
                              <Play className="w-7 h-7 text-white fill-white ml-1" />
                            </div>
                            <p className="mt-3 text-[13px] font-semibold text-white/70">Ver Tráiler</p>
                          </button>
                        )}

                        <div className="absolute bottom-3 right-3">
                          <span className="bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-mono text-white/60">
                            {safeThumb + 1} / {media.length}
                          </span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </Accordion>
            )}

            {/* Description */}
            <Accordion title="Descripción" defaultOpen>
              <p className="text-[14px] leading-relaxed text-white/55">
                {app.description || 'Sin descripción disponible.'}
              </p>
            </Accordion>

            {/* Tags */}
            {app.tags?.length > 0 && (
              <Accordion title="Etiquetas" defaultOpen>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((t) => (
                    <span key={t} className="text-[12px] px-2.5 py-1 rounded-lg border border-white/10 text-white/50">
                      {t}
                    </span>
                  ))}
                </div>
              </Accordion>
            )}

            {/* Setup / Instructions */}
            {app.instructions?.length > 0 && (
              <Accordion title="Instrucciones de instalación">
                <ol className="space-y-3">
                  {app.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-white/55 leading-relaxed">
                      <span
                        className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: catColor, color: '#111108' }}
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
            {rating > 0 && (
              <Accordion title="Valoraciones" count={reviewCount} defaultOpen>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-5 items-start">
                      <div>
                        <p className="text-5xl font-black" style={{ color: A }}>{rating.toFixed(1)}</p>
                        <div className="flex gap-0.5 mt-1.5 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5"
                              style={{ color: s <= rating ? A : 'rgba(255,255,255,0.1)', fill: s <= rating ? A : 'transparent' }} />
                          ))}
                        </div>
                        <p className="text-[11px] text-white/30">{reviewCount} valoraciones</p>
                      </div>
                      <div className="flex-1 space-y-1.5 pt-1">
                        {bars.map((b) => <StarBar key={b.stars} {...b} />)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/30 border border-white/6 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                          style={{ background: `${catColor}50` }}>
                          {app.developer?.slice(0, 1) ?? 'U'}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-white">{app.developer ?? 'Usuario'}</p>
                          <p className="text-[10px] text-white/30">{app.category}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-white/30 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {Math.round(reviewCount * 0.7)}
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-white mb-1">
                      {rating >= 4.5 ? '¡Imprescindible! ⭐⭐⭐⭐⭐' : rating >= 4 ? 'Muy buena herramienta ⭐⭐⭐⭐' : 'Vale la pena ⭐⭐⭐'}
                    </p>
                    <p className="text-[12px] text-white/45 leading-relaxed">
                      {app.description
                        ? app.description.slice(0, 140) + (app.description.length > 140 ? '...' : '')
                        : `Una de las mejores aplicaciones de la categoría ${app.category}.`}
                    </p>
                  </div>
                </div>
              </Accordion>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4 lg:sticky lg:top-4">

            {/* Download card */}
            <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#1a1a12' }}>
              <div className="p-5">
                <div className="mb-4">
                  <p className="text-[11px] text-white/30 mb-0.5">Precio</p>
                  <div className="flex items-end gap-3">
                    <p className="text-3xl font-black text-white">GRATIS</p>
                    <span className="mb-1 text-[11px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ background: catColor }}>{app.category.toUpperCase()}</span>
                  </div>
                  {app.version && (
                    <p className="text-[11px] text-white/25 mt-1">Versión {app.version}</p>
                  )}
                </div>

                {downloads.length > 0 ? (
                  <button
                    onClick={() => downloads.length === 1
                      ? window.open(downloads[0].url, '_blank')
                      : setShowDownloadSheet(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-black mb-2.5 hover:brightness-110 active:scale-[0.98] transition-all"
                    style={{ background: catColor }}>
                    <Download className="w-4 h-4" />
                    {downloads.length === 1 ? 'Descargar' : `Descargar (${downloads.length} opciones)`} →
                  </button>
                ) : (
                  <button disabled
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-white/20 mb-2.5 cursor-not-allowed"
                    style={{ background: '#2a2a18' }}>
                    <Download className="w-4 h-4" /> Sin enlace disponible
                  </button>
                )}

                <div className="space-y-3 border-t border-white/6 pt-4">
                  {app.platform && (
                    <FeatureLine icon={Check} text={`Compatible con ${app.platform.split(',').slice(0, 2).join(', ')}`} />
                  )}
                  {app.language && (
                    <FeatureLine icon={Globe} text={`Idioma: ${app.language}`} />
                  )}
                  {app.size && (
                    <FeatureLine icon={HardDrive} text={`Tamaño: ${app.size}`} />
                  )}
                  {app.publisher && app.publisher !== app.developer && (
                    <FeatureLine icon={Shield} text={`Publisher: ${app.publisher}`} />
                  )}
                  {app.developer && (
                    <FeatureLine icon={Cpu} text={`Developer: ${app.developer}`} />
                  )}
                  {app.videoId && (
                    <a href={`https://youtube.com/watch?v=${app.videoId}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] transition-colors hover:brightness-110"
                      style={{ color: '#ff4444' }}>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Ver Tráiler
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Category badge */}
            <div className="rounded-2xl border border-white/8 p-4" style={{ background: '#1a1a12' }}>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Categoría</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${catColor}20` }}>
                  {app.icon}
                </div>
                <div>
                  <p className="font-bold text-white text-[14px]">{app.category}</p>
                  <Link href="/programs" className="text-[12px] text-white/35 hover:text-white/60 transition-colors">
                    Ver todos →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Download sheet ── */}
      <AnimatePresence>
        {showDownloadSheet && (
          <DownloadSheet
            app={{ name: app.name, coverUrl: app.coverUrl, icon: app.icon, category: app.category, version: app.version, size: app.size }}
            downloads={downloads}
            catColor={catColor}
            onClose={() => setShowDownloadSheet(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
