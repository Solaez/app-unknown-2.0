import { createContext, useContext, useState, useEffect } from 'react';
import { hexToHslString } from '@/lib/color-utils';

type ThemeMode = 'dark' | 'light' | 'auto';

interface ThemeCtx {
  accent: string;
  theme: ThemeMode;
  setAccent: (hex: string) => void;
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  accent: '#7c3aed',
  theme: 'dark',
  setAccent: () => {},
  setTheme: () => {},
});

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

function applyAccent(hex: string) {
  const hsl = hexToHslString(hex);
  const root = document.documentElement;
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--ring', hsl);
  root.style.setProperty('--sidebar-primary', hsl);
  root.style.setProperty('--sidebar-ring', hsl);
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<string>(() => load('accent', '#7c3aed'));
  const [theme, setThemeState] = useState<ThemeMode>(() => load('theme', 'dark'));

  useEffect(() => { applyAccent(accent); }, [accent]);
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Listen for OS dark/light changes when theme is 'auto'
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  function setAccent(hex: string) {
    save('accent', hex);
    setAccentState(hex);
  }
  function setTheme(t: ThemeMode) {
    save('theme', t);
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ accent, theme, setAccent, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
