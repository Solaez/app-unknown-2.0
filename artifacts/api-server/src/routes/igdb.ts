import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

/* ── Token cache ── */
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getIgdbToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("IGDB credentials not configured (IGDB_CLIENT_ID / IGDB_CLIENT_SECRET)");
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" },
  );

  if (!res.ok) {
    throw new Error(`Twitch token error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000, // 5-min buffer
  };

  return cachedToken.token;
}

/* ── Console-name → IGDB platform ID ── */
const PLATFORM_NAME_MAP: Array<[RegExp, number]> = [
  [/playstation\s*5|ps5/i, 167],
  [/playstation\s*4|ps4/i, 48],
  [/playstation\s*3|ps3/i, 9],
  [/playstation\s*2|ps2/i, 8],
  [/playstation\s*(portable|psp)/i, 38],
  [/playstation\s*(vita)/i, 46],
  [/playstation|psx|ps1/i, 7],
  [/nintendo\s*64|n64/i, 4],
  [/super\s*(nintendo|nes)|snes/i, 19],
  [/\bnes\b|famicom/i, 18],
  [/game\s*boy\s*advance|gba/i, 24],
  [/game\s*boy\s*color|gbc/i, 22],
  [/\bgame\s*boy\b/i, 33],
  [/nintendo\s*ds\b/i, 20],
  [/nintendo\s*3ds/i, 37],
  [/gamecube/i, 21],
  [/\bwii\s*u/i, 41],
  [/\bwii\b/i, 5],
  [/\bswitch\b/i, 130],
  [/xbox\s*360/i, 12],
  [/xbox\s*(one|series)/i, 49],
  [/\bxbox\b/i, 11],
  [/sega\s*(genesis|mega\s*drive)/i, 29],
  [/sega\s*saturn/i, 32],
  [/dreamcast/i, 23],
  [/sega\s*cd|mega-cd/i, 78],
  [/game\s*gear/i, 35],
  [/atari\s*2600/i, 59],
  [/neo\s*geo/i, 80],
  [/pc\s*engine|turbografx/i, 86],
];

function getPlatformId(consoleName: string): number | null {
  for (const [pattern, id] of PLATFORM_NAME_MAP) {
    if (pattern.test(consoleName)) return id;
  }
  return null;
}

/* ── GET /igdb/game-info?title=...&console=... ── */
router.get("/igdb/game-info", async (req, res) => {
  try {
    const title = (req.query.title as string | undefined)?.trim();
    const consoleName = (req.query.console as string | undefined)?.trim();

    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    const token = await getIgdbToken();
    const clientId = process.env.IGDB_CLIENT_ID!;

    const platformId = consoleName ? getPlatformId(consoleName) : null;
    const whereClause = platformId ? `where platforms = (${platformId});` : "";

    const query = [
      "fields name, summary, total_rating, total_rating_count, first_release_date,",
      "       cover.url, screenshots.url, videos.video_id,",
      "       involved_companies.developer, involved_companies.company.name;",
      `search "${title.replace(/"/g, "")}";`,
      whereClause,
      "limit 1;",
    ].join("\n");

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: query,
    });

    if (!igdbRes.ok) {
      throw new Error(`IGDB API error: ${igdbRes.status} ${await igdbRes.text()}`);
    }

    const games = (await igdbRes.json()) as any[];

    if (!games.length) {
      res.json(null);
      return;
    }

    const g = games[0];

    const coverUrl = g.cover?.url
      ? "https:" + g.cover.url.replace("t_thumb", "t_cover_big")
      : null;

    const screenshots: string[] = (g.screenshots ?? [])
      .slice(0, 8)
      .map((s: any) => "https:" + s.url.replace("t_thumb", "t_screenshot_big"));

    const devCompany = (g.involved_companies ?? []).find((ic: any) => ic.developer);
    const developer: string | null = devCompany?.company?.name ?? null;

    const videoId: string | null = g.videos?.[0]?.video_id ?? null;

    const releaseYear: number | null = g.first_release_date
      ? new Date(g.first_release_date * 1000).getFullYear()
      : null;

    // total_rating is 0-100; normalise to 0-10 for consistency with existing rating field
    const rating: number | null =
      typeof g.total_rating === "number"
        ? Math.round(g.total_rating) / 10
        : null;

    res.json({
      name: g.name ?? null,
      summary: g.summary ?? null,
      rating,
      ratingRaw: g.total_rating ?? null,   // 0-100 for display
      ratingCount: g.total_rating_count ?? null,
      releaseYear,
      coverUrl,
      screenshots,
      videoId,
      developer,
    });
  } catch (err) {
    logger.error({ err }, "IGDB route error");
    res.status(500).json({ error: "Failed to fetch game info from IGDB" });
  }
});

export default router;
