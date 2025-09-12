import { PrismaClient, Rota } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CreateRotaDTO, UpdateRotaDTO } from "../models/DTOs";

export class RotaRepository extends BaseRepository<
  Rota,
  CreateRotaDTO,
  UpdateRotaDTO
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "rota");
  }
}
