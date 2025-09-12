import { ModeloEntrega } from "@prisma/client";
import { BaseService } from "./BaseService";
import { ModeloEntregaRepository } from "../repositories/ModeloEntregaRepository";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";
export declare class ModeloEntregaService extends BaseService<ModeloEntrega, CreateModeloEntregaDTO, UpdateModeloEntregaDTO> {
    constructor(repository: ModeloEntregaRepository);
    protected validateCreateData(data: CreateModeloEntregaDTO): Promise<void>;
    protected validateUpdateData(data: UpdateModeloEntregaDTO): Promise<void>;
}
//# sourceMappingURL=ModeloEntregaService.d.ts.map