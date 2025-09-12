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

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
