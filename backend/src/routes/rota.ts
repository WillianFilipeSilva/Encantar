import { Router } from "express";
import { RotaRepository } from "../repositories/RotaRepository";
import { RotaService } from "../services/RotaService";
import { RotaController } from "../controllers/RotaController";
import { EntregaRepository } from "../repositories/EntregaRepository";
import { EntregaService } from "../services/EntregaService";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const repository = new RotaRepository(prisma);
const service = new RotaService(repository);
const controller = new RotaController(service);

const entregaRepository = new EntregaRepository(prisma);
const entregaService = new EntregaService(entregaRepository, prisma);

router.use(authenticateToken);

router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.get("/:id/pdf/:templateId", controller.generatePDF.bind(controller));
router.get("/:id/pdf/preview/:templateId", controller.previewPDF.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

router.patch("/:id/entregas/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    await entregaService.updateStatusByRota(id, status);
    
    return res.json({ message: 'Status das entregas atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status das entregas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
