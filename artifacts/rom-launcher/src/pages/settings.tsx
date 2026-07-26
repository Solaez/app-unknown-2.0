import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Users, Bell, Shield, Palette, Link2, CreditCard,
  Keyboard, Cpu, Download, HardDrive, Gamepad2, Info,
  Check, ChevronRight, RefreshCw, Folder, Zap, Globe,
  Moon, Sun, Monitor, Sliders, ToggleLeft, ToggleRight,
  Volume2, Wifi, Database, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── persistence helpers ─── */
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`neonrom-settings-${key}`);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, value: T) {
  localStorage.setItem(`neonrom-settings-${key}`, JSON.stringify(value));
}

/* ─── types ─── */
type Section =
  | 'profile' | 'appearance' | 'emulators' | 'downloads'
  | 'library' | 'connections' | 'shortcuts' | 'about';

interface AppSettings {
  theme: 'dark' | 'light' | 'auto';
  accent: string;
  density: number;
  cornerRadius: number;
  smoothAnimations: boolean;
  boldFocus: boolean;
  reducedMotion: boolean;
  romSourceUrl: string;
  downloadPath: string;
  concurrentDownloads: number;
  autoExtract: boolean;
  bandwidthLimit: number;
  bandwidthEnabled: boolean;
  scanOnStartup: boolean;
  autoFetchCovers: boolean;
  libraryPath: string;
  notifyCompleted: boolean;
  notifyUpdates: boolean;
  soundEffects: boolean;
  username: string;
  plan: string;
}

const defaults: AppSettings = {
  theme: 'dark',
  accent: '#7c3aed',
  density: 1,
  cornerRadius: 12,
  smoothAnimations: true,
  boldFocus: false,
  reducedMotion: false,
  romSourceUrl: 'https://raw.githubusercontent.com/Solaez/link-pivigames/refs/heads/main/roms.json',
  downloadPath: '~/Downloads/ROMs',
  concurrentDownloads: 3,
  autoExtract: true,
  bandwidthLimit: 50,
  bandwidthEnabled: false,
  scanOnStartup: true,
  autoFetchCovers: true,
  libraryPath: '~/Documents/ROMs',
  notifyCompleted: true,
  notifyUpdates: true,
  soundEffects: false,
  username: 'Gamer',
  plan: 'Free',
};

