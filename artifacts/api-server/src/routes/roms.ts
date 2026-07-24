import { Router, type IRouter } from "express";
import { eq, ilike, and, desc, type SQL } from "drizzle-orm";
import { db, romsTable } from "@workspace/db";
import {
  GetRomsQueryParams,
  GetRomsResponse,
  GetFeaturedRomsResponse,
  GetRomParams,
  GetRomResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/roms", async (req, res): Promise<void> => {
  const parsed = GetRomsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { platformId, search, genre, limit, offset } = parsed.data;

  const conditions: SQL[] = [];
  if (platformId) conditions.push(eq(romsTable.platformId, parseInt(platformId, 10)));
  if (search) conditions.push(ilike(romsTable.title, `%${search}%`));
  if (genre) conditions.push(eq(romsTable.genre, genre));

  const query = db
    .select()
    .from(romsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(romsTable.downloadCount))
    .limit(limit ?? 50)
    .offset(offset ?? 0);

  const roms = await query;
  res.json(GetRomsResponse.parse(roms));
});

router.get("/roms/featured", async (_req, res): Promise<void> => {
  const roms = await db
    .select()
    .from(romsTable)
    .where(eq(romsTable.isFeatured, true))
    .orderBy(desc(romsTable.rating))
    .limit(6);
  res.json(GetFeaturedRomsResponse.parse(roms));
});

router.get("/roms/:id", async (req, res): Promise<void> => {
  const params = GetRomParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [rom] = await db.select().from(romsTable).where(eq(romsTable.id, params.data.id));
  if (!rom) {
    res.status(404).json({ error: "ROM not found" });
    return;
  }
  res.json(GetRomResponse.parse(rom));
});

export default router;
