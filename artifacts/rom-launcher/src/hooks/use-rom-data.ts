import { useQuery } from '@tanstack/react-query';
import type { RomDataJson, FlatRom, GithubConsole } from '@/types/rom-types';

/* ── IGDB ── */
export interface IgdbGameInfo {
  name: string | null;
  summary: string | null;
  rating: number | null;       // 0–10
  ratingRaw: number | null;    // 0–100
  ratingCount: number | null;
  releaseYear: number | null;
  coverUrl: string | null;
  screenshots: string[];
  videoId: string | null;
  developer: string | null;
}

export function useIgdbGameInfo(title: string, consoleName?: string, enabled = true) {
  return useQuery<IgdbGameInfo | null>({
    queryKey: ['igdb-game-info', title, consoleName ?? ''],
    queryFn: async () => {
      const params = new URLSearchParams({ title });
      if (consoleName) params.set('console', consoleName);
      const res = await fetch(`/api/igdb/game-info?${params}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: enabled && !!title,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}

/** Lightweight alias — shares cache with useIgdbGameInfo, activates only when `visible` is true */
export function useIgdbCover(title: string, consoleName: string, visible: boolean) {
  return useIgdbGameInfo(title, consoleName, visible);
}

const ROM_JSON_URL =
  'https://raw.githubusercontent.com/Solaez/link-pivigames/refs/heads/main/roms.json';

async function fetchRomData(): Promise<RomDataJson> {
  const res = await fetch(ROM_JSON_URL);
  if (!res.ok) throw new Error('Failed to fetch ROM data');
  return res.json();
}

export function useRomData() {
  return useQuery<RomDataJson>({
    queryKey: ['github-rom-data'],
    queryFn: fetchRomData,
    staleTime: 1000 * 60 * 30,
  });
}

export function useConsoles() {
  const { data, ...rest } = useRomData();
  return { data: data?.consoles ?? [], ...rest };
}

export function useConsole(id: string) {
  const { data, ...rest } = useRomData();
  const console_ = data?.consoles.find((c) => c.id === id);
  return { data: console_, ...rest };
}

export function useAllRoms(opts?: { consoleId?: string; search?: string; genre?: string }) {
  const { data, ...rest } = useRomData();

  let roms: FlatRom[] = [];
  if (data) {
    const consoles = opts?.consoleId
      ? data.consoles.filter((c) => c.id === opts.consoleId)
      : data.consoles;

    roms = consoles.flatMap((c: GithubConsole) =>
      c.roms.map((r) => ({
        ...r,
        consoleName: c.name,
        consoleId: c.id,
        consoleGradient: c.gradient,
        consoleShortName: c.shortName,
      }))
    );

    if (opts?.search) {
      const q = opts.search.toLowerCase();
      roms = roms.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.genre.toLowerCase().includes(q) ||
          r.consoleName.toLowerCase().includes(q)
      );
    }

    if (opts?.genre) {
      roms = roms.filter((r) =>
        r.genre.toLowerCase().includes(opts.genre!.toLowerCase())
      );
    }
  }

  return { data: roms, ...rest };
}

export function useRomById(id: string) {
  const { data, ...rest } = useRomData();
  let found: FlatRom | undefined;
  if (data) {
    for (const c of data.consoles) {
      const r = c.roms.find((rom) => rom.id === id);
      if (r) {
        found = {
          ...r,
          consoleName: c.name,
          consoleId: c.id,
          consoleGradient: c.gradient,
          consoleShortName: c.shortName,
        };
        break;
      }
    }
  }
  return { data: found, ...rest };
}

export function useRomStats() {
  const { data, ...rest } = useRomData();
  const totalRoms = data?.consoles.reduce((acc, c) => acc + c.roms.length, 0) ?? 0;
  const totalConsoles = data?.consoles.length ?? 0;
  return { data: { totalRoms, totalConsoles }, ...rest };
}
