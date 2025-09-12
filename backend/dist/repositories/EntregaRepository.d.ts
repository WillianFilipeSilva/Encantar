import { PrismaClient, Entrega } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateEntregaDTO, UpdateEntregaDTO } from "../models/DTOs";
export declare class EntregaRepository extends BaseRepository<Entrega, CreateEntregaDTO, UpdateEntregaDTO> {
    constructor(prisma: PrismaClient);
}
//# sourceMappingURL=EntregaRepository.d.ts.map