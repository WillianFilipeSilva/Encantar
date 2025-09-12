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

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
