import { Request, Response, NextFunction } from "express";
import { BaseService } from "../services/BaseService";
export declare abstract class BaseController<T, CreateData, UpdateData> {
    protected service: BaseService<T, CreateData, UpdateData>;
    constructor(service: BaseService<T, CreateData, UpdateData>);
    findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    findById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    hardDelete(req: Request, res: Response, next: NextFunction): Promise<void>;
    count(req: Request, res: Response, next: NextFunction): Promise<void>;
    protected buildFilters(query: any): any;
    protected validatePermission(req: Request, operation: string): Promise<boolean>;
    protected successResponse(res: Response, data: any, message?: string, statusCode?: number): Response<any, Record<string, any>>;
    protected errorResponse(res: Response, error: string, code?: string, statusCode?: number): Response<any, Record<string, any>>;
}
//# sourceMappingURL=BaseController.d.ts.map