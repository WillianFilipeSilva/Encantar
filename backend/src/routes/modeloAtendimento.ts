import { Router } from "express";
import { ModeloAtendimentoRepository } from "../repositories/ModeloAtendimentoRepository";
import { ModeloAtendimentoService } from "../services/ModeloAtendimentoService";
import { ModeloAtendimentoController } from "../controllers/ModeloAtendimentoController";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const repository = new ModeloAtendimentoRepository(prisma);
const service = new ModeloAtendimentoService(repository);
const controller = new ModeloAtendimentoController(service);

router.use(authenticateToken);

router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