const ACCENTS = [
  { color: '#2563eb', name: 'Cobalt' },
  { color: '#10b981', name: 'Emerald' },
  { color: '#f59e0b', name: 'Amber' },
  { color: '#f97316', name: 'Orange' },
  { color: '#ef4444', name: 'Red' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#7c3aed', name: 'Violet' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#e11d48', name: 'Coral' },
];

const EMULATORS: { console: string; shortName: string; value: string; options: string[] }[] = [
  { console: 'Nintendo Wii', shortName: 'Wii', value: 'Dolphin', options: ['Dolphin', 'Mupen64Plus'] },
  { console: 'Nintendo DS', shortName: 'NDS', value: 'DeSmuME', options: ['DeSmuME', 'melonDS'] },
  { console: 'PlayStation 2', shortName: 'PS2', value: 'PCSX2', options: ['PCSX2', 'Play!'] },
  { console: 'PlayStation 3', shortName: 'PS3', value: 'RPCS3', options: ['RPCS3'] },
  { console: 'Game Boy Advance', shortName: 'GBA', value: 'mGBA', options: ['mGBA', 'VisualBoyAdvance-M', 'RetroArch'] },
  { console: 'SNES', shortName: 'SNES', value: 'Snes9x', options: ['Snes9x', 'bsnes', 'RetroArch'] },
];

/* ─── sub-components ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-all duration-300 shrink-0',
        checked ? 'bg-primary' : 'bg-white/10'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg',
          checked ? 'left-6' : 'left-1')}
      />
      {checked && <span className="absolute inset-0 rounded-full neon-glow opacity-50" />}
    </button>
  );
}

function SettingRow({
  icon: Icon, label, sub, children, danger,
}: { icon?: any; label: string; sub?: string; children?: React.ReactNode; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
            <Icon className={cn('w-4 h-4', danger ? 'text-red-400' : 'text-muted-foreground')} />
          </div>
        )}
        <div className="min-w-0">
          <p className={cn('text-sm font-semibold', danger && 'text-red-400')}>{label}</p>
          {sub && <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-6 first:mt-0 px-1">
      {children}
    </h3>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('glass-panel rounded-2xl p-5', className)}>
      {children}
    </div>
  );
}

/* ─── main ─── */
export default function Settings() {
  const [section, setSection] = useState<Section>('appearance');
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved: Partial<AppSettings> = {};
    (Object.keys(defaults) as (keyof AppSettings)[]).forEach((k) => {
      (saved as any)[k] = load(k, (defaults as any)[k]);
    });
    return { ...defaults, ...saved };
  });
  const [saved, setSaved] = useState(false);
  const [editingEmulators, setEditingEmulators] = useState(EMULATORS);

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      save(key, value);
      return next;
    });
  }

  function handleSave() {
    (Object.keys(settings) as (keyof AppSettings)[]).forEach((k) => save(k, (settings as any)[k]));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const navItems: { id: Section; label: string; icon: any; badge?: number | string }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'emulators', label: 'Emulators', icon: Gamepad2 },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'library', label: 'Library', icon: Database },
    { id: 'connections', label: 'Connections', icon: Link2, badge: 1 },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'about', label: 'About', icon: Info },
  ];

  const shortcuts = [
    { keys: ['⌘', 'K'], action: 'Quick Search' },
    { keys: ['⌘', 'B'], action: 'Browse ROMs' },
    { keys: ['⌘', 'L'], action: 'Open Library' },
    { keys: ['⌘', 'D'], action: 'Downloads' },
    { keys: ['⌘', ','], action: 'Settings' },
    { keys: ['Esc'], action: 'Close / Back' },
  ];

  return (
    <div className="flex gap-0 h-full min-h-[calc(100vh-120px)]">

      {/* ─── Settings sidebar ─── */}
      <aside className="w-52 shrink-0 pr-4">
        <div className="mb-6">
          <h1 className="text-xl font-black neon-text">Settings</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Customize NeonROM</p>
        </div>

        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group relative',
                section === item.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              {section === item.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary neon-glow" />
              )}
              <item.icon className={cn('w-4 h-4 shrink-0', section === item.id && 'drop-shadow-[0_0_6px_rgba(124,58,237,0.8)]')} />
              <span className="text-[13px] font-medium flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Save button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all',
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-white neon-glow hover:scale-[1.02]'
            )}
            style={saved ? undefined : { background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
          </button>
        </div>
      </aside>

      {/* ─── Content ─── */}
      <main className="flex-1 min-w-0 pl-5 border-l border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
          >

            {/* ── APPEARANCE ── */}
            {section === 'appearance' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Appearance</h2>
                <p className="text-sm text-muted-foreground mb-6">Customize the visual style of NeonROM.</p>

                <div className="space-y-4">
                  {/* Theme */}
                  <Card>
                    <SectionTitle>Color Scheme</SectionTitle>
                    <div className="flex items-center gap-2 mb-6">
                      {(['auto', 'light', 'dark'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => set('theme', t)}
                          className={cn(
                            'flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all',
                            settings.theme === t
                              ? 'text-white neon-glow'
                              : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10'
                          )}
                          style={settings.theme === t ? { background: settings.accent } : undefined}
                        >
                          {t === 'auto' && <Monitor className="w-3.5 h-3.5" />}
                          {t === 'light' && <Sun className="w-3.5 h-3.5" />}
                          {t === 'dark' && <Moon className="w-3.5 h-3.5" />}
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>

                    <SectionTitle>Accent Color</SectionTitle>
                    <div className="flex flex-wrap gap-3 mb-2">
                      {ACCENTS.map((a) => (
                        <div key={a.color} className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => set('accent', a.color)}
                            className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                            style={{
                              background: a.color,
                              borderColor: settings.accent === a.color ? 'white' : 'transparent',
                              boxShadow: settings.accent === a.color
                                ? `0 0 12px ${a.color}, 0 0 24px ${a.color}66`
                                : `0 0 8px ${a.color}66`,
                            }}
                          />
                          <span className={cn('text-[10px]', settings.accent === a.color ? 'text-white font-bold' : 'text-muted-foreground')}>
                            {a.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Density + Corner radius */}
                  <Card>
                    <SectionTitle>Layout</SectionTitle>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">UI Density</span>
                          <span className="text-[12px] text-muted-foreground font-mono">
                            {settings.density === 0 ? 'Relaxed' : settings.density === 1 ? 'Standard' : 'Tight'}
                          </span>
                        </div>
                        <input
                          type="range" min={0} max={2} step={1}
                          value={settings.density}
                          onChange={(e) => set('density', Number(e.target.value))}
                          className="neon-slider w-full"
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground mt-1 px-0.5">
                          <span>Relaxed</span><span>Standard</span><span>Tight</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Corner Radius</span>
                          <span className="text-[12px] text-muted-foreground font-mono">{settings.cornerRadius}px</span>
                        </div>
                        <input
                          type="range" min={0} max={24} step={2}
                          value={settings.cornerRadius}
                          onChange={(e) => set('cornerRadius', Number(e.target.value))}
                          className="neon-slider w-full"
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground mt-1 px-0.5">
                          <span>0</span><span>8</span><span>16</span><span>24</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Toggles */}
                  <Card>
                    <SectionTitle>Behavior</SectionTitle>
                    <div>
                      <SettingRow label="Smooth animations" sub="Enable fluid transitions throughout the UI">
                        <Toggle checked={settings.smoothAnimations} onChange={(v) => set('smoothAnimations', v)} />
                      </SettingRow>
                      <SettingRow label="Bold focus rings" sub="Increase visibility of focused elements for accessibility">
                        <Toggle checked={settings.boldFocus} onChange={(v) => set('boldFocus', v)} />
                      </SettingRow>
                      <SettingRow label="Reduced motion" sub="Minimize animations for motion sensitivity">
                        <Toggle checked={settings.reducedMotion} onChange={(v) => set('reducedMotion', v)} />
                      </SettingRow>
                      <SettingRow label="Sound effects" sub="Play audio feedback for downloads and actions" icon={Volume2}>
                        <Toggle checked={settings.soundEffects} onChange={(v) => set('soundEffects', v)} />
                      </SettingRow>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ── PROFILE ── */}
            {section === 'profile' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Profile</h2>
                <p className="text-sm text-muted-foreground mb-6">Manage your NeonROM identity.</p>

                <div className="space-y-4">
                  <Card>
                    <SectionTitle>User Info</SectionTitle>
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white neon-glow"
                        style={{ background: settings.accent }}>
                        {settings.username.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{settings.username}</p>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ color: settings.accent, borderColor: `${settings.accent}44`, background: `${settings.accent}15` }}>
                          {settings.plan} Plan
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Display Name</label>
                        <input
                          type="text"
                          value={settings.username}
                          onChange={(e) => set('username', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Subscription</SectionTitle>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <div>
                        <p className="font-bold flex items-center gap-2">Free Plan <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full font-mono">CURRENT</span></p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Limited downloads · Standard speed</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mt-3">
                      <div>
                        <p className="font-bold text-yellow-400 flex items-center gap-2"><Zap className="w-4 h-4" /> Pro Plan</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Unlimited downloads · Max speed · Priority support</p>
                      </div>
                      <button className="px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                        Upgrade
                      </button>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Notifications</SectionTitle>
                    <SettingRow label="Download completed" sub="Alert when a ROM finishes downloading" icon={Bell}>
                      <Toggle checked={settings.notifyCompleted} onChange={(v) => set('notifyCompleted', v)} />
                    </SettingRow>
                    <SettingRow label="App updates" sub="Notify when a new version of NeonROM is available" icon={Bell}>
                      <Toggle checked={settings.notifyUpdates} onChange={(v) => set('notifyUpdates', v)} />
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

            {/* ── EMULATORS ── */}
            {section === 'emulators' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Emulators</h2>
                <p className="text-sm text-muted-foreground mb-6">Set your preferred emulator for each console.</p>

                <div className="space-y-4">
                  <Card>
                    <SectionTitle>Default Emulators</SectionTitle>
                    <div className="space-y-1">
                      {editingEmulators.map((em, i) => (
                        <SettingRow key={em.console} label={em.console} sub={`${em.shortName} · Supported formats: ROM, ISO, BIN`} icon={Gamepad2}>
                          <select
                            value={em.value}
                            onChange={(e) => {
                              const updated = editingEmulators.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              );
                              setEditingEmulators(updated);
                            }}
                            className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none appearance-none cursor-pointer text-right min-w-[120px]"
                          >
                            {em.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </SettingRow>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Emulator Paths</SectionTitle>
                    <p className="text-[12px] text-muted-foreground mb-4">Point NeonROM to your installed emulator executables.</p>
                    {['Dolphin', 'PCSX2', 'RPCS3', 'mGBA'].map((emu) => (
                      <div key={emu} className="mb-3">
                        <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">{emu}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`/Applications/${emu}.app`}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono text-muted-foreground"
                          />
                          <button className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <Folder className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            )}

            {/* ── DOWNLOADS ── */}
            {section === 'downloads' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Downloads</h2>
                <p className="text-sm text-muted-foreground mb-6">Control how ROMs are downloaded and stored.</p>

                <div className="space-y-4">
                  <Card>
                    <SectionTitle>Save Location</SectionTitle>
                    <div>
                      <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Download folder</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.downloadPath}
                          onChange={(e) => set('downloadPath', e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                        <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium">
                          <Folder className="w-4 h-4" /> Browse
                        </button>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Performance</SectionTitle>
                    <div className="space-y-5 mb-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Concurrent Downloads</span>
                          <span className="font-mono font-bold text-sm" style={{ color: settings.accent }}>{settings.concurrentDownloads}</span>
                        </div>
                        <input
                          type="range" min={1} max={8} step={1}
                          value={settings.concurrentDownloads}
                          onChange={(e) => set('concurrentDownloads', Number(e.target.value))}
                          className="neon-slider w-full"
                        />
                        <div className="flex justify-between text-[11px] text-muted-foreground mt-1 px-0.5">
                          <span>1</span><span>4</span><span>8</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold">Bandwidth Limit</p>
                            <p className="text-[12px] text-muted-foreground">Throttle download speed to preserve network</p>
                          </div>
                          <Toggle checked={settings.bandwidthEnabled} onChange={(v) => set('bandwidthEnabled', v)} />
                        </div>
                        {settings.bandwidthEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Limit</span>
                              <span className="font-mono font-bold text-sm" style={{ color: settings.accent }}>{settings.bandwidthLimit} MB/s</span>
                            </div>
                            <input
                              type="range" min={1} max={200} step={1}
                              value={settings.bandwidthLimit}
                              onChange={(e) => set('bandwidthLimit', Number(e.target.value))}
                              className="neon-slider w-full"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <SettingRow label="Auto-extract archives" sub="Automatically unzip/un-7z downloaded files" icon={HardDrive}>
                      <Toggle checked={settings.autoExtract} onChange={(v) => set('autoExtract', v)} />
                    </SettingRow>
                  </Card>

                  <Card>
                    <SectionTitle>Danger Zone</SectionTitle>
                    <SettingRow label="Clear download queue" sub="Remove all queued and completed download entries" danger icon={Trash2}>
                      <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        Clear
                      </button>
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

            {/* ── LIBRARY ── */}
            {section === 'library' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Library</h2>
                <p className="text-sm text-muted-foreground mb-6">Configure how NeonROM scans and manages your local ROM collection.</p>

                <div className="space-y-4">
                  <Card>
                    <SectionTitle>Library Path</SectionTitle>
                    <div>
                      <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">ROMs folder</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.libraryPath}
                          onChange={(e) => set('libraryPath', e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
                        />
                        <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium">
                          <Folder className="w-4 h-4" /> Browse
                        </button>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Scan Settings</SectionTitle>
                    <SettingRow label="Scan on startup" sub="Automatically scan library folder when NeonROM launches" icon={RefreshCw}>
                      <Toggle checked={settings.scanOnStartup} onChange={(v) => set('scanOnStartup', v)} />
                    </SettingRow>
                    <SettingRow label="Auto-fetch cover art" sub="Download missing cover images from online sources" icon={Globe}>
                      <Toggle checked={settings.autoFetchCovers} onChange={(v) => set('autoFetchCovers', v)} />
                    </SettingRow>
                    <div className="pt-3">
                      <button className="w-full py-2.5 rounded-xl text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Scan Library Now
                      </button>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Danger Zone</SectionTitle>
                    <SettingRow label="Reset library" sub="Remove all library entries (does not delete ROM files)" danger icon={Trash2}>
                      <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        Reset
                      </button>
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

            {/* ── CONNECTIONS ── */}
            {section === 'connections' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Connections</h2>
                <p className="text-sm text-muted-foreground mb-6">Manage external data sources and API endpoints.</p>

                <div className="space-y-4">
                  <Card>
                    <SectionTitle>ROM Source</SectionTitle>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[12px] text-emerald-400 font-bold">Connected</span>
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">GitHub JSON URL</label>
                      <input
                        type="text"
                        value={settings.romSourceUrl}
                        onChange={(e) => set('romSourceUrl', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono text-[12px] text-muted-foreground"
                      />
                      <p className="text-[11px] text-muted-foreground mt-2">
                        The raw JSON file that NeonROM uses to load ROMs and console data.
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                        style={{ background: settings.accent }}>
                        <RefreshCw className="w-3.5 h-3.5" /> Test & Sync
                      </button>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Other Services</SectionTitle>
                    {[
                      { name: 'RetroAchievements', desc: 'Track in-game achievements for supported ROMs', status: false },
                      { name: 'TheGamesDB', desc: 'Fetch metadata and cover art from TheGamesDB API', status: false },
                      { name: 'IGDB', desc: 'Rich game metadata and screenshots from IGDB', status: false },
                    ].map((svc) => (
                      <div key={svc.name} className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm font-semibold">{svc.name}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{svc.desc}</p>
                        </div>
                        <button className="px-4 py-1.5 rounded-lg text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors shrink-0 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5" /> Connect
                        </button>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            )}

            {/* ── SHORTCUTS ── */}
            {section === 'shortcuts' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Shortcuts</h2>
                <p className="text-sm text-muted-foreground mb-6">Keyboard shortcuts for faster navigation.</p>

                <Card>
                  <SectionTitle>Global Shortcuts</SectionTitle>
                  <div className="space-y-1">
                    {shortcuts.map((sc) => (
                      <div key={sc.action} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="text-sm text-muted-foreground">{sc.action}</span>
                        <div className="flex items-center gap-1">
                          {sc.keys.map((k) => (
                            <kbd key={k}
                              className="px-2.5 py-1 rounded-lg text-[12px] font-bold font-mono border border-white/15 bg-white/5 text-white shadow-sm">
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── ABOUT ── */}
            {section === 'about' && (
              <div>
                <h2 className="text-2xl font-black mb-1">About</h2>
                <p className="text-sm text-muted-foreground mb-6">NeonROM version info and credits.</p>

                <div className="space-y-4">
                  <Card>
                    <div className="flex items-center gap-4 py-2">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center neon-glow"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                        <Gamepad2 className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black neon-text">NeonROM</h3>
                        <p className="text-[12px] text-muted-foreground font-mono">Version 1.0.0 · Build 2026.07</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>System</SectionTitle>
                    {[
                      { label: 'Runtime', value: 'React 19 + Vite' },
                      { label: 'ROM Source', value: 'GitHub JSON' },
                      { label: 'API Server', value: 'Express + Drizzle + PostgreSQL' },
                      { label: 'Theme Engine', value: 'CSS Variables + Tailwind' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                        <span className="text-sm text-muted-foreground">{row.label}</span>
                        <span className="text-sm font-mono font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </Card>

                  <Card>
                    <SectionTitle>Updates</SectionTitle>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Check for updates</p>
                        <p className="text-[12px] text-muted-foreground">Last checked: just now</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Check Now
                      </button>
                    </div>
                  </Card>

                  <Card>
                    <SectionTitle>Danger Zone</SectionTitle>
                    <SettingRow label="Reset all settings" sub="Restore NeonROM to factory defaults" danger icon={Trash2}>
                      <button
                        onClick={() => {
                          localStorage.clear();
                          setSettings(defaults);
                        }}
                        className="px-4 py-1.5 rounded-lg text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        Reset
                      </button>
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
