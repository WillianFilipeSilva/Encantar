import { ModeloEntrega } from "@prisma/client";
import { BaseController } from "./BaseController";
import { ModeloEntregaService } from "../services/ModeloEntregaService";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";

export class ModeloEntregaController extends BaseController<
  ModeloEntrega,
  CreateModeloEntregaDTO,
  UpdateModeloEntregaDTO
> {
  constructor(service: ModeloEntregaService) {
    super(service);
  }
}
