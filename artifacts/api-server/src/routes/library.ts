import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, libraryTable } from "@workspace/db";
import { GetLibraryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/library", async (_req, res): Promise<void> => {
  const entries = await db
    .select()
    .from(libraryTable)
    .orderBy(desc(libraryTable.installedAt));

  res.json(GetLibraryResponse.parse(entries.map(e => ({
    ...e,
    installedAt: e.installedAt.toISOString(),
    lastPlayedAt: e.lastPlayedAt ? e.lastPlayedAt.toISOString() : null,
  }))));
});

export default router;
