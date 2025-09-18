import { BeneficiarioRepository } from "../repositories/BeneficiarioRepository";
import { BaseService } from "./BaseService";
import { Beneficiario } from "@prisma/client";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO } from "../models/DTOs";
export declare class BeneficiarioService extends BaseService<Beneficiario, CreateBeneficiarioDTO, UpdateBeneficiarioDTO> {
    private beneficiarioRepository;
    constructor(beneficiarioRepository: BeneficiarioRepository);
    findAllWithRelations(page?: number, limit?: number, filters?: any): Promise<{
        data: (Beneficiario & {
            criadoPor: {
                id: string;
                nome: string;
            };
            modificadoPor: {
                id: string;
                nome: string;
            } | null;
            _count: {
                entregas: number;
            };
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
    findByIdWithRelations(id: string): Promise<Beneficiario & {
        criadoPor: {
            id: string;
            nome: string;
        };
        modificadoPor: {
            id: string;
            nome: string;
        } | null;
        entregas: {
            id: string;
            entregaItems: {
                id: string;
                item: {
                    id: string;
                    nome: string;
                    descricao: string | null;
                };
            }[];
            rota: {
                id: string;
                nome: string;
            };
        }[];
        _count: {
            entregas: number;
        };
    }>;
    create(data: CreateBeneficiarioDTO, userId?: string): Promise<Beneficiario>;
    update(id: string, data: UpdateBeneficiarioDTO, userId?: string): Promise<Beneficiario>;
    findByNome(nome: string, limit?: number): Promise<Pick<Beneficiario, 'id' | 'nome' | 'endereco' | 'telefone'>[]>;
    findActiveForSelection(): Promise<Pick<Beneficiario, 'id' | 'nome' | 'endereco' | 'telefone'>[]>;
    findTopBeneficiarios(limit?: number): Promise<(Beneficiario & {
        _count: {
            entregas: number;
        };
    })[]>;
    protected validateCreateData(data: CreateBeneficiarioDTO): Promise<void>;
    protected validateUpdateData(data: UpdateBeneficiarioDTO): Promise<void>;
    private transformBeneficiarioData;
    private isValidEmail;
    private isValidPhone;
}
//# sourceMappingURL=BeneficiarioService.d.ts.map