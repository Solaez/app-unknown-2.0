import { Router, type IRouter } from "express";
import healthRouter from "./health";
import platformsRouter from "./platforms";
import romsRouter from "./roms";
import newsRouter from "./news";
import downloadsRouter from "./downloads";
import libraryRouter from "./library";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(platformsRouter);
router.use(romsRouter);
router.use(newsRouter);
router.use(downloadsRouter);
router.use(libraryRouter);
router.use(statsRouter);

export default router;
