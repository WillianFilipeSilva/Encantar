import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { BaseService } from "./BaseService";
import { Beneficiario } from "@prisma/client";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO, BeneficiarioResponseDTO } from "../models/DTOs";
export declare class BeneficiarioService extends BaseService<Beneficiario, CreateBeneficiarioDTO, UpdateBeneficiarioDTO> {
    private beneficiarioRepository;
    constructor(beneficiarioRepository: BeneficiarioRepository);
    findAllWithRelations(page?: number, limit?: number, filters?: any): Promise<{
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
    findByIdWithRelations(id: string): Promise<BeneficiarioResponseDTO>;
    create(data: CreateBeneficiarioDTO, userId?: string): Promise<BeneficiarioResponseDTO>;
    update(id: string, data: UpdateBeneficiarioDTO, userId?: string): Promise<BeneficiarioResponseDTO>;
    findByNome(nome: string, limit?: number): Promise<any>;
    findActiveForSelection(): Promise<any>;
    findTopBeneficiarios(limit?: number): Promise<any>;
    protected validateCreateData(data: CreateBeneficiarioDTO): Promise<void>;
    protected validateUpdateData(data: UpdateBeneficiarioDTO): Promise<void>;
    private transformBeneficiarioData;
    private isValidEmail;
    private isValidPhone;
}
//# sourceMappingURL=BeneficiarioService.d.ts.map