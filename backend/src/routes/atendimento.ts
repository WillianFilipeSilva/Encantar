import { Router } from "express";
import { AtendimentoRepository } from "../repositories/AtendimentoRepository";
import { AtendimentoService } from "../services/AtendimentoService";
import { AtendimentoController } from "../controllers/AtendimentoController";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { ItemService } from "../services/ItemService";
import { ItemRepository } from "../repositories/ItemRepository";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const repository = new AtendimentoRepository(prisma);
const service = new AtendimentoService(repository, prisma);
const controller = new AtendimentoController(service);

const beneficiarioRepository = new BeneficiarioRepository(prisma);
const beneficiarioService = new BeneficiarioService(beneficiarioRepository);

const itemRepository = new ItemRepository(prisma);
const itemService = new ItemService(itemRepository);

router.use(authenticateToken);

router.get("/beneficiarios/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
    }

    const beneficiarios = await beneficiarioService.search(q, true);
    return res.json({ data: beneficiarios });
  } catch (error) {
    console.error('Erro ao buscar beneficiários:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get("/itens/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
    }

    const itens = await itemService.search(q, true);
    return res.json({ data: itens });
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findById.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const validStatuses = ['PENDENTE', 'CONCLUIDO', 'CANCELADO'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use: PENDENTE, CONCLUIDO ou CANCELADO' });
    }

    const userId = (req as any).user?.id;
    const updatedAtendimento = await service.update(id, { status }, userId);
    
    return res.json({ data: updatedAtendimento });
  } catch (error) {
    console.error('Erro ao atualizar status da atendimento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
