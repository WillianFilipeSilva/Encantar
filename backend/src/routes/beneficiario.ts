import { Router } from "express";
import { BeneficiarioController } from "../controllers/BeneficiarioController";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const beneficiarioRepository = new BeneficiarioRepository(prisma);
const beneficiarioService = new BeneficiarioService(beneficiarioRepository);
const beneficiarioController = new BeneficiarioController(beneficiarioService);

/**
 * GET /api/beneficiarios
 * Lista todos os beneficiários com paginação e filtros
 */
router.get("/", authenticateToken, beneficiarioController.findAll);

/**
 * GET /api/beneficiarios/search
 * Busca beneficiários por nome
 */
router.get("/search", authenticateToken, beneficiarioController.search);

/**
 * GET /api/beneficiarios/active
 * Lista beneficiários ativos para seleção
 */
router.get("/active", authenticateToken, beneficiarioController.findActive);

/**
 * GET /api/beneficiarios/top
 * Lista beneficiários com mais entregas
 */
router.get("/top", authenticateToken, beneficiarioController.findTop);

/**
 * GET /api/beneficiarios/:id
 * Busca um beneficiário por ID com relacionamentos
 */
router.get("/:id", authenticateToken, beneficiarioController.findById);

/**
 * POST /api/beneficiarios
 * Cria um novo beneficiário
 */
router.post("/", authenticateToken, beneficiarioController.create);

/**
 * PUT /api/beneficiarios/:id
 * Atualiza um beneficiário
 */
router.put("/:id", authenticateToken, beneficiarioController.update);

/**
 * DELETE /api/beneficiarios/:id
 * Remove um beneficiário (soft delete)
 */
router.delete("/:id", authenticateToken, beneficiarioController.delete);

export default router;
