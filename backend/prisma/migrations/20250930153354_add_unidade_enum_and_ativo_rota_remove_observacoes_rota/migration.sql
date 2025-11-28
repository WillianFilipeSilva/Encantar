/*
  Warnings:

  - The `unidade` column on the `items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `observacoes` on the `rotas` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UnidadeItem" AS ENUM ('KG', 'G', 'L', 'ML', 'UN', 'CX', 'PCT', 'LATA');

-- AlterTable
ALTER TABLE "public"."items" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "unidade",
ADD COLUMN     "unidade" "public"."UnidadeItem" NOT NULL DEFAULT 'UN';

-- AlterTable
ALTER TABLE "public"."rotas" DROP COLUMN "observacoes",
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;
