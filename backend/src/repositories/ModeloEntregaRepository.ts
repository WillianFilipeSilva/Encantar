import { PrismaClient, ModeloEntrega } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateModeloEntregaDTO, UpdateModeloEntregaDTO } from "../models/DTOs";

export class ModeloEntregaRepository extends BaseRepository<
  ModeloEntrega,
  CreateModeloEntregaDTO,
  UpdateModeloEntregaDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "modeloEntrega");
  }
}
