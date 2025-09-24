import { Router } from "express";
import { RotaRepository } from "../repositories/RotaRepository";
import { RotaService } from "../services/RotaService";
import { RotaController } from "../controllers/RotaController";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const repository = new RotaRepository(prisma);
const service = new RotaService(repository);
const controller = new RotaController(service);

router.use(authenticateToken);

router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
