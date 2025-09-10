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
    findActiveForSelection(): Promise<any>;
    findByUnidade(unidade: string): Promise<any>;
    findMostUsed(limit?: number): Promise<any>;
    findDistinctUnidades(): Promise<any>;
    getItemStats(itemId: string): Promise<{
        totalEntregas: any;
        totalQuantidade: any;
        ultimasEntregas: any;
    }>;
    delete(id: string, userId: string): Promise<void>;
    reactivate(id: string, userId: string): Promise<Item>;
}
//# sourceMappingURL=ItemService.d.ts.map