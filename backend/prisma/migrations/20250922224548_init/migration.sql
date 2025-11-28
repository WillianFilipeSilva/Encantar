-- CreateTable
CREATE TABLE "public"."administradores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."convites" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "token" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "usadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoPorId" TEXT NOT NULL,

    CONSTRAINT "convites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."beneficiarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "modificadoPorId" TEXT,

    CONSTRAINT "beneficiarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."items" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "unidade" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "modificadoPorId" TEXT,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entregas" (
    "id" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "beneficiarioId" TEXT NOT NULL,
    "rotaId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "modificadoPorId" TEXT,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entrega_items" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "entregaId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "entrega_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rotas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dataEntrega" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "modificadoPorId" TEXT,

    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."templates_pdf" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "conteudo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pdf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."modelos_entrega" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelos_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."modelos_entrega_items" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "modeloId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "modelos_entrega_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "administradores_login_key" ON "public"."administradores"("login");

-- CreateIndex
CREATE UNIQUE INDEX "convites_token_key" ON "public"."convites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "entrega_items_entregaId_itemId_key" ON "public"."entrega_items"("entregaId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_entrega_nome_key" ON "public"."modelos_entrega"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_entrega_items_modeloId_itemId_key" ON "public"."modelos_entrega_items"("modeloId", "itemId");

-- AddForeignKey
ALTER TABLE "public"."convites" ADD CONSTRAINT "convites_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "public"."administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiarios" ADD CONSTRAINT "beneficiarios_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "public"."administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiarios" ADD CONSTRAINT "beneficiarios_modificadoPorId_fkey" FOREIGN KEY ("modificadoPorId") REFERENCES "public"."administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."items" ADD CONSTRAINT "items_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "public"."administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."items" ADD CONSTRAINT "items_modificadoPorId_fkey" FOREIGN KEY ("modificadoPorId") REFERENCES "public"."administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entregas" ADD CONSTRAINT "entregas_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "public"."beneficiarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entregas" ADD CONSTRAINT "entregas_rotaId_fkey" FOREIGN KEY ("rotaId") REFERENCES "public"."rotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entregas" ADD CONSTRAINT "entregas_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "public"."administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entregas" ADD CONSTRAINT "entregas_modificadoPorId_fkey" FOREIGN KEY ("modificadoPorId") REFERENCES "public"."administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entrega_items" ADD CONSTRAINT "entrega_items_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "public"."entregas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."entrega_items" ADD CONSTRAINT "entrega_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rotas" ADD CONSTRAINT "rotas_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "public"."administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rotas" ADD CONSTRAINT "rotas_modificadoPorId_fkey" FOREIGN KEY ("modificadoPorId") REFERENCES "public"."administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modelos_entrega_items" ADD CONSTRAINT "modelos_entrega_items_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "public"."modelos_entrega"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modelos_entrega_items" ADD CONSTRAINT "modelos_entrega_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
