import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ItemRepository } from "../repositories/ItemRepository";
import { ItemService } from "../services/ItemService";
import { ItemController } from "../controllers/ItemController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Inicializa dependências
const itemRepository = new ItemRepository(prisma);
const itemService = new ItemService(itemRepository);
const itemController = new ItemController(itemService);

// Obtém validações
const {
  validateCreate,
  validateUpdate,
  validateSearch,
  validateId,
  validateSearchByName,
  validateSearchByUnidade,
  validateLimit,
} = itemController.getValidations();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rotas CRUD básicas
router.get("/", validateSearch, itemController.findAll);
router.get(
  "/with-relations",
  validateSearch,
  itemController.findAllWithRelations
);
router.get("/active", itemController.findActiveForSelection);
router.get("/unidades", itemController.findDistinctUnidades);
router.get("/most-used", validateLimit, itemController.findMostUsed);
router.get("/search", validateSearchByName, itemController.findByNome);
router.get(
  "/by-unidade",
  validateSearchByUnidade,
  itemController.findByUnidade
);
router.get("/:id", validateId, itemController.findById);
router.get(
  "/:id/with-relations",
  validateId,
  itemController.findByIdWithRelations
);
router.get("/:id/stats", validateId, itemController.getItemStats);
router.post("/", validateCreate, itemController.create);
router.put("/:id", validateUpdate, itemController.update);
router.delete("/:id", validateId, itemController.delete);
router.patch("/:id/reactivate", validateId, itemController.reactivate);

export default router;
