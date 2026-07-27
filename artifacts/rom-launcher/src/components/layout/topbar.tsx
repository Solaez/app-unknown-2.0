import { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, X, Newspaper, Gamepad2, PackagePlus, ArrowRight } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useGetLatestNews } from '@workspace/api-client-react';
import { useRomData } from '@/hooks/use-rom-data';

const A = '#c8a84b';

export default function Topbar() {
  const [, setLocation] = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: news } = useGetLatestNews();
  const { data: romData } = useRomData();

  // Recently added ROMs — those marked year >= 2025 in the JSON are newly added entries
  const recentRoms = romData
    ? romData.consoles
        .flatMap(c =>
          c.roms
            .filter(r => r.year >= 2025)
            .map(r => ({
              ...r,
              consoleName: c.name,
              consoleId: c.id,
              consoleGradient: c.gradient,
            })),
        )
        .slice(0, 6)
    : [];

  const totalCount = (news?.length ?? 0) + recentRoms.length;

  // Close on outside click
  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = fd.get('q')?.toString();
    if (q) setLocation(`/browse?search=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className="h-14 border-b border-white/5 flex items-center justify-between px-5 z-10 flex-shrink-0"
      style={{ background: 'hsl(240 10% 3.5%)' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search anything..."
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-12 py-1.5 text-[13px] focus:outline-none focus:border-primary/40 focus:bg-white/8 transition-all placeholder:text-muted-foreground/60"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
            ⌘ K
          </span>
        </form>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-4">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-4 h-4" />
            {totalCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black text-black px-0.5"
                style={{ background: A }}
              >
                {Math.min(totalCount, 99)}
              </span>
            )}
          </button>

          {/* ── Panel ── */}
          {showNotifs && (
            <div
              className="absolute right-0 top-full mt-2 w-[380px] rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{
                background: '#111108',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[15px] text-white">Notificaciones</p>
                  {totalCount > 0 && (
                    <span
                      className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-black"
                      style={{ background: A }}
                    >
                      {totalCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors text-white/40"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="max-h-[480px] overflow-y-auto">

                {/* ── News section ── */}
                {news && news.length > 0 && (
                  <div>
                    <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                      <Newspaper className="w-3 h-3" style={{ color: A }} />
                      <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">
                        Noticias y Actualizaciones
                      </p>
                    </div>

                    {news.map(n => (
                      <Link
                        key={n.id}
                        href="/news"
                        onClick={() => setShowNotifs(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer"
                      >
                        {n.imageUrl ? (
                          <img
                            src={n.imageUrl}
                            alt={n.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/8"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(200,168,75,0.12)' }}
                          >
                            <Newspaper className="w-4 h-4" style={{ color: A }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white leading-snug line-clamp-2">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{n.summary}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-[9px] font-black px-1.5 py-0.5 rounded text-black"
                              style={{ background: A }}
                            >
                              {n.category}
                            </span>
                            <span className="text-[10px] text-white/25">{n.readTime} min lectura</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* ── Recent ROMs section ── */}
                {recentRoms.length > 0 && (
                  <div>
                    <div
                      className="px-4 pt-3 pb-1.5 flex items-center gap-2 border-t"
                      style={{ borderColor: news?.length ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                    >
                      <PackagePlus className="w-3 h-3" style={{ color: A }} />
                      <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">
                        ROMs Recién Agregados
                      </p>
                    </div>

                    {recentRoms.map(r => (
                      <Link
                        key={r.id}
                        href={`/rom/${r.id}`}
                        onClick={() => setShowNotifs(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden border border-white/8">
                          {r.coverUrl ? (
                            <img
                              src={r.coverUrl}
                              alt={r.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: r.consoleGradient }}
                            >
                              <Gamepad2 className="w-4 h-4 text-white/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate group-hover:text-[#c8a84b] transition-colors">
                            {r.title}
                          </p>
                          <p className="text-[11px] text-white/35">
                            {r.consoleName} · {r.size}
                          </p>
                        </div>
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: 'rgba(200,168,75,0.15)', color: A, border: `1px solid rgba(200,168,75,0.3)` }}
                        >
                          NUEVO
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!news?.length && !recentRoms.length && (
                  <div className="flex flex-col items-center justify-center py-14 text-white/25">
                    <Bell className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-[13px] font-semibold">Sin notificaciones</p>
                    <p className="text-[11px] mt-1">Todo está al día</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-3 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <Link
                  href="/news"
                  onClick={() => setShowNotifs(false)}
                  className="flex items-center justify-center gap-2 text-[12px] font-bold hover:opacity-80 transition-opacity"
                  style={{ color: A }}
                >
                  Ver todas las noticias
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
        {/* ── End Notification Bell ── */}

        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-white/5 transition-colors ml-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
          >
            G
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[12px] font-semibold leading-tight">Gamer</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Free Plan</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
