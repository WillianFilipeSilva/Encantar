import { Router } from "express";
import { BeneficiarioController } from "../controllers/BeneficiarioController";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { authenticateToken } from "../middleware/auth";
import { cacheMiddleware } from "../middleware/cache";
import { prisma } from "../utils/database";

const router = Router();

// Configurações de cache
const shortCache = { ttl: 300 }; // 5 minutos
const mediumCache = { ttl: 1800 }; // 30 minutos

// Inicializa as dependências
const beneficiarioRepository = new BeneficiarioRepository(prisma);
const beneficiarioService = new BeneficiarioService(beneficiarioRepository);
const beneficiarioController = new BeneficiarioController(beneficiarioService);

// ===========================================
// ROTAS PROTEGIDAS (requer autenticação)
// ===========================================

/**
 * GET /api/beneficiarios
 * Lista todos os beneficiários com paginação e filtros
 */
router.get("/", authenticateToken, cacheMiddleware(shortCache), beneficiarioController.findAll);

/**
 * GET /api/beneficiarios/search
 * Busca beneficiários por nome
 */
router.get("/search", authenticateToken, cacheMiddleware({
  ttl: 300,
  key: (req) => `beneficiario:search:${req.query.nome}`,
}), beneficiarioController.search);

/**
 * GET /api/beneficiarios/active
 * Lista beneficiários ativos para seleção
 */
router.get("/active", authenticateToken, cacheMiddleware(mediumCache), beneficiarioController.findActive);

/**
 * GET /api/beneficiarios/top
 * Lista beneficiários com mais entregas
 */
router.get("/top", authenticateToken, cacheMiddleware(mediumCache), beneficiarioController.findTop);

/**
 * GET /api/beneficiarios/:id
 * Busca um beneficiário por ID com relacionamentos
 */
router.get("/:id", authenticateToken, cacheMiddleware({
  ttl: 300,
  key: (req) => `beneficiario:${req.params.id}`,
}), beneficiarioController.findById);

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
