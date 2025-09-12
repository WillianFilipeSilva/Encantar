import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { BaseService } from "./BaseService";
import { Beneficiario } from "@prisma/client";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO, BeneficiarioResponseDTO } from "../models/DTOs";
export declare class BeneficiarioService extends BaseService<Beneficiario, CreateBeneficiarioDTO, UpdateBeneficiarioDTO> {
    private beneficiarioRepository;
    constructor(beneficiarioRepository: BeneficiarioRepository);
    findAllWithRelations(page?: number, limit?: number, filters?: any): Promise<{
        data: ({
            _count: {
                entregas: number;
            };
            criadoPor: {
                id: string;
                nome: string;
            };
            modificadoPor: {
                id: string;
                nome: string;
            } | null;
        } & {
            id: string;
            nome: string;
            ativo: boolean;
            criadoEm: Date;
            atualizadoEm: Date;
            email: string | null;
            telefone: string | null;
            criadoPorId: string;
            observacoes: string | null;
            modificadoPorId: string | null;
            endereco: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findByIdWithRelations(id: string): Promise<BeneficiarioResponseDTO>;
    create(data: CreateBeneficiarioDTO, userId?: string): Promise<BeneficiarioResponseDTO>;
    update(id: string, data: UpdateBeneficiarioDTO, userId?: string): Promise<BeneficiarioResponseDTO>;
    findByNome(nome: string, limit?: number): Promise<{
        id: string;
        nome: string;
        telefone: string | null;
        endereco: string;
    }[]>;
    findActiveForSelection(): Promise<{
        id: string;
        nome: string;
        telefone: string | null;
        endereco: string;
    }[]>;
    findTopBeneficiarios(limit?: number): Promise<({
        _count: {
            entregas: number;
        };
    } & {
        id: string;
        nome: string;
        ativo: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        email: string | null;
        telefone: string | null;
        criadoPorId: string;
        observacoes: string | null;
        modificadoPorId: string | null;
        endereco: string;
    })[]>;
    protected validateCreateData(data: CreateBeneficiarioDTO): Promise<void>;
    protected validateUpdateData(data: UpdateBeneficiarioDTO): Promise<void>;
    private transformBeneficiarioData;
    private isValidEmail;
    private isValidPhone;
}
//# sourceMappingURL=BeneficiarioService.d.ts.map