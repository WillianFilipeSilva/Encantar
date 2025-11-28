/*
  Warnings:

  - The `status` column on the `atendimentos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."StatusAtendimento" AS ENUM ('PENDENTE', 'CONCLUIDO', 'CANCELADO');

-- AlterTable
ALTER TABLE "public"."atendimentos" DROP COLUMN "status",
ADD COLUMN     "status" "public"."StatusAtendimento" NOT NULL DEFAULT 'PENDENTE';
