import { Link, useLocation } from 'wouter';
import {
  Home, Gamepad2, Layers3, Download, Library as LibraryIcon,
  Newspaper, Settings, Zap, AppWindow, Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetDownloads } from '@workspace/api-client-react';
import { useLang } from '@/contexts/language-context';

function NavLink({
  href, label, icon: Icon, badge, location,
}: {
  href: string; label: string; icon: React.ElementType;
  badge?: React.ReactNode; location: string;
}) {
  const isActive = location === href || (href !== '/' && location.startsWith(href));
  return (
    <Link href={href}>
      <div className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group relative',
        isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}>
        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary neon-glow" />}
        <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive && 'drop-shadow-[0_0_6px_rgba(124,58,237,0.8)]')} />
        <span className="text-[13px] font-medium truncate">{label}</span>
        {badge && <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { data: downloads } = useGetDownloads();
  const { t } = useLang();
  const activeCount = downloads?.filter((d) => d.status === 'downloading').length ?? 0;

  const navItems = [
    { href: '/',          label: t('dashboard'),   icon: Home },
    { href: '/browse',    label: t('browseRoms'),  icon: Gamepad2 },
    { href: '/platforms', label: t('platforms'),   icon: Layers3 },
    { href: '/downloads', label: t('downloads'),   icon: Download },
    { href: '/library',   label: t('myLibrary'),   icon: LibraryIcon },
    { href: '/news',      label: t('newsFeed'),    icon: Newspaper },
  ];

  const toolItems = [
    { href: '/programs',  label: t('programs'),   icon: AppWindow },
    { href: '/emulation', label: t('emulators'),  icon: Cpu },
  ];

  return (
    <aside className="w-[160px] flex-shrink-0 flex flex-col z-20 border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center neon-glow"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)' }}>
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-black text-[13px] tracking-[0.2em] uppercase neon-text">NeonROM</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-2 mb-1">
          {t('menu')}
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} location={location}
            badge={item.href === '/downloads' && activeCount > 0 ? activeCount : undefined} />
        ))}
        <div className="pt-3 pb-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-2">
            {t('tools')}
          </p>
          {toolItems.map((item) => (
            <NavLink key={item.href} {...item} location={location} />
          ))}
        </div>
      </nav>

      {/* Settings link */}
      <div className="px-3 pb-3">
        <Link href="/settings">
          <div className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer relative',
            location === '/settings' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}>
            {location === '/settings' && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary neon-glow" />}
            <Settings className={cn('w-4 h-4', location === '/settings' && 'drop-shadow-[0_0_6px_rgba(124,58,237,0.8)]')} />
            <span className="text-[13px] font-medium">{t('settings')}</span>
          </div>
        </Link>
      </div>

      {/* Upgrade card */}
      <div className="mx-3 mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5">
        <Zap className="w-4 h-4 text-primary mb-1.5" />
        <p className="text-[11px] font-bold mb-0.5">{t('upgradePlan')}</p>
        <p className="text-[10px] text-muted-foreground leading-tight mb-2">{t('upgradeSub')}</p>
        <button className="w-full text-[11px] font-bold bg-primary text-primary-foreground py-1.5 rounded-lg neon-glow hover:bg-primary/90 transition-colors">
          {t('upgradeNow')}
        </button>
      </div>
    </aside>
  );
}
