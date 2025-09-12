import { PrismaClient, Rota } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
export declare class RotaRepository extends BaseRepository<Rota, CreateRotaDTO, UpdateRotaDTO> {
    constructor(prisma: PrismaClient);
}
//# sourceMappingURL=RotaRepository.d.ts.map