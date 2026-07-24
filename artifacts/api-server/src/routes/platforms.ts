import { Router, type IRouter } from "express";
import { db, platformsTable } from "@workspace/db";
import { GetPlatformsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/platforms", async (req, res): Promise<void> => {
  const platforms = await db.select().from(platformsTable).orderBy(platformsTable.name);
  res.json(GetPlatformsResponse.parse(platforms));
});

export default router;
