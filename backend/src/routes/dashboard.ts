import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticateToken);

/**
 * GET /dashboard - Obter estatísticas do dashboard
 */
router.get("/", dashboardController.getStats);

export default router;