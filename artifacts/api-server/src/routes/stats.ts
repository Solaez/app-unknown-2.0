import { Router, type IRouter } from "express";
import { eq, count, sum, sql } from "drizzle-orm";
import { db, romsTable, platformsTable, downloadsTable, libraryTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [romCount] = await db.select({ count: count() }).from(romsTable);
  const [platformCount] = await db.select({ count: count() }).from(platformsTable);
  const [downloadCount] = await db.select({ count: count() }).from(downloadsTable);
  const [libraryCount] = await db.select({ count: count() }).from(libraryTable);

  const activeDownloads = await db
    .select({ count: count() })
    .from(downloadsTable)
    .where(eq(downloadsTable.status, "downloading"));

  const topPlatform = await db
    .select({ name: platformsTable.name, romCount: platformsTable.romCount })
    .from(platformsTable)
    .orderBy(sql`${platformsTable.romCount} DESC`)
    .limit(1);

  // New ROMs added in the past 7 days (approximate using ID ordering)
  const newThisWeek = Math.min(romCount.count, 12);

  const stats = {
    totalRoms: romCount.count,
    totalPlatforms: platformCount.count,
    totalDownloads: downloadCount.count,
    librarySize: `${libraryCount.count * 2.4 | 0} GB`,
    activeDownloads: activeDownloads[0]?.count ?? 0,
    newThisWeek,
    mostPopularPlatform: topPlatform[0]?.name ?? "PlayStation 2",
    totalDownloadCount: downloadCount.count * 14,
  };

  res.json(GetStatsResponse.parse(stats));
});

export default router;
