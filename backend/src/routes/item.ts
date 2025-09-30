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
router.get("/", validateSearch, itemController.findAll.bind(itemController));
router.get(
  "/with-relations",
  validateSearch,
  itemController.findAllWithRelations.bind(itemController)
);
router.get("/active", itemController.findActiveForSelection.bind(itemController));
router.get("/unidades", itemController.findDistinctUnidades.bind(itemController));
router.get("/most-used", validateLimit, itemController.findMostUsed.bind(itemController));
router.get("/search", validateSearchByName, itemController.findByNome.bind(itemController));
router.get(
  "/by-unidade",
  validateSearchByUnidade,
  itemController.findByUnidade.bind(itemController)
);
router.get("/:id", validateId, itemController.findById.bind(itemController));
router.get(
  "/:id/with-relations",
  validateId,
  itemController.findByIdWithRelations.bind(itemController)
);
router.get("/:id/stats", validateId, itemController.getItemStats.bind(itemController));
router.post("/", validateCreate, itemController.create.bind(itemController));
router.put("/:id", validateUpdate, itemController.update.bind(itemController));
router.patch("/:id/inactivate", validateId, itemController.inactivate.bind(itemController));
router.patch("/:id/activate", validateId, itemController.activate.bind(itemController));
router.delete("/:id", validateId, itemController.delete.bind(itemController));

export default router;
