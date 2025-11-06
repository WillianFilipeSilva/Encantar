import { Router } from "express";
import { RotaRepository } from "../repositories/RotaRepository";
import { RotaService } from "../services/RotaService";
import { RotaController } from "../controllers/RotaController";
import { AtendimentoRepository } from "../repositories/AtendimentoRepository";
import { AtendimentoService } from "../services/AtendimentoService";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";
import logger from "../utils/logger";

const router = Router();

const repository = new RotaRepository(prisma);
const service = new RotaService(repository);
const controller = new RotaController(service);

const atendimentoRepository = new AtendimentoRepository(prisma);
const atendimentoService = new AtendimentoService(atendimentoRepository, prisma);

router.use(authenticateToken);

router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.get("/:id/pdf/:templateId", controller.generatePDF.bind(controller));
router.get("/:id/pdf/preview/:templateId", controller.previewPDF.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

router.patch("/:id/atendimentos/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    await atendimentoService.updateStatusByRota(id, status);
    
    return res.json({ message: 'Status dos atendimentos atualizado com sucesso' });
  } catch (error) {
    logger.error('Erro ao atualizar status das atendimentos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
