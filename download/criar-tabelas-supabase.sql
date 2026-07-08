-- ============================================
-- SQL para criar as tabelas no Supabase
-- Execute isso no SQL Editor do Supabase
-- ============================================

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Tabela de Movimentações
CREATE TABLE IF NOT EXISTS "Movement" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cupomId" TEXT,
    "clientName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- Chave estrangeira (relacionamento)
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "Product"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Criar índice para buscar movimentações por cupomId
CREATE INDEX IF NOT EXISTS "Movement_cupomId_idx" ON "Movement"("cupomId");

-- Criar índice para buscar movimentações por tipo
CREATE INDEX IF NOT EXISTS "Movement_type_idx" ON "Movement"("type");
