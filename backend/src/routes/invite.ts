import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

/**
 * POST /api/invite
 * Cria um convite para novo administrador
 */
router.post("/", authenticateToken, authController.createInvite);

/**
 * GET /api/invite/active
 * Retorna o convite ativo do usuário
 */
router.get("/active", authenticateToken, authController.getActiveInvite);

/**
 * GET /api/invite/:token
 * Valida um token de convite
 */
router.get("/:token", authController.validateInvite);

export default router;