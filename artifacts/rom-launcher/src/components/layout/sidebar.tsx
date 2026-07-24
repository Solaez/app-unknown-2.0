import { Link, useLocation } from 'wouter';
import { Home, Gamepad2, Layers, Download, Library as LibraryIcon, Newspaper, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetStats } from '@workspace/api-client-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { data: stats } = useGetStats();

  const activeDownloads = stats?.activeDownloads || 0;

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/browse', label: 'Browse ROMs', icon: Gamepad2 },
    { href: '/platforms', label: 'Platforms', icon: Layers },
    { href: '/downloads', label: 'Downloads', icon: Download, badge: activeDownloads },
    { href: '/library', label: 'My Library', icon: LibraryIcon },
    { href: '/news', label: 'News Feed', icon: Newspaper },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-background/80 backdrop-blur-xl flex flex-col z-20 flex-shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center neon-glow">
          <Gamepad2 className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-xl tracking-tight neon-text uppercase">NeonROM</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
        
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary neon-glow" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]")} />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full neon-glow">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground cursor-pointer transition-colors group">
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium text-sm">Settings</span>
        </div>
      </div>
    </aside>
  );
}
