import { ModeloEntrega } from "@prisma/client";
import { BaseController } from "./BaseController";
import { ModeloEntregaService } from "../services/ModeloEntregaService";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";
export declare class ModeloEntregaController extends BaseController<ModeloEntrega, CreateModeloEntregaDTO, UpdateModeloEntregaDTO> {
    constructor(service: ModeloEntregaService);
}
//# sourceMappingURL=ModeloEntregaController.d.ts.map