import { useQuery } from '@tanstack/react-query';

export interface ProgramDownload {
  label: string;
  url: string;
  size: string;
  type: string;
}

export interface Program {
  id: number;
  name: string;
  category: 'Programas' | 'Desarrollos' | 'Diseño' | 'Emuladores' | 'Drivers' | 'Juegos';
  description: string;
  version: string;
  size: string;
  downloadUrl: string;
  downloads?: ProgramDownload[];
  instructions: string[];
  color: string;
  icon: string;
  isNew: boolean;
  tags: string[];
  developer: string;
  publisher: string;
  rating: number;
  reviews: number;
  language: string;
  releaseDate: string;
  platform: string;
  videoId: string;
  screenshots: string[];
  coverUrl: string;
}

export interface ProgramsData {
  apps: Program[];
}

const PROGRAMS_URL =
  'https://raw.githubusercontent.com/Solaez/link-pivigames/refs/heads/main/programas.json';

export function usePrograms() {
  return useQuery<ProgramsData>({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await fetch(PROGRAMS_URL);
      if (!res.ok) throw new Error('Failed to fetch programs');
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useEmulators() {
  const q = usePrograms();
  return {
    ...q,
    data: q.data
      ? { ...q.data, apps: q.data.apps.filter((a) => a.category === 'Emuladores') }
      : undefined,
  };
}

export function useSoftware() {
  const q = usePrograms();
  return {
    ...q,
    data: q.data
      ? { ...q.data, apps: q.data.apps.filter((a) => a.category !== 'Emuladores') }
      : undefined,
  };
}
