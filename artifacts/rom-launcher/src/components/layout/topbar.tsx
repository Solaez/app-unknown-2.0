import { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, HelpCircle, ChevronDown, Newspaper,
  Gamepad2, PackagePlus, Zap, Wrench, User, Palette,
  LogOut, X, ExternalLink, CheckCircle, GitBranch, Download, ArrowUpCircle,
} from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useGetLatestNews } from '@workspace/api-client-react';
import { useRomData } from '@/hooks/use-rom-data';
import { useLang } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import {
  useGithubReleases,
  getDismissedVersion,
  setDismissedVersion,
} from '@/hooks/use-github-releases';

type Tab = 'today' | 'week' | 'earlier';

interface NotifItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  dot: string;
  title: string;
  description: string;
  time: string;
  href: string;
}

/** Format published_at into relative label */
function relativeLabel(isoDate: string, t: (k: any) => string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ${t('timeAgo')}`;
  if (days === 1) return `1d ${t('timeAgo')}`;
  return `${days}d ${t('timeAgo')}`;
}

/** Bucket a published_at date into today / week / earlier */
function bucket(isoDate: string): Tab {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = diff / 86_400_000;
  if (days < 1) return 'today';
  if (days < 7) return 'week';
  return 'earlier';
}

export default function Topbar() {
  const [, setLocation] = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [tab, setTab] = useState<Tab>('today');
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: news } = useGetLatestNews();
  const { data: romData } = useRomData();
  const { data: releases } = useGithubReleases();
  const { t } = useLang();
  const { accent } = useTheme();

  const recentRoms = romData
    ? romData.consoles
        .flatMap(c => c.roms.filter(r => r.year >= 2025).map(r => ({
          ...r, consoleName: c.name, consoleId: c.id, consoleGradient: c.gradient,
        })))
        .slice(0, 6)
    : [];

  // ── Startup update popup ──
  useEffect(() => {
    if (!releases || releases.length === 0) return;
    const latest = releases.find(r => !r.prerelease);
    if (!latest) return;
    const dismissed = getDismissedVersion();
    if (dismissed !== latest.tag_name) {
      setShowUpdatePopup(true);
    }
  }, [releases]);

  const latestRelease = releases?.find(r => !r.prerelease);

  function dismissUpdate() {
    if (latestRelease) setDismissedVersion(latestRelease.tag_name);
    setShowUpdatePopup(false);
  }

  // ── Build release notification items ──
  const releaseNotifItems: NotifItem[] = (releases ?? [])
    .filter(r => !r.prerelease)
    .slice(0, 8)
    .map((r) => ({
      id: `release-${r.id}`,
      icon: <GitBranch className="w-4 h-4" />,
      iconBg: 'bg-emerald-500/15',
      dot: '#10b981',
      title: `${t('releaseTitle')} ${r.tag_name}`,
      description: `${t('releaseSub')} · ${r.name || r.tag_name}`,
      time: relativeLabel(r.published_at, t),
      href: r.html_url,
    }));

  // ── Build news/rom notification items ──
  const newsItems: NotifItem[] = (news ?? []).slice(0, 4).map((n, i) => ({
    id: `news-${n.id}`,
    icon: <Newspaper className="w-4 h-4" />,
    iconBg: 'bg-primary/15',
    dot: 'hsl(var(--primary))',
    title: n.title,
    description: n.summary ?? '',
    time: `${i + 1}h ${t('timeAgo')}`,
    href: '/news',
  }));

  const romItems: NotifItem[] = recentRoms.slice(0, 4).map((r, i) => ({
    id: `rom-${r.id}`,
    icon: <Gamepad2 className="w-4 h-4" />,
    iconBg: 'bg-blue-500/15',
    dot: '#3b82f6',
    title: r.title,
    description: `${r.consoleName} · ${r.size ?? 'Available'}`,
    time: `${i + 4}h ${t('timeAgo')}`,
    href: `/rom/${r.id}`,
  }));

  // ── Tab bucketing ──
  const allItems = [
    ...releaseNotifItems,
    ...newsItems.slice(0, 2),
    ...romItems.slice(0, 2),
  ];

  const byTab: Record<Tab, NotifItem[]> = { today: [], week: [], earlier: [] };
  releaseNotifItems.forEach(item => {
    const release = releases?.find(r => `release-${r.id}` === item.id);
    if (release) byTab[bucket(release.published_at)].push(item);
  });
  // Pad today/week with news & rom items if no releases fall there
  if (byTab.today.length === 0) byTab.today.push(...newsItems.slice(0, 2));
  if (byTab.week.length === 0) byTab.week.push(...newsItems.slice(2, 4));
  byTab.earlier.push(...romItems.slice(0, 2));

  const items = byTab[tab];

  const totalCount = (releases?.filter(r => !r.prerelease).length ?? 0) +
    (news?.length ?? 0) + recentRoms.length;

  // Close panels on outside click
  useEffect(() => {
    if (!showNotifs && !showProfile) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs, showProfile]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString();
    if (q) setLocation(`/browse?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-5 z-30 flex-shrink-0 relative bg-card">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search" name="q"
              placeholder={t('searchPlaceholder')}
              className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-12 py-1.5 text-[13px] focus:outline-none focus:border-primary/40 focus:bg-muted/80 transition-all placeholder:text-muted-foreground/60 text-foreground"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border">
              ⌘ K
            </span>
          </form>
        </div>

        <div className="flex items-center gap-1 ml-4">
          {/* ── Notifications ── */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
              className="relative p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black text-primary-foreground px-0.5 bg-primary">
                  {Math.min(totalCount, 99)}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-[400px] rounded-2xl overflow-hidden shadow-2xl z-[9999] bg-card border border-border">
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <h3 className="text-[17px] font-bold text-foreground tracking-tight">{t('notifCenter')}</h3>
                  <Link href="/news" onClick={() => setShowNotifs(false)}
                    className="text-[13px] font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors px-3 py-1.5 rounded-lg">
                    {t('seeAll')}
                  </Link>
                </div>

                {/* Latest release banner */}
                {latestRelease && (
                  <div className="mx-5 mb-3 p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-emerald-400 leading-tight">UnknownGestor {latestRelease.tag_name}</p>
                      <p className="text-[11px] text-muted-foreground">{relativeLabel(latestRelease.published_at, t)}</p>
                    </div>
                    <a
                      href={latestRelease.html_url}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      {t('updateDownload')}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-1 px-5 pb-3">
                  {([
                    { id: 'today' as Tab, label: t('today') },
                    { id: 'week' as Tab, label: t('thisWeek') },
                    { id: 'earlier' as Tab, label: t('earlier') },
                  ] as const).map(tb => (
                    <button key={tb.id} onClick={() => setTab(tb.id)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all',
                        tab === tb.id
                          ? 'bg-background text-foreground shadow-sm border border-border'
                          : 'text-muted-foreground hover:text-foreground',
                      )}>
                      {tb.label}
                    </button>
                  ))}
                </div>

                <div className="max-h-[380px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                      <Bell className="w-8 h-8 mb-3 opacity-30" />
                      <p className="text-[13px] font-semibold">{t('noNotifs')}</p>
                      <p className="text-[11px] mt-1 opacity-70">{t('upToDate')}</p>
                    </div>
                  ) : items.map((item, idx) => {
                    const isExternal = item.href.startsWith('http');
                    const inner = (
                      <div className={cn('flex items-start gap-3.5 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer', idx > 0 && 'border-t border-border')}>
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-muted-foreground mt-0.5', item.iconBg)}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.dot }} />
                              <p className="text-[13.5px] font-bold text-foreground leading-snug line-clamp-1">{item.title}</p>
                            </div>
                            <span className="text-[11px] text-muted-foreground shrink-0 font-medium flex items-center gap-1">
                              {item.time}
                              {isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-50" />}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 pl-3.5">{item.description}</p>
                        </div>
                      </div>
                    );
                    return isExternal ? (
                      <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setShowNotifs(false)}>
                        {inner}
                      </a>
                    ) : (
                      <Link key={item.id} href={item.href} onClick={() => setShowNotifs(false)}>
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Help ── */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* ── Profile ── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-muted/60 transition-colors ml-1"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))` }}>
                G
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[12px] font-semibold leading-tight">Gamer</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{t('freePlan')}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-[220px] rounded-2xl overflow-hidden shadow-2xl z-[9999] bg-card border border-border py-1.5">
                <div className="px-4 py-3 border-b border-border mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))` }}>
                      G
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">Gamer</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                        style={{ color: accent, borderColor: `${accent}44`, background: `${accent}15` }}>
                        {t('freePlan')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setShowProfile(false); setLocation('/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[13px] font-medium text-foreground">{t('viewProfile')}</span>
                </button>
                <button
                  onClick={() => { setShowProfile(false); setLocation('/settings?tab=appearance'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                >
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[13px] font-medium text-foreground">{t('appearance')}</span>
                </button>

                <div className="border-t border-border mt-1 pt-1">
                  <div className="mx-3 my-2 p-2.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-foreground">{t('freePlan')}</p>
                      <p className="text-[10px] text-muted-foreground">Limited</p>
                    </div>
                    <button className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-primary-foreground neon-glow"
                      style={{ background: 'hsl(var(--primary))' }}>
                      Pro ⚡
                    </button>
                  </div>

                  <button
                    onClick={() => setShowProfile(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-destructive/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-destructive" />
                    <span className="text-[13px] font-medium text-destructive">{t('signOut')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Help modal ── */}
      {showHelp && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowHelp(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center neon-glow"
                  style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))` }}>
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[16px] font-black text-foreground">{t('helpTitle')}</h2>
                  <p className="text-[11px] text-muted-foreground">{t('helpVersion')} 2.0</p>
                </div>
              </div>
              <button onClick={() => setShowHelp(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <p className="text-[13px] text-muted-foreground leading-relaxed">{t('helpDesc')}</p>

              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2">{t('helpFeatures')}</p>
                <div className="space-y-2">
                  {([t('helpFeature1'), t('helpFeature2'), t('helpFeature3'), t('helpFeature4')]).map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
                      <span className="text-[13px] text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <a href="https://github.com/Solaez/UnknownGestor/releases" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('helpSupport')}
                </a>
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-bold text-primary-foreground neon-glow"
                  style={{ background: 'hsl(var(--primary))' }}>
                  {t('helpClose')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Update popup ── */}
      {showUpdatePopup && latestRelease && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Green header stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />

            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <ArrowUpCircle className="w-7 h-7 text-emerald-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">
                    UnknownGestor
                  </p>
                  <h2 className="text-[20px] font-black text-foreground leading-tight">
                    {t('updateAvailable')}
                  </h2>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    {t('updateSubtitle')}
                  </p>
                </div>

                <button
                  onClick={dismissUpdate}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Version badge */}
            <div className="mx-6 mb-4 p-3.5 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  {t('updateLatest')}
                </p>
                <p className="text-[22px] font-black text-foreground tracking-tight leading-none">
                  {latestRelease.tag_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">
                  {new Date(latestRelease.published_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1">
                  <GitBranch className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">main</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <a
                href={latestRelease.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismissUpdate}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-[14px] text-white bg-emerald-500 hover:bg-emerald-400 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('updateDownload')}
              </a>

              <a
                href={latestRelease.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-[13px] text-muted-foreground hover:text-foreground border border-border hover:border-border/80 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('updateChangelog')}
              </a>

              <button
                onClick={dismissUpdate}
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {t('updateDismiss')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
