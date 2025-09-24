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

router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
