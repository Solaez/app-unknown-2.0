import { createContext, useContext, useState } from 'react';

export const DEFAULT_ROM_URL =
  'https://raw.githubusercontent.com/Solaez/link-pivigames/refs/heads/main/roms.json';
export const DEFAULT_PROGRAMAS_URL =
  'https://raw.githubusercontent.com/Solaez/link-pivigames/refs/heads/main/programas.json';

interface SourcesCtx {
  romUrl: string;
  programasUrl: string;
  setRomUrl: (url: string) => void;
  setProgramasUrl: (url: string) => void;
}

const SourcesContext = createContext<SourcesCtx>({
  romUrl: DEFAULT_ROM_URL,
  programasUrl: DEFAULT_PROGRAMAS_URL,
  setRomUrl: () => {},
  setProgramasUrl: () => {},
});

function load(key: string, fallback: string): string {
  try {
    const v = localStorage.getItem(`neonrom-settings-${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: string) {
  localStorage.setItem(`neonrom-settings-${key}`, JSON.stringify(value));
}

export function SourcesProvider({ children }: { children: React.ReactNode }) {
  const [romUrl, setRomUrlState] = useState(() => load('romSourceUrl', DEFAULT_ROM_URL));
  const [programasUrl, setProgramasUrlState] = useState(() => load('programasSourceUrl', DEFAULT_PROGRAMAS_URL));

  function setRomUrl(url: string) {
    save('romSourceUrl', url);
    setRomUrlState(url);
  }
  function setProgramasUrl(url: string) {
    save('programasSourceUrl', url);
    setProgramasUrlState(url);
  }

  return (
    <SourcesContext.Provider value={{ romUrl, programasUrl, setRomUrl, setProgramasUrl }}>
      {children}
    </SourcesContext.Provider>
  );
}

export function useSources() {
  return useContext(SourcesContext);
}
