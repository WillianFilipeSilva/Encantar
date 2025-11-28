-- Add optional CPF column to beneficiarios and ensure uniqueness
ALTER TABLE "public"."beneficiarios"
ADD COLUMN "cpf" TEXT;

CREATE UNIQUE INDEX "beneficiarios_cpf_key" ON "public"."beneficiarios"("cpf");
