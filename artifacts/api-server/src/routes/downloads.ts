import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, downloadsTable, romsTable } from "@workspace/db";
import {
  GetDownloadsResponse,
  CreateDownloadBody,
  CreateDownloadResponse,
  CancelDownloadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/downloads", async (_req, res): Promise<void> => {
  const downloads = await db
    .select()
    .from(downloadsTable)
    .orderBy(desc(downloadsTable.startedAt))
    .limit(50);

  res.json(GetDownloadsResponse.parse(downloads.map(d => ({
    ...d,
    startedAt: d.startedAt.toISOString(),
  }))));
});

router.post("/downloads", async (req, res): Promise<void> => {
  const parsed = CreateDownloadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [rom] = await db.select().from(romsTable).where(eq(romsTable.id, parsed.data.romId));
  if (!rom) {
    res.status(404).json({ error: "ROM not found" });
    return;
  }

  const [download] = await db.insert(downloadsTable).values({
    romId: rom.id,
    romTitle: rom.title,
    platformName: rom.platformName,
    progress: 0,
    speed: "3.2 MB/s",
    size: rom.size,
    status: "downloading",
    coverUrl: rom.coverUrl,
  }).returning();

  res.status(201).json(CreateDownloadResponse.parse({
    ...download,
    startedAt: download.startedAt.toISOString(),
  }));
});

router.delete("/downloads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CancelDownloadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(downloadsTable).where(eq(downloadsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
