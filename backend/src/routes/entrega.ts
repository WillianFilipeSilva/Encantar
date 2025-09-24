import { Router } from "express";
import { EntregaRepository } from "../repositories/EntregaRepository";
import { EntregaService } from "../services/EntregaService";
import { EntregaController } from "../controllers/EntregaController";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const repository = new EntregaRepository(prisma);
const service = new EntregaService(repository);
const controller = new EntregaController(service);

router.use(authenticateToken);

router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
