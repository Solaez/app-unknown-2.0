import { useState } from 'react';
import { Download, Search, Star, AppWindow, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useSoftware } from '@/hooks/use-programs';
import type { Program, ProgramDownload } from '@/hooks/use-programs';

const A = '#c8a84b';

const CATEGORY_COLORS: Record<string, string> = {
  Programas:   '#6366f1',
  Desarrollos: '#0078d4',
  Diseño:      '#f24e1e',
  Drivers:     '#05ff71',
  Juegos:      '#bb00ff',
};

const ALL_CATS = ['Todos', 'Programas', 'Desarrollos', 'Diseño', 'Drivers', 'Juegos'];

/* ── Normalize download list ── */
function getDownloads(app: Program): ProgramDownload[] {
  if (app.downloads?.length) return app.downloads;
  if (app.downloadUrl) return [{ label: 'Descargar', url: app.downloadUrl, size: app.size ?? '', type: 'main' }];
  return [];
}

/* ── Single download row ── */
function DownloadRow({ dl, color }: { dl: ProgramDownload; color: string }) {
  return (
    <a
      href={dl.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all group"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <Download className="w-3 h-3 shrink-0" style={{ color }} />
      <span className="flex-1 text-[12px] font-semibold text-white truncate">{dl.label}</span>
      {dl.size && <span className="text-[10px] text-white/35 shrink-0">{dl.size}</span>}
    </a>
  );
}

/* ── Program card ── */
function ProgramCard({ app }: { app: Program }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[app.category] ?? A;
  const downloads = getDownloads(app);
  const SHOW = 2;
  const visible = expanded ? downloads : downloads.slice(0, SHOW);
  const hasMore = downloads.length > SHOW;

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden flex flex-col transition-all hover:border-white/16 hover:-translate-y-0.5 group"
      style={{ background: '#141410' }}
    >
      {/* Cover */}
      <div className="relative h-36 overflow-hidden bg-black/40 flex-shrink-0">
        {app.coverUrl ? (
          <img
            src={app.coverUrl}
            alt={app.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: `${app.color}22` }}
          >
            {app.icon}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,20,16,0.9) 0%, transparent 60%)' }} />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: catColor, color: '#fff' }}>
            {app.category.toUpperCase()}
          </span>
          {app.isNew && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-black" style={{ background: A }}>NEW</span>
          )}
        </div>
        <div
          className="absolute bottom-2 left-3 w-8 h-8 rounded-xl flex items-center justify-center text-lg border border-white/10"
          style={{ background: `${app.color}cc`, backdropFilter: 'blur(4px)' }}
        >
          {app.icon}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-[14px] text-white truncate">{app.name}</h3>
          <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed mt-0.5">{app.description}</p>
        </div>

        {/* Tags */}
        {app.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {app.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md border border-white/8 text-white/35">{t}</span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-white/30">
          {app.size && <span>{app.size}</span>}
          {app.platform && <span className="truncate">{app.platform.split(',')[0]}</span>}
          {app.rating > 0 && (
            <span className="flex items-center gap-0.5 ml-auto">
              <Star className="w-2.5 h-2.5 fill-current" style={{ color: A }} />
              {app.rating}
            </span>
          )}
        </div>

        {/* ── Downloads ── */}
        <div className="space-y-1.5 mt-auto">
          {visible.map((dl, i) => (
            <DownloadRow key={i} dl={dl} color={catColor} />
          ))}

          {hasMore && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold text-white/35 hover:text-white/60 hover:bg-white/5 transition-colors border border-white/6"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Mostrar menos</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {downloads.length - SHOW} opciones más</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Programs() {
  const { data, isLoading } = useSoftware();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todos');

  const apps = data?.apps ?? [];
  const filtered = apps.filter((a) => {
    const matchCat = cat === 'Todos' || a.category === cat;
    const q = search.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const counts: Record<string, number> = {};
  for (const a of apps) counts[a.category] = (counts[a.category] ?? 0) + 1;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div
        className="px-6 pt-8 pb-6 border-b border-white/5"
        style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <AppWindow className="w-6 h-6" style={{ color: '#6366f1' }} />
          <h1 className="text-[26px] font-black text-white tracking-tight">Programas</h1>
          <span
            className="text-[11px] font-black px-2 py-0.5 rounded-full text-white/60 border border-white/10"
            style={{ background: 'rgba(99,102,241,0.12)' }}
          >
            {apps.length}
          </span>
        </div>
        <p className="text-[13px] text-white/40 ml-9">Software, herramientas y aplicaciones para PC</p>
      </div>

      <div className="px-6 py-5">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              placeholder="Buscar programa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2 text-[13px] focus:outline-none focus:border-white/20 transition-all placeholder:text-white/25 text-white"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_CATS.map((c) => {
              const count = c === 'Todos' ? apps.length : (counts[c] ?? 0);
              const active = cat === c;
              const color = CATEGORY_COLORS[c] ?? A;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                  style={
                    active
                      ? { background: c === 'Todos' ? A : color, color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {c}
                  <span className="text-[10px] px-1 rounded" style={{ background: 'rgba(0,0,0,0.25)' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/4 h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/25">
            <Tag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-[15px] font-semibold">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((app) => (
              <ProgramCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
