import { PrismaClient, Beneficiario } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO } from "../models/DTOs";
export declare class BeneficiarioRepository extends BaseRepository<Beneficiario, CreateBeneficiarioDTO, UpdateBeneficiarioDTO> {
    constructor(prisma: PrismaClient);
    findAllWithRelations(page?: number, limit?: number, where?: any): Promise<{
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
            observacoes: string | null;
            criadoPorId: string;
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
    findByIdWithRelations(id: string): Promise<({
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
        entregas: ({
            rota: {
                id: string;
                nome: string;
            };
            entregaItems: ({
                item: {
                    id: string;
                    nome: string;
                    ativo: boolean;
                    criadoEm: Date;
                    atualizadoEm: Date;
                    descricao: string | null;
                    criadoPorId: string;
                    modificadoPorId: string | null;
                    unidade: string;
                };
            } & {
                id: string;
                quantidade: import("@prisma/client/runtime/library").Decimal;
                entregaId: string;
                itemId: string;
            })[];
        } & {
            id: string;
            criadoEm: Date;
            atualizadoEm: Date;
            observacoes: string | null;
            criadoPorId: string;
            modificadoPorId: string | null;
            beneficiarioId: string;
            rotaId: string;
        })[];
    } & {
        id: string;
        nome: string;
        ativo: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        email: string | null;
        telefone: string | null;
        observacoes: string | null;
        criadoPorId: string;
        modificadoPorId: string | null;
        endereco: string;
    }) | null>;
    findByNome(nome: string, limit?: number): Promise<{
        id: string;
        nome: string;
        telefone: string | null;
        endereco: string;
    }[]>;
    existsByNomeAndEndereco(nome: string, endereco: string, excludeId?: string): Promise<boolean>;
    findActiveForSelection(): Promise<{
        id: string;
        nome: string;
        telefone: string | null;
        endereco: string;
    }[]>;
    countEntregasByBeneficiario(beneficiarioId: string): Promise<number>;
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
        observacoes: string | null;
        criadoPorId: string;
        modificadoPorId: string | null;
        endereco: string;
    })[]>;
}
//# sourceMappingURL=BeneficiarioRepository.d.ts.map