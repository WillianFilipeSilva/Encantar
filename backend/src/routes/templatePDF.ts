import { Router } from "express";
import { TemplatePDFController } from "../controllers/TemplatePDFController";
import { TemplatePDFService } from "../services/TemplatePDFService";
import { TemplatePDFRepository } from "../repositories/TemplatePDFRepository";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const templateRepository = new TemplatePDFRepository();
const templateService = new TemplatePDFService(templateRepository);
const templateController = new TemplatePDFController(templateService);

router.use(authenticateToken);

router.get("/", templateController.findAll);
router.get("/active", templateController.findActive);
router.get("/search", templateController.search);
router.get("/:id", templateController.findById);
router.post("/", templateController.create);
router.put("/:id", templateController.update);
router.delete("/:id", templateController.delete);
router.patch("/:id/toggle", templateController.toggleAtivo);

export default router;