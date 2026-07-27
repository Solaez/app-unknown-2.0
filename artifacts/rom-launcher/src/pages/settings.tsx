import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, Palette, Link2, CreditCard,
  Keyboard, Cpu, Download, HardDrive, Gamepad2, Info,
  Check, RefreshCw, Folder, Zap, Globe,
  Moon, Sun, Monitor, ToggleLeft,
  Volume2, Database, Trash2, Plus, X, ExternalLink,
  Gamepad, Package, Layers, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { useSources, DEFAULT_ROM_URL, DEFAULT_PROGRAMAS_URL } from '@/contexts/sources-context';
import { useRomStats } from '@/hooks/use-rom-data';
import { usePrograms } from '@/hooks/use-programs';

/* ─── persistence helpers ─── */
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(`neonrom-settings-${key}`);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function save<T>(key: string, value: T) {
  localStorage.setItem(`neonrom-settings-${key}`, JSON.stringify(value));
}

/* ─── types ─── */
type Section =
  | 'profile' | 'appearance' | 'emulators' | 'downloads'
  | 'library' | 'connections' | 'shortcuts' | 'about';

interface AppSettings {
  density: number;
  cornerRadius: number;
  smoothAnimations: boolean;
  boldFocus: boolean;
  reducedMotion: boolean;
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
  density: 1,
  cornerRadius: 12,
  smoothAnimations: true,
  boldFocus: false,
  reducedMotion: false,
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
  { color: '#c8a84b', name: 'Dorado' },
  { color: '#7c3aed', name: 'Violeta' },
  { color: '#2563eb', name: 'Cobalto' },
  { color: '#10b981', name: 'Esmeralda' },
  { color: '#f59e0b', name: 'Ámbar' },
  { color: '#f97316', name: 'Naranja' },
  { color: '#ef4444', name: 'Rojo' },
  { color: '#ec4899', name: 'Rosa' },
  { color: '#06b6d4', name: 'Cian' },
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
      className={cn('relative w-11 h-6 rounded-full transition-all duration-300 shrink-0', checked ? 'bg-primary' : 'bg-white/10 dark:bg-white/10 light:bg-black/15')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg', checked ? 'left-6' : 'left-1')}
      />
      {checked && <span className="absolute inset-0 rounded-full neon-glow opacity-50" />}
    </button>
  );
}

