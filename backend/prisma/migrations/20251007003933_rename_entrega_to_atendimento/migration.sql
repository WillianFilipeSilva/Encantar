/*
  Warnings:

  - You are about to drop the column `dataEntrega` on the `rotas` table. All the data in the column will be lost.
  - You are about to drop the `entrega_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `entregas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modelos_entrega` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modelos_entrega_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."entrega_items" DROP CONSTRAINT "entrega_items_entregaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."entrega_items" DROP CONSTRAINT "entrega_items_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."entregas" DROP CONSTRAINT "entregas_beneficiarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."entregas" DROP CONSTRAINT "entregas_criadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."entregas" DROP CONSTRAINT "entregas_modificadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."entregas" DROP CONSTRAINT "entregas_rotaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."modelos_entrega_items" DROP CONSTRAINT "modelos_entrega_items_itemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."modelos_entrega_items" DROP CONSTRAINT "modelos_entrega_items_modeloId_fkey";

-- AlterTable
ALTER TABLE "public"."rotas" DROP COLUMN "dataEntrega",
ADD COLUMN     "dataAtendimento" DATE;

-- DropTable
DROP TABLE "public"."entrega_items";

-- DropTable
DROP TABLE "public"."entregas";

-- DropTable
DROP TABLE "public"."modelos_entrega";

-- DropTable
DROP TABLE "public"."modelos_entrega_items";

-- CreateTable
CREATE TABLE "public"."atendimentos" (
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "beneficiarioId" TEXT NOT NULL,
    "rotaId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "modificadoPorId" TEXT,

    CONSTRAINT "atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."atendimento_items" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "atendimento_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."modelos_atendimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelos_atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."modelos_atendimento_items" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "modeloId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "modelos_atendimento_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "atendimento_items_atendimentoId_itemId_key" ON "public"."atendimento_items"("atendimentoId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_atendimento_nome_key" ON "public"."modelos_atendimento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_atendimento_items_modeloId_itemId_key" ON "public"."modelos_atendimento_items"("modeloId", "itemId");

-- AddForeignKey
ALTER TABLE "public"."atendimentos" ADD CONSTRAINT "atendimentos_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "public"."beneficiarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atendimentos" ADD CONSTRAINT "atendimentos_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "public"."rotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atendimentos" ADD CONSTRAINT "atendimentos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "public"."administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atendimentos" ADD CONSTRAINT "atendimentos_modificadoPorId_fkey" FOREIGN KEY ("modificadoPorId") REFERENCES "public"."administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atendimento_items" ADD CONSTRAINT "atendimento_items_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "public"."atendimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atendimento_items" ADD CONSTRAINT "atendimento_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modelos_atendimento_items" ADD CONSTRAINT "modelos_atendimento_items_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "public"."modelos_atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modelos_atendimento_items" ADD CONSTRAINT "modelos_atendimento_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
