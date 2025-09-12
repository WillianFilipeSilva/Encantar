import { Rota } from "@prisma/client";
import { BaseController } from "./BaseController";
import { RotaService } from "../services/RotaService";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";
import { asyncHandler } from "../middleware/errorHandler";
import { body, param, validationResult } from "express-validator";
import { Request, Response } from "express";

export class RotaController extends BaseController<
  Rota,
  CreateRotaDTO,
  UpdateRotaDTO
> {
  constructor(service: RotaService) {
    super(service);
  }
}
