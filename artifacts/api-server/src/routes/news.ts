import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, newsTable } from "@workspace/db";
import { GetNewsQueryParams, GetNewsResponse, GetLatestNewsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/news", async (req, res): Promise<void> => {
  const parsed = GetNewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const articles = await db
    .select()
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt))
    .limit(parsed.data.limit ?? 20);

  res.json(GetNewsResponse.parse(articles.map(a => ({
    ...a,
    publishedAt: a.publishedAt.toISOString(),
  }))));
});

router.get("/news/latest", async (_req, res): Promise<void> => {
  const articles = await db
    .select()
    .from(newsTable)
    .orderBy(desc(newsTable.publishedAt))
    .limit(3);

  res.json(GetLatestNewsResponse.parse(articles.map(a => ({
    ...a,
    publishedAt: a.publishedAt.toISOString(),
  }))));
});

export default router;
