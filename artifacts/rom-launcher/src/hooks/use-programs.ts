import { useQuery } from '@tanstack/react-query';
import { useSources, DEFAULT_PROGRAMAS_URL } from '@/contexts/sources-context';

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

export function usePrograms() {
  const { programasUrl } = useSources();
  const url = programasUrl || DEFAULT_PROGRAMAS_URL;
  return useQuery<ProgramsData>({
    queryKey: ['programs', url],
    queryFn: async () => {
      const res = await fetch(url);
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

export function useProgramById(id: string | number) {
  const q = usePrograms();
  return {
    ...q,
    data: q.data?.apps.find((a) => String(a.id) === String(id)),
  };
}
