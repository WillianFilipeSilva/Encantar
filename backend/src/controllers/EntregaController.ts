import { Entrega } from "@prisma/client";
import { BaseController } from "./BaseController";
import { EntregaService } from "../services/EntregaService";
import { CreateEntregaDTO, UpdateEntregaDTO } from "../models/DTOs";

export class EntregaController extends BaseController<
  Entrega,
  CreateEntregaDTO,
  UpdateEntregaDTO
> {
  constructor(service: EntregaService) {
    super(service);
  }
}
