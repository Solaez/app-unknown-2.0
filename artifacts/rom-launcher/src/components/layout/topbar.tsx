import { Search, Bell } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Topbar() {
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = fd.get('q')?.toString();
    if (q) {
      setLocation(`/browse?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="search"
            name="q"
            placeholder="Search ROMs, Platforms, Genres..."
            className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          />
        </form>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary neon-glow-blue"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px] cursor-pointer">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            <span className="text-xs font-bold font-mono">U1</span>
          </div>
        </div>
      </div>
    </header>
  );
}
