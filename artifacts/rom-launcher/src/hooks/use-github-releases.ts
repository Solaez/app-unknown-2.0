import { useQuery } from '@tanstack/react-query';

export interface GithubRelease {
  id: number;
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  body: string | null;
}

async function fetchReleases(): Promise<GithubRelease[]> {
  const res = await fetch('https://api.github.com/repos/Solaez/UnknownGestor/releases', {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error('GitHub API error');
  return res.json();
}

export function useGithubReleases() {
  return useQuery<GithubRelease[]>({
    queryKey: ['github-releases-unknowngestor'],
    queryFn: fetchReleases,
    staleTime: 1000 * 60 * 30,   // 30 min cache
    refetchOnWindowFocus: false,
  });
}

/** Compare semver strings, returns true if a > b */
export function isNewerVersion(a: string, b: string): boolean {
  const parse = (v: string) =>
    v.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);
  if (aMaj !== bMaj) return aMaj > bMaj;
  if (aMin !== bMin) return aMin > bMin;
  return aPat > bPat;
}

/** localStorage key that stores the last version the user acknowledged */
const DISMISSED_KEY = 'neonrom-update-dismissed-version';

export function getDismissedVersion(): string {
  try { return localStorage.getItem(DISMISSED_KEY) ?? ''; } catch { return ''; }
}

export function setDismissedVersion(v: string) {
  try { localStorage.setItem(DISMISSED_KEY, v); } catch {}
}
