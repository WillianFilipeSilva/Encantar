import { PrismaClient, ModeloEntrega } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";
export declare class ModeloEntregaRepository extends BaseRepository<ModeloEntrega, CreateModeloEntregaDTO, UpdateModeloEntregaDTO> {
    constructor(prisma: PrismaClient);
}
//# sourceMappingURL=ModeloEntregaRepository.d.ts.map