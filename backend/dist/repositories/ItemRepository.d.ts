import { PrismaClient, Item } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";
export declare class ItemRepository extends BaseRepository<Item, CreateItemDTO, UpdateItemDTO> {
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
    existsByNome(nome: string, excludeId?: string): Promise<boolean>;
    findActiveForSelection(): Promise<any>;
    findByUnidade(unidade: string): Promise<any>;
    findMostUsed(limit?: number): Promise<any>;
    findDistinctUnidades(): Promise<any>;
    countTotalEntregasByItem(itemId: string): Promise<any>;
    getItemStats(itemId: string): Promise<{
        totalEntregas: any;
        totalQuantidade: any;
        ultimasEntregas: any;
    }>;
}
//# sourceMappingURL=ItemRepository.d.ts.map