import { BaseRepository } from "../repositories/BaseRepository";
export declare abstract class BaseService<T, CreateData, UpdateData> {
    protected repository: BaseRepository<T, CreateData, UpdateData>;
    constructor(repository: BaseRepository<T, CreateData, UpdateData>);
    findAll(page?: number, limit?: number, filters?: any): Promise<{
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
    findById(id: string): Promise<T>;
    create(data: CreateData, userId?: string): Promise<T>;
    update(id: string, data: UpdateData, userId?: string): Promise<T>;
    delete(id: string): Promise<T>;
    hardDelete(id: string): Promise<T>;
    findByCriteria(criteria: any, include?: any): Promise<any>;
    count(criteria?: any): Promise<number>;
    exists(criteria: any): Promise<boolean>;
    protected validateCreateData(data: CreateData): Promise<void>;
    protected validateUpdateData(data: UpdateData): Promise<void>;
    protected addAuditData(data: any, userId?: string, operation?: "create" | "update"): any;
    protected transformData(data: T): any;
    protected transformListData(data: T[]): any[];
}
//# sourceMappingURL=BaseService.d.ts.map