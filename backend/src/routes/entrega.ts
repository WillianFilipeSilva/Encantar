import { Router } from "express";
import { EntregaRepository } from "../repositories/EntregaRepository";
import { EntregaService } from "../services/EntregaService";
import { EntregaController } from "../controllers/EntregaController";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { ItemService } from "../services/ItemService";
import { ItemRepository } from "../repositories/ItemRepository";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../utils/database";

const router = Router();

const repository = new EntregaRepository(prisma);
const service = new EntregaService(repository, prisma);
const controller = new EntregaController(service);

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

    const validStatuses = ['PENDENTE', 'ENTREGUE', 'CANCELADA'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use: PENDENTE, ENTREGUE ou CANCELADA' });
    }

    const userId = (req as any).user?.id;
    const updatedEntrega = await service.update(id, { status }, userId);
    
    return res.json({ data: updatedEntrega });
  } catch (error) {
    console.error('Erro ao atualizar status da entrega:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
