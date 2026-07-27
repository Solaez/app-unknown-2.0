import { useState } from 'react';
import { Download, Search, Cpu, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useEmulators } from '@/hooks/use-programs';
import type { Program, ProgramDownload } from '@/hooks/use-programs';

const A = '#c8a84b';

function platformBadge(platform: string) {
  const p = platform.toLowerCase();
  const badges: { label: string; color: string }[] = [];
  if (p.includes('windows') || p.includes('win')) badges.push({ label: 'Windows', color: '#0078d4' });
  if (p.includes('linux'))                          badges.push({ label: 'Linux',   color: '#f7931e' });
  if (p.includes('mac') || p.includes('macos'))    badges.push({ label: 'macOS',   color: '#888' });
  if (p.includes('android'))                        badges.push({ label: 'Android', color: '#3ddc84' });
  if (p.includes('steam deck'))                     badges.push({ label: 'Steam Deck', color: '#1a9fff' });
  return badges.length ? badges : [{ label: platform.split(',')[0].trim(), color: '#888' }];
}

function getDownloads(app: Program): ProgramDownload[] {
  if (app.downloads?.length) return app.downloads;
  if (app.downloadUrl) return [{ label: 'Descargar', url: app.downloadUrl, size: app.size ?? '', type: 'main' }];
  return [];
}

/* ── Single download row ── */
function DownloadRow({ dl, color, compact }: { dl: ProgramDownload; color: string; compact?: boolean }) {
  return (
    <a
      href={dl.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2.5 ${compact ? 'px-3 py-2' : 'px-3 py-2.5'} rounded-xl hover:brightness-110 active:scale-[0.98] transition-all group`}
      style={{ background: `${color}18`, border: `1px solid ${color}35` }}
    >
      <Download className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="flex-1 text-[12px] font-semibold text-white truncate">{dl.label}</span>
      {dl.size && <span className="text-[10px] text-white/35 shrink-0">{dl.size}</span>}
      <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
    </a>
  );
}

/* ── Emulator card ── */
function EmulatorCard({ app }: { app: Program }) {
  const [imgErr, setImgErr] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const badges = platformBadge(app.platform ?? '');
  const systemName = app.tags?.[0] ?? '';
  const downloads = getDownloads(app);
  const SHOW = 2;
  const visible = expanded ? downloads : downloads.slice(0, SHOW);
  const hasMore = downloads.length > SHOW;

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden transition-all hover:border-white/18 hover:-translate-y-0.5"
      style={{ background: 'linear-gradient(145deg, #161612 0%, #111108 100%)' }}
    >
      {/* Accent bar */}
      <div className="h-1 w-full" style={{ background: app.color ?? A }} />

      <div className="p-5 flex gap-4">
        {/* Cover */}
        <div
          className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/8 flex items-center justify-center"
          style={{ background: `${app.color ?? A}18` }}
        >
          {app.coverUrl && !imgErr ? (
            <img src={app.coverUrl} alt={app.name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
          ) : (
            <span className="text-3xl">{app.icon}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-black text-[15px] text-white leading-tight">{app.name}</h3>
              {systemName && (
                <p className="text-[11px] font-semibold mt-0.5" style={{ color: app.color ?? A }}>{systemName}</p>
              )}
            </div>
            {app.isNew && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-black shrink-0" style={{ background: A }}>NEW</span>
            )}
          </div>

          <p className="text-[12px] text-white/40 line-clamp-2 leading-relaxed mb-3">{app.description}</p>

          {/* Platform badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {badges.map((b) => (
              <span key={b.label} className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${b.color}22`, color: b.color, border: `1px solid ${b.color}44` }}>
                {b.label}
              </span>
            ))}
          </div>

          {/* Extra tags */}
          {app.tags?.length > 1 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {app.tags.slice(1, 4).map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded border border-white/8 text-white/30">{t}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/30">{app.size}</span>
            {app.version && app.version !== '1.0.0' && (
              <span className="text-[11px] text-white/30">v{app.version}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Downloads ── */}
      <div className="px-5 pb-5 space-y-1.5">
        {visible.map((dl, i) => (
          <DownloadRow key={i} dl={dl} color={app.color ?? A} />
        ))}

        {hasMore && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold text-white/35 hover:text-white/60 hover:bg-white/5 transition-colors border border-white/6"
          >
            {expanded
              ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</>
              : <><ChevronDown className="w-3 h-3" /> {downloads.length - SHOW} opciones más</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

export default function EmulationHub() {
  const { data, isLoading } = useEmulators();
  const [search, setSearch] = useState('');

  const emulators = data?.apps ?? [];
  const filtered = emulators.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div
        className="px-6 pt-8 pb-6 border-b border-white/5"
        style={{ background: 'linear-gradient(180deg, rgba(0,170,255,0.07) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,170,255,0.18)', border: '1px solid rgba(0,170,255,0.3)' }}
          >
            <Cpu className="w-4 h-4" style={{ color: '#00aaff' }} />
          </div>
          <h1 className="text-[26px] font-black text-white tracking-tight">Centro de Emulación</h1>
          <span
            className="text-[11px] font-black px-2 py-0.5 rounded-full border"
            style={{ background: 'rgba(0,170,255,0.1)', color: '#00aaff', borderColor: 'rgba(0,170,255,0.25)' }}
          >
            {emulators.length} emuladores
          </span>
        </div>
        <p className="text-[13px] text-white/40 ml-12">
          Emuladores de consola para jugar tus ROMs en PC, Linux y Android
        </p>

        <div className="flex gap-4 mt-5 ml-12">
          {[
            { label: 'Plataformas', value: new Set(emulators.flatMap(e => e.tags?.slice(0, 1))).size },
            { label: 'Open Source', value: emulators.filter(e => e.tags?.some(t => t.toLowerCase().includes('open') || t.toLowerCase().includes('gpl'))).length },
            { label: 'Nuevos', value: emulators.filter(e => e.isNew).length },
          ].map((s) => (
            <div key={s.label}
              className="px-3 py-2 rounded-xl border border-white/8 flex flex-col items-center"
              style={{ background: 'rgba(0,170,255,0.06)' }}>
              <p className="text-[18px] font-black text-white">{s.value}</p>
              <p className="text-[10px] text-white/35 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Search */}
        <div className="relative max-w-xs mb-6">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder="Buscar emulador o consola..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2 text-[13px] focus:outline-none focus:border-white/20 transition-all placeholder:text-white/25 text-white"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/4 h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/25">
            <Cpu className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-[15px] font-semibold">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app) => (
              <EmulatorCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
