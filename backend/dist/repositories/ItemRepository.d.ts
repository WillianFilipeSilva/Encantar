import { PrismaClient, Item } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";
export declare class ItemRepository extends BaseRepository<Item, CreateItemDTO, UpdateItemDTO> {
    constructor(prisma: PrismaClient);
    findAllWithRelations(page?: number, limit?: number, where?: any): Promise<{
        data: ({
            _count: {
                entregaItems: number;
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
            descricao: string | null;
            criadoPorId: string;
            modificadoPorId: string | null;
            unidade: string;
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
            entregaItems: number;
        };
        criadoPor: {
            id: string;
            nome: string;
        };
        modificadoPor: {
            id: string;
            nome: string;
        } | null;
        entregaItems: ({
            entrega: {
                beneficiario: {
                    id: string;
                    nome: string;
                };
            } & {
                id: string;
                criadoEm: Date;
                atualizadoEm: Date;
                observacoes: string | null;
                criadoPorId: string;
                modificadoPorId: string | null;
                beneficiarioId: string;
                rotaId: string;
            };
        } & {
            id: string;
            quantidade: import("@prisma/client/runtime/library").Decimal;
            entregaId: string;
            itemId: string;
        })[];
    } & {
        id: string;
        nome: string;
        ativo: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string | null;
        criadoPorId: string;
        modificadoPorId: string | null;
        unidade: string;
    }) | null>;
    findByNome(nome: string, limit?: number): Promise<{
        id: string;
        nome: string;
        descricao: string | null;
        unidade: string;
    }[]>;
    existsByNome(nome: string, excludeId?: string): Promise<boolean>;
    findActiveForSelection(): Promise<{
        id: string;
        nome: string;
        descricao: string | null;
        unidade: string;
    }[]>;
    findByUnidade(unidade: string): Promise<{
        id: string;
        nome: string;
        descricao: string | null;
        unidade: string;
    }[]>;
    findMostUsed(limit?: number): Promise<({
        _count: {
            entregaItems: number;
        };
    } & {
        id: string;
        nome: string;
        ativo: boolean;
        criadoEm: Date;
        atualizadoEm: Date;
        descricao: string | null;
        criadoPorId: string;
        modificadoPorId: string | null;
        unidade: string;
    })[]>;
    findDistinctUnidades(): Promise<string[]>;
    countTotalEntregasByItem(itemId: string): Promise<0 | import("@prisma/client/runtime/library").Decimal>;
    getItemStats(itemId: string): Promise<{
        totalEntregas: number;
        totalQuantidade: 0 | import("@prisma/client/runtime/library").Decimal;
        ultimasEntregas: ({
            entrega: {
                beneficiario: {
                    nome: string;
                };
            } & {
                id: string;
                criadoEm: Date;
                atualizadoEm: Date;
                observacoes: string | null;
                criadoPorId: string;
                modificadoPorId: string | null;
                beneficiarioId: string;
                rotaId: string;
            };
        } & {
            id: string;
            quantidade: import("@prisma/client/runtime/library").Decimal;
            entregaId: string;
            itemId: string;
        })[];
    }>;
}
//# sourceMappingURL=ItemRepository.d.ts.map