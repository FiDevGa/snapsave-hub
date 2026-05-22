import { Router, type IRouter } from "express";
import healthRouter from "./health";
import platformsRouter from "./platforms";
import downloadRouter from "./download";
import historyRouter from "./history";
import authRouter from "./auth";
import sourceRouter from "./source";

const router: IRouter = Router();

router.use(healthRouter);
router.use(platformsRouter);
router.use(downloadRouter);
router.use(historyRouter);
router.use(authRouter);
router.use(sourceRouter);

export default router;
