import { Entrega } from "@prisma/client";
import { BaseService } from "./BaseService";
import { EntregaRepository } from "../repositories/EntregaRepository";
import { CreateEntregaDTO, UpdateEntregaDTO } from "../models/DTOs";
export declare class EntregaService extends BaseService<Entrega, CreateEntregaDTO, UpdateEntregaDTO> {
    constructor(repository: EntregaRepository);
    protected validateCreateData(data: CreateEntregaDTO): Promise<void>;
}
//# sourceMappingURL=EntregaService.d.ts.map