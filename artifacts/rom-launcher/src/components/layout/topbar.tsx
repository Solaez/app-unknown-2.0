import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Topbar() {
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = fd.get('q')?.toString();
    if (q) setLocation(`/browse?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-5 z-10 flex-shrink-0"
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
        <button className="relative p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary neon-glow" />
        </button>
        <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-white/5 transition-colors ml-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
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
