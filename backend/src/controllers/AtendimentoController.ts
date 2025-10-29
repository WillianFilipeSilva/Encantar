import { Atendimento } from "@prisma/client";
import { BaseController } from "./BaseController";
import { AtendimentoService } from "../services/AtendimentoService";
import { CreateAtendimentoDTO, UpdateAtendimentoDTO } from "../models/DTOs";

export class AtendimentoController extends BaseController<
  Atendimento,
  CreateAtendimentoDTO,
  UpdateAtendimentoDTO
> {
  constructor(service: AtendimentoService) {
    super(service);
  }
}