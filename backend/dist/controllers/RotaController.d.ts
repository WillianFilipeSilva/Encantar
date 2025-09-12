import { Rota } from "@prisma/client";
import { BaseController } from "./BaseController";
import { RotaService } from "../services/RotaService";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
export declare class RotaController extends BaseController<Rota, CreateRotaDTO, UpdateRotaDTO> {
    constructor(service: RotaService);
}
//# sourceMappingURL=RotaController.d.ts.map