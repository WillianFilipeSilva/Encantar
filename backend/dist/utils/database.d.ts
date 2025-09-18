import { PrismaClient } from "@prisma/client";
declare class DatabaseClient {
    private static instance;
    static getInstance(): PrismaClient;
    static connect(): Promise<void>;
    static disconnect(): Promise<void>;
    static transaction<T>(fn: (prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => Promise<T>): Promise<T>;
    static healthCheck(): Promise<boolean>;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default DatabaseClient;
//# sourceMappingURL=database.d.ts.map