function SettingRow({ icon: Icon, label, sub, children, danger }: { icon?: any; label: string; sub?: string; children?: React.ReactNode; danger?: boolean }) {
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

/* ─── Source card for Connections ─── */
interface SourceCardProps {
  icon: React.ReactNode;
  label: string;
  typeColor: string;
  url: string;
  defaultUrl: string;
  stats?: string;
  isLoading?: boolean;
  isError?: boolean;
  onSave: (url: string) => void;
}

function SourceCard({ icon, label, typeColor, url, defaultUrl, stats, isLoading, isError, onSave }: SourceCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(url);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<'ok' | 'err' | null>(null);

  // keep draft in sync with external url changes
  useEffect(() => { setDraft(url); }, [url]);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(draft);
      if (!res.ok) throw new Error();
      onSave(draft);
      setSyncResult('ok');
    } catch {
      setSyncResult('err');
    } finally {
      setSyncing(false);
    }
    setTimeout(() => setSyncResult(null), 3000);
  }

  const status = isError ? 'error' : isLoading ? 'loading' : 'ok';

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: `${typeColor}30` }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: `${typeColor}20`, background: `${typeColor}08` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${typeColor}20` }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-foreground">{label}</p>
          {stats && <p className="text-[11px] text-muted-foreground">{stats}</p>}
        </div>
        <div className="flex items-center gap-2">
          {status === 'ok' && !isLoading && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
            </span>
          )}
          {status === 'loading' && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" /> Cargando
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-400">
              <AlertCircle className="w-3.5 h-3.5" /> Error
            </span>
          )}
        </div>
      </div>

      {/* URL row */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">URL del JSON</p>
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-all text-muted-foreground"
              autoFocus
            />
            <button
              onClick={() => { setEditing(false); setDraft(url); }}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-left px-3 py-2 rounded-xl border border-white/8 bg-black/30 hover:bg-black/50 transition-colors group"
          >
            <p className="text-[11px] font-mono text-muted-foreground truncate group-hover:text-foreground transition-colors">{url}</p>
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: typeColor }}
          >
            {syncing
              ? <><RefreshCw className="w-3 h-3 animate-spin" /> Probando...</>
              : syncResult === 'ok'
                ? <><Check className="w-3 h-3" /> Conectado</>
                : syncResult === 'err'
                  ? <><AlertCircle className="w-3 h-3" /> Error</>
                  : <><RefreshCw className="w-3 h-3" /> Probar & Sincronizar</>
            }
          </button>
          <a
            href={draft}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Ver JSON
          </a>
          {draft !== defaultUrl && (
            <button
              onClick={() => { setDraft(defaultUrl); onSave(defaultUrl); }}
              className="ml-auto text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Restablecer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── main ─── */
export default function Settings() {
  const { accent, theme, setAccent, setTheme } = useTheme();
  const { romUrl, programasUrl, setRomUrl, setProgramasUrl } = useSources();

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

  // ROM and programs data for stats in Connections
  const { data: romStats, isLoading: romLoading, isError: romError } = useRomStats();
  const { data: programsData, isLoading: programsLoading, isError: programsError } = usePrograms();
  const emulatorCount = programsData?.apps.filter(a => a.category === 'Emuladores').length ?? 0;
  const softwareCount = programsData?.apps.filter(a => a.category !== 'Emuladores').length ?? 0;

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
    { id: 'connections', label: 'Connections', icon: Link2, badge: 3 },
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
                section === item.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
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

        <div className="mt-6">
          <button
            onClick={handleSave}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all',
              saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white neon-glow hover:scale-[1.02]'
            )}
            style={saved ? undefined : { background: `linear-gradient(135deg, ${accent}, #2563eb)` }}
          >
            {saved ? <><Check className="w-4 h-4" /> Guardado!</> : 'Guardar Cambios'}
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
                <h2 className="text-2xl font-black mb-1">Apariencia</h2>
                <p className="text-sm text-muted-foreground mb-6">Personaliza el estilo visual de NeonROM.</p>

                <div className="space-y-4">
                  {/* Theme mode */}
                  <Card>
                    <SectionTitle>Modo de Color</SectionTitle>
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      {([
                        { id: 'dark' as const, icon: Moon, label: 'Oscuro', desc: 'Siempre oscuro' },
                        { id: 'light' as const, icon: Sun, label: 'Claro', desc: 'Siempre claro' },
                        { id: 'auto' as const, icon: Monitor, label: 'Auto', desc: 'Sigue al sistema' },
                      ]).map(({ id, icon: Icon, label, desc }) => {
                        const active = theme === id;
                        return (
                          <button
                            key={id}
                            onClick={() => setTheme(id)}
                            className={cn(
                              'flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all',
                              active ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                            )}
                          >
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', active ? 'bg-primary text-white' : 'bg-white/8 text-muted-foreground')}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <p className={cn('text-[13px] font-bold', active ? 'text-primary' : 'text-foreground')}>{label}</p>
                              <p className="text-[10px] text-muted-foreground">{desc}</p>
                            </div>
                            {active && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                          </button>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Accent color */}
                  <Card>
                    <SectionTitle>Color de Acento</SectionTitle>
                    <p className="text-[12px] text-muted-foreground mb-4">Se aplica a botones, highlights, barras de progreso, efectos neon y textos de énfasis en todo el programa.</p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {ACCENTS.map((a) => (
                        <div key={a.color} className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => setAccent(a.color)}
                            className="w-10 h-10 rounded-full border-[3px] transition-all hover:scale-110 active:scale-95"
                            style={{
                              background: a.color,
                              borderColor: accent === a.color ? 'white' : 'transparent',
                              boxShadow: accent === a.color
                                ? `0 0 16px ${a.color}, 0 0 32px ${a.color}66`
                                : `0 0 8px ${a.color}44`,
                            }}
                          />
                          <span className={cn('text-[10px] font-medium', accent === a.color ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                            {a.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Live preview */}
                    <div className="rounded-xl p-4 border" style={{ background: `${accent}10`, borderColor: `${accent}30` }}>
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-3">Vista previa</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: accent }}>
                          Botón principal
                        </button>
                        <button className="px-4 py-2 rounded-xl text-sm font-bold border" style={{ color: accent, borderColor: `${accent}50`, background: `${accent}12` }}>
                          Botón secundario
                        </button>
                        <span className="text-sm font-bold" style={{ color: accent }}>Texto de acento</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden min-w-[80px]">
                          <div className="h-full w-3/4 rounded-full" style={{ background: accent }} />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Layout */}
                  <Card>
                    <SectionTitle>Diseño</SectionTitle>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Densidad de UI</span>
                          <span className="text-[12px] text-muted-foreground font-mono">
                            {settings.density === 0 ? 'Espaciado' : settings.density === 1 ? 'Estándar' : 'Compacto'}
                          </span>
                        </div>
                        <input type="range" min={0} max={2} step={1} value={settings.density} onChange={(e) => set('density', Number(e.target.value))} className="neon-slider w-full" />
                        <div className="flex justify-between text-[11px] text-muted-foreground mt-1 px-0.5">
                          <span>Espaciado</span><span>Estándar</span><span>Compacto</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Radio de esquinas</span>
                          <span className="text-[12px] text-muted-foreground font-mono">{settings.cornerRadius}px</span>
                        </div>
                        <input type="range" min={0} max={24} step={2} value={settings.cornerRadius} onChange={(e) => set('cornerRadius', Number(e.target.value))} className="neon-slider w-full" />
                        <div className="flex justify-between text-[11px] text-muted-foreground mt-1 px-0.5">
                          <span>0</span><span>8</span><span>16</span><span>24</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Behavior */}
                  <Card>
                    <SectionTitle>Comportamiento</SectionTitle>
                    <SettingRow label="Animaciones fluidas" sub="Transiciones animadas en toda la interfaz">
                      <Toggle checked={settings.smoothAnimations} onChange={(v) => set('smoothAnimations', v)} />
                    </SettingRow>
                    <SettingRow label="Resaltar foco" sub="Mayor visibilidad en elementos enfocados">
                      <Toggle checked={settings.boldFocus} onChange={(v) => set('boldFocus', v)} />
                    </SettingRow>
                    <SettingRow label="Reducir movimiento" sub="Minimiza animaciones para sensibilidad al movimiento">
                      <Toggle checked={settings.reducedMotion} onChange={(v) => set('reducedMotion', v)} />
                    </SettingRow>
                    <SettingRow label="Efectos de sonido" sub="Feedback de audio en descargas y acciones" icon={Volume2}>
                      <Toggle checked={settings.soundEffects} onChange={(v) => set('soundEffects', v)} />
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

            {/* ── PROFILE ── */}
            {section === 'profile' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Perfil</h2>
                <p className="text-sm text-muted-foreground mb-6">Gestiona tu identidad en NeonROM.</p>
                <div className="space-y-4">
                  <Card>
                    <SectionTitle>Información</SectionTitle>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white neon-glow" style={{ background: accent }}>
                        {settings.username.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{settings.username}</p>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border" style={{ color: accent, borderColor: `${accent}44`, background: `${accent}15` }}>
                          {settings.plan} Plan
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Nombre de usuario</label>
                      <input type="text" value={settings.username} onChange={(e) => set('username', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all" />
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Suscripción</SectionTitle>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <div>
                        <p className="font-bold flex items-center gap-2">Plan Free <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full font-mono">ACTUAL</span></p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Descargas limitadas · Velocidad estándar</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mt-3">
                      <div>
                        <p className="font-bold text-yellow-400 flex items-center gap-2"><Zap className="w-4 h-4" /> Plan Pro</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Descargas ilimitadas · Máxima velocidad</p>
                      </div>
                      <button className="px-4 py-2 rounded-xl text-sm font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>Mejorar</button>
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Notificaciones</SectionTitle>
                    <SettingRow label="Descarga completada" sub="Alerta cuando un ROM termina de descargar" icon={Bell}>
                      <Toggle checked={settings.notifyCompleted} onChange={(v) => set('notifyCompleted', v)} />
                    </SettingRow>
                    <SettingRow label="Actualizaciones" sub="Notificar cuando hay una nueva versión" icon={Bell}>
                      <Toggle checked={settings.notifyUpdates} onChange={(v) => set('notifyUpdates', v)} />
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

            {/* ── EMULATORS ── */}
            {section === 'emulators' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Emuladores</h2>
                <p className="text-sm text-muted-foreground mb-6">Configura tu emulador preferido por consola.</p>
                <div className="space-y-4">
                  <Card>
                    <SectionTitle>Emuladores por defecto</SectionTitle>
                    <div className="space-y-1">
                      {editingEmulators.map((em, i) => (
                        <SettingRow key={em.console} label={em.console} sub={`${em.shortName} · ROM, ISO, BIN`} icon={Gamepad2}>
                          <select value={em.value} onChange={(e) => { const u = editingEmulators.map((x, j) => j === i ? { ...x, value: e.target.value } : x); setEditingEmulators(u); }} className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none appearance-none cursor-pointer text-right min-w-[120px]">
                            {em.options.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </SettingRow>
                      ))}
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Rutas de emuladores</SectionTitle>
                    {['Dolphin', 'PCSX2', 'RPCS3', 'mGBA'].map((emu) => (
                      <div key={emu} className="mb-3">
                        <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">{emu}</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder={`/Applications/${emu}.app`} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono text-muted-foreground" />
                          <button className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"><Folder className="w-4 h-4" /></button>
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
                <h2 className="text-2xl font-black mb-1">Descargas</h2>
                <p className="text-sm text-muted-foreground mb-6">Controla cómo se descargan y almacenan los ROMs.</p>
                <div className="space-y-4">
                  <Card>
                    <SectionTitle>Carpeta de destino</SectionTitle>
                    <div className="flex gap-2">
                      <input type="text" value={settings.downloadPath} onChange={(e) => set('downloadPath', e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono" />
                      <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"><Folder className="w-4 h-4" /> Examinar</button>
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Rendimiento</SectionTitle>
                    <div className="space-y-5 mb-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold">Descargas simultáneas</span>
                          <span className="font-mono font-bold text-sm" style={{ color: accent }}>{settings.concurrentDownloads}</span>
                        </div>
                        <input type="range" min={1} max={8} step={1} value={settings.concurrentDownloads} onChange={(e) => set('concurrentDownloads', Number(e.target.value))} className="neon-slider w-full" />
                      </div>
                      <SettingRow label="Extraer automáticamente" sub="Descomprimir archivos .zip/.7z al terminar" icon={HardDrive}>
                        <Toggle checked={settings.autoExtract} onChange={(v) => set('autoExtract', v)} />
                      </SettingRow>
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Zona de peligro</SectionTitle>
                    <SettingRow label="Limpiar cola" sub="Eliminar todas las entradas de descarga" danger icon={Trash2}>
                      <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">Limpiar</button>
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

            {/* ── LIBRARY ── */}
            {section === 'library' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Biblioteca</h2>
                <p className="text-sm text-muted-foreground mb-6">Configura cómo NeonROM gestiona tu colección local.</p>
                <div className="space-y-4">
                  <Card>
                    <SectionTitle>Ruta de biblioteca</SectionTitle>
                    <div className="flex gap-2">
                      <input type="text" value={settings.libraryPath} onChange={(e) => set('libraryPath', e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono" />
                      <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"><Folder className="w-4 h-4" /> Examinar</button>
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Escaneo</SectionTitle>
                    <SettingRow label="Escanear al iniciar" sub="Buscar automáticamente ROMs al abrir NeonROM" icon={RefreshCw}>
                      <Toggle checked={settings.scanOnStartup} onChange={(v) => set('scanOnStartup', v)} />
                    </SettingRow>
                    <SettingRow label="Portadas automáticas" sub="Descargar imágenes de portada desde Internet" icon={Globe}>
                      <Toggle checked={settings.autoFetchCovers} onChange={(v) => set('autoFetchCovers', v)} />
                    </SettingRow>
                    <div className="pt-3">
                      <button className="w-full py-2.5 rounded-xl text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Escanear ahora
                      </button>
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Zona de peligro</SectionTitle>
                    <SettingRow label="Reiniciar biblioteca" sub="Eliminar entradas (no borra los archivos ROM)" danger icon={Trash2}>
                      <button className="px-4 py-1.5 rounded-lg text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">Reiniciar</button>
                    </SettingRow>
                  </Card>
                </div>
              </div>
            )}

            {/* ── CONNECTIONS ── */}
            {section === 'connections' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Conexiones</h2>
                <p className="text-sm text-muted-foreground mb-6">Gestiona las fuentes de datos JSON del programa. Cambia la URL y pulsa <strong>Probar & Sincronizar</strong> para que el programa cargue los nuevos datos al instante.</p>

                <div className="space-y-4">

                  {/* ROMs source */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad className="w-4 h-4" style={{ color: '#c8a84b' }} />
                      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">ROMs</p>
                      {romStats && (
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {romStats.totalRoms} ROMs · {romStats.totalConsoles} consolas
                        </span>
                      )}
                    </div>
                    <SourceCard
                      icon={<Gamepad className="w-4 h-4" style={{ color: '#c8a84b' }} />}
                      label="ROMs & Consolas"
                      typeColor="#c8a84b"
                      url={romUrl}
                      defaultUrl={DEFAULT_ROM_URL}
                      stats={romStats ? `${romStats.totalRoms} ROMs en ${romStats.totalConsoles} consolas` : isLoading(romLoading)}
                      isLoading={romLoading}
                      isError={romError}
                      onSave={setRomUrl}
                    />
                  </div>

                  {/* Programas source */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4" style={{ color: '#6366f1' }} />
                      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Programas</p>
                      {programsData && (
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {softwareCount} programas
                        </span>
                      )}
                    </div>
                    <SourceCard
                      icon={<Package className="w-4 h-4" style={{ color: '#6366f1' }} />}
                      label="Software & Herramientas"
                      typeColor="#6366f1"
                      url={programasUrl}
                      defaultUrl={DEFAULT_PROGRAMAS_URL}
                      stats={programsData ? `${softwareCount} programas en ${[...new Set(programsData.apps.filter(a => a.category !== 'Emuladores').map(a => a.category))].length} categorías` : isLoading(programsLoading)}
                      isLoading={programsLoading}
                      isError={programsError}
                      onSave={setProgramasUrl}
                    />
                  </div>

                  {/* Emuladores (derived) */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4" style={{ color: '#c8a84b' }} />
                      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Emuladores</p>
                      {programsData && (
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {emulatorCount} emuladores
                        </span>
                      )}
                    </div>
                    <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,168,75,0.30)' }}>
                      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(200,168,75,0.20)', background: 'rgba(200,168,75,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,168,75,0.20)' }}>
                          <Cpu className="w-4 h-4" style={{ color: '#c8a84b' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] text-foreground">Emuladores</p>
                          <p className="text-[11px] text-muted-foreground">
                            {programsData ? `${emulatorCount} emuladores (filtrado de Programas)` : 'Derivado del JSON de Programas'}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-white/5 px-2 py-0.5 rounded-lg">
                          <Layers className="w-3 h-3" /> Derivado
                        </span>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-[12px] text-muted-foreground leading-relaxed">
                          Los emuladores se obtienen automáticamente del mismo JSON de Programas, filtrando los ítems con <code className="text-[11px] bg-white/8 px-1 py-0.5 rounded">category = "Emuladores"</code>. Para cambiar la fuente, edita la URL de Programas arriba.
                        </p>
                        {programsData && emulatorCount > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {programsData.apps.filter(a => a.category === 'Emuladores').slice(0, 8).map(e => (
                              <span key={e.id} className="text-[11px] px-2 py-0.5 rounded-lg border border-white/10 text-muted-foreground flex items-center gap-1">
                                <span>{e.icon}</span> {e.name}
                              </span>
                            ))}
                            {emulatorCount > 8 && <span className="text-[11px] text-muted-foreground px-2 py-0.5">+{emulatorCount - 8} más</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info note */}
                  <div className="rounded-xl p-4 border border-white/8 bg-white/3">
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">¿Cómo agregar una fuente propia?</strong> Sube tu JSON a GitHub, Gist, o cualquier URL pública (raw), pégala en el campo correspondiente y pulsa <em>Probar & Sincronizar</em>. El programa recargará los datos al instante sin reiniciar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── SHORTCUTS ── */}
            {section === 'shortcuts' && (
              <div>
                <h2 className="text-2xl font-black mb-1">Atajos</h2>
                <p className="text-sm text-muted-foreground mb-6">Atajos de teclado para navegar más rápido.</p>
                <Card>
                  <SectionTitle>Atajos globales</SectionTitle>
                  <div className="space-y-1">
                    {shortcuts.map((sc) => (
                      <div key={sc.action} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="text-sm text-muted-foreground">{sc.action}</span>
                        <div className="flex items-center gap-1">
                          {sc.keys.map((k) => (
                            <kbd key={k} className="px-2.5 py-1 rounded-lg text-[12px] font-bold font-mono border border-white/15 bg-white/5 text-white shadow-sm">{k}</kbd>
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
                <h2 className="text-2xl font-black mb-1">Acerca de</h2>
                <p className="text-sm text-muted-foreground mb-6">Información de versión de NeonROM.</p>
                <div className="space-y-4">
                  <Card>
                    <div className="flex items-center gap-4 py-2">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center neon-glow" style={{ background: `linear-gradient(135deg, ${accent}, #2563eb)` }}>
                        <Gamepad2 className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black neon-text">NeonROM</h3>
                        <p className="text-[12px] text-muted-foreground font-mono">Versión 1.0.0 · Build 2026.07</p>
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <SectionTitle>Sistema</SectionTitle>
                    {[
                      { label: 'Runtime', value: 'React 19 + Vite' },
                      { label: 'Fuente ROMs', value: 'GitHub JSON' },
                      { label: 'API Server', value: 'Express + Drizzle + PostgreSQL' },
                      { label: 'Motor de tema', value: 'CSS Variables + Tailwind' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                        <span className="text-sm text-muted-foreground">{row.label}</span>
                        <span className="text-sm font-mono font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </Card>
                  <Card>
                    <SectionTitle>Zona de peligro</SectionTitle>
                    <SettingRow label="Restablecer ajustes" sub="Volver a los valores de fábrica de NeonROM" danger icon={Trash2}>
                      <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-4 py-1.5 rounded-lg text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors">Restablecer</button>
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

/* tiny helper to avoid null conditional in jsx */
function isLoading(loading: boolean): string {
  return loading ? 'Cargando datos...' : '';
}
