import { PrismaClient, Beneficiario } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO } from "../models/DTOs";
export declare class BeneficiarioRepository extends BaseRepository<Beneficiario, CreateBeneficiarioDTO, UpdateBeneficiarioDTO> {
    constructor(prisma: PrismaClient);
    findAllWithRelations(page?: number, limit?: number, where?: any): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findByIdWithRelations(id: string): Promise<any>;
    findByNome(nome: string, limit?: number): Promise<any>;
    existsByNomeAndEndereco(nome: string, endereco: string, excludeId?: string): Promise<boolean>;
    findActiveForSelection(): Promise<any>;
    countEntregasByBeneficiario(beneficiarioId: string): Promise<any>;
    findTopBeneficiarios(limit?: number): Promise<any>;
}
//# sourceMappingURL=BeneficiarioRepository.d.ts.map