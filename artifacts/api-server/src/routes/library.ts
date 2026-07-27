import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, libraryTable } from "@workspace/db";
import { GetLibraryResponse, AddToLibraryBody, AddToLibraryResponse } from "@workspace/api-zod";

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

router.post("/library", async (req, res): Promise<void> => {
  const parsed = AddToLibraryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check if already in library by title
  const existing = await db
    .select()
    .from(libraryTable)
    .where(eq(libraryTable.romTitle, parsed.data.romTitle))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "ROM is already in your library" });
    return;
  }

  const [entry] = await db.insert(libraryTable).values({
    romId: 0, // ROMs are sourced from external JSON; romId is non-functional here
    romTitle: parsed.data.romTitle,
    platformName: parsed.data.platformName,
    platformSlug: parsed.data.platformSlug,
    coverUrl: parsed.data.coverUrl ?? null,
    fileSize: parsed.data.fileSize,
  }).returning();

  res.status(201).json(AddToLibraryResponse.parse({
    ...entry,
    installedAt: entry.installedAt.toISOString(),
    lastPlayedAt: entry.lastPlayedAt ? entry.lastPlayedAt.toISOString() : null,
  }));
});

export default router;
