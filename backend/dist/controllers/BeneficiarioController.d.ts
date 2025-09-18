import { Request, Response, NextFunction } from "express";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BaseController } from "./BaseController";
import { Beneficiario } from "@prisma/client";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO } from "../models/DTOs";
export declare class BeneficiarioController extends BaseController<Beneficiario, CreateBeneficiarioDTO, UpdateBeneficiarioDTO> {
    private beneficiarioService;
    constructor(beneficiarioService: BeneficiarioService);
    findAll: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    search: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findActive: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    findTop: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    protected buildFilters(query: any): any;
}
//# sourceMappingURL=BeneficiarioController.d.ts.map