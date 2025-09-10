import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

// ===========================================
// ROTAS PÚBLICAS (sem autenticação)
// ===========================================

/**
 * POST /api/auth/login
 * Autentica um usuário
 */
router.post("/login", authController.login);

/**
 * POST /api/auth/register
 * Registra um novo usuário via convite
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/refresh
 * Renova o access token usando refresh token
 */
router.post("/refresh", authController.refresh);

/**
 * GET /api/auth/invite/:token
 * Valida um token de convite
 */
router.get("/invite/:token", authController.validateInvite);

// ===========================================
// ROTAS PROTEGIDAS (requer autenticação)
// ===========================================

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get("/me", authenticateToken, authController.me);

/**
 * POST /api/auth/invite
 * Cria um convite para novo administrador
 */
router.post("/invite", authenticateToken, authController.createInvite);

/**
 * POST /api/auth/logout
 * Logout do usuário
 */
router.post("/logout", authenticateToken, authController.logout);

export default router;
