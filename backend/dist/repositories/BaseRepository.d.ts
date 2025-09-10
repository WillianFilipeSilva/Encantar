import { PrismaClient } from "@prisma/client";
export declare abstract class BaseRepository<T, CreateData, UpdateData> {
    protected prisma: PrismaClient;
    protected modelName: string;
    constructor(prisma: PrismaClient, modelName: string);
    findAll(page?: number, limit?: number, where?: any): Promise<{
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
    findById(id: string): Promise<T | null>;
    create(data: CreateData): Promise<T>;
    update(id: string, data: UpdateData): Promise<T>;
    delete(id: string): Promise<T>;
    hardDelete(id: string): Promise<T>;
    findMany(where: any, orderBy?: any, include?: any): Promise<any>;
    findFirst(where: any, include?: any): Promise<any>;
    count(where?: any): Promise<number>;
    exists(where: any): Promise<boolean>;
    findByIdWithRelations(id: string, include: any): Promise<T | null>;
    findAllWithRelations(include: any, where?: any, orderBy?: any): Promise<any>;
}
//# sourceMappingURL=BaseRepository.d.ts.map