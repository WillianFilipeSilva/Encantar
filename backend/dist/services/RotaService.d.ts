import { Rota } from "@prisma/client";
import { BaseService } from "./BaseService";
import { RotaRepository } from "../repositories/RotaRepository";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
export declare class RotaService extends BaseService<Rota, CreateRotaDTO, UpdateRotaDTO> {
    constructor(repository: RotaRepository);
    protected validateCreateData(data: CreateRotaDTO): Promise<void>;
    protected validateUpdateData(data: UpdateRotaDTO): Promise<void>;
}
//# sourceMappingURL=RotaService.d.ts.map