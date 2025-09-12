import { Router } from "express";
import { ModeloEntregaRepository } from "../repositories/ModeloEntregaRepository";
import { ModeloEntregaService } from "../services/ModeloEntregaService";
import { ModeloEntregaController } from "../controllers/ModeloEntregaController";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const repository = new ModeloEntregaRepository(prisma);
const service = new ModeloEntregaService(repository);
const controller = new ModeloEntregaController(service);

router.use(authenticateToken);

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
