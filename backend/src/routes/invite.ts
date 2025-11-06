import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();
const authController = new AuthController();

const inviteValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Muitas tentativas de validação. Tente novamente em 15 minutos.",
    code: "INVITE_VALIDATION_RATE_LIMIT",
  },
});

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
router.get("/:token", inviteValidationLimiter, authController.validateInvite);

export default router;