import { Request, Response, NextFunction } from "express";
import { BeneficiarioService } from "../services/BeneficiarioService";
import { BaseController } from "./BaseController";
import { Beneficiario } from "@prisma/client";
import { CreateBeneficiarioDTO, UpdateBeneficiarioDTO } from "../models/DTOs";
export declare class BeneficiarioController extends BaseController<Beneficiario, CreateBeneficiarioDTO, UpdateBeneficiarioDTO> {
    private beneficiarioService;
    constructor(beneficiarioService: BeneficiarioService);
    findAll: (req: Request, res: Response, next: NextFunction) => void;
    findById: (req: Request, res: Response, next: NextFunction) => void;
    create: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
    delete: (req: Request, res: Response, next: NextFunction) => void;
    search: (req: Request, res: Response, next: NextFunction) => void;
    findActive: (req: Request, res: Response, next: NextFunction) => void;
    findTop: (req: Request, res: Response, next: NextFunction) => void;
    protected buildFilters(query: any): any;
}
//# sourceMappingURL=BeneficiarioController.d.ts.map