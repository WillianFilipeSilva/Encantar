import { Item } from "@prisma/client";
import { BaseService } from "./BaseService";
import { ItemRepository } from "../repositories/ItemRepository";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";
export declare class ItemService extends BaseService<Item, CreateItemDTO, UpdateItemDTO> {
    private itemRepository;
    constructor(itemRepository: ItemRepository);
    protected validateCreateData(data: CreateItemDTO): void;
    protected validateUpdateData(data: UpdateItemDTO): void;
    protected transformData(data: CreateItemDTO, auditData: any): any;
    protected transformUpdateData(data: UpdateItemDTO, auditData: any): any;
    create(data: CreateItemDTO, userId: string): Promise<Item>;
    update(id: string, data: UpdateItemDTO, userId: string): Promise<Item>;
    findAllWithRelations(page?: number, limit?: number, filters?: any): Promise<{
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
            criadoPorId: string;
            descricao: string | null;
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
    findByIdWithRelations(id: string): Promise<{
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
                criadoPorId: string;
                observacoes: string | null;
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
        criadoPorId: string;
        descricao: string | null;
        modificadoPorId: string | null;
        unidade: string;
    }>;
    findByNome(nome: string, limit?: number): Promise<{
        id: string;
        nome: string;
        descricao: string | null;
        unidade: string;
    }[]>;
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
        criadoPorId: string;
        descricao: string | null;
        modificadoPorId: string | null;
        unidade: string;
    })[]>;
    findDistinctUnidades(): Promise<string[]>;
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
                criadoPorId: string;
                observacoes: string | null;
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
    delete(id: string, userId: string): Promise<void>;
    reactivate(id: string, userId: string): Promise<Item>;
}
//# sourceMappingURL=ItemService.d.ts.map