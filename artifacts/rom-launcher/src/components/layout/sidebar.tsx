import { Link, useLocation } from 'wouter';
import {
  Home,
  Gamepad2,
  Layers3,
  Download,
  Library as LibraryIcon,
  Newspaper,
  Settings,
  Zap,
  AppWindow,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetDownloads } from '@workspace/api-client-react';

const navItems = [
  { href: '/',          label: 'Dashboard',   icon: Home },
  { href: '/browse',    label: 'Browse ROMs', icon: Gamepad2 },
  { href: '/platforms', label: 'Platforms',   icon: Layers3 },
  { href: '/downloads', label: 'Downloads',   icon: Download },
  { href: '/library',   label: 'My Library',  icon: LibraryIcon },
  { href: '/news',      label: 'News Feed',   icon: Newspaper },
];

const toolItems = [
  { href: '/programs',  label: 'Programas',  icon: AppWindow },
  { href: '/emulation', label: 'Emuladores', icon: Cpu },
];

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  location,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: React.ReactNode;
  location: string;
}) {
  const isActive = location === href || (href !== '/' && location.startsWith(href));
  return (
    <Link href={href}>
      <div
        className={cn(
          'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer group relative',
          isActive
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary neon-glow" />
        )}
        <Icon
          className={cn(
            'w-4 h-4 shrink-0 transition-colors',
            isActive && 'drop-shadow-[0_0_6px_rgba(124,58,237,0.8)]',
          )}
        />
        <span className="text-[13px] font-medium truncate">{label}</span>
        {badge && (
          <span className="ml-auto bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { data: downloads } = useGetDownloads();
  const activeCount = downloads?.filter((d) => d.status === 'downloading').length ?? 0;

  return (
    <aside
      className="w-[160px] flex-shrink-0 flex flex-col z-20 border-r border-white/5"
      style={{ background: 'hsl(240 10% 3%)' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center neon-glow"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' }}
        >
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-black text-[13px] tracking-[0.2em] uppercase neon-text">NeonROM</span>
      </div>

      {/* Scrollable nav area */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {/* ── Menu section ── */}
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-2 mb-1">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            location={location}
            badge={item.href === '/downloads' && activeCount > 0 ? activeCount : undefined}
          />
        ))}

        {/* ── Herramientas section ── */}
        <div className="pt-3 pb-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-2">
            Herramientas
          </p>
          {toolItems.map((item) => (
            <NavLink key={item.href} {...item} location={location} />
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="px-3 pb-3">
        <Link href="/settings">
          <div
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer relative',
              location === '/settings'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            {location === '/settings' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary neon-glow" />
            )}
            <Settings
              className={cn('w-4 h-4', location === '/settings' && 'drop-shadow-[0_0_6px_rgba(124,58,237,0.8)]')}
            />
            <span className="text-[13px] font-medium">Settings</span>
          </div>
        </Link>
      </div>

      {/* Upgrade card */}
      <div className="mx-3 mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5">
        <Zap className="w-4 h-4 text-primary mb-1.5" />
        <p className="text-[11px] font-bold text-white mb-0.5">Upgrade Plan</p>
        <p className="text-[10px] text-muted-foreground leading-tight mb-2">
          Unlock faster downloads &amp; no limits
        </p>
        <button className="w-full text-[11px] font-bold bg-primary text-white py-1.5 rounded-lg neon-glow hover:bg-primary/90 transition-colors">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
