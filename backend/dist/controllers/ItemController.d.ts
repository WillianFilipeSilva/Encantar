import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { ItemService } from "../services/ItemService";
import { CreateItemDTO, UpdateItemDTO } from "../models/DTOs";
import { Item } from "@prisma/client";
export declare class ItemController extends BaseController<Item, CreateItemDTO, UpdateItemDTO> {
    private itemService;
    constructor(itemService: ItemService);
    private validateCreate;
    private validateUpdate;
    private validateSearch;
    private validateId;
    private validateSearchByName;
    private validateSearchByUnidade;
    private validateLimit;
    findAll: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findAllWithRelations: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findByIdWithRelations: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findByNome: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findActiveForSelection: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findByUnidade: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findMostUsed: (req: Request, res: Response, next: import("express").NextFunction) => void;
    findDistinctUnidades: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getItemStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    reactivate: (req: Request, res: Response, next: import("express").NextFunction) => void;
    create: (req: Request, res: Response, next: import("express").NextFunction) => void;
    update: (req: Request, res: Response, next: import("express").NextFunction) => void;
    delete: (req: Request, res: Response, next: import("express").NextFunction) => void;
    private buildFilters;
    getValidations(): {
        validateCreate: import("express-validator").ValidationChain[];
        validateUpdate: import("express-validator").ValidationChain[];
        validateSearch: import("express-validator").ValidationChain[];
        validateId: import("express-validator").ValidationChain[];
        validateSearchByName: import("express-validator").ValidationChain[];
        validateSearchByUnidade: import("express-validator").ValidationChain[];
        validateLimit: import("express-validator").ValidationChain[];
    };
}
//# sourceMappingURL=ItemController.d.ts.map