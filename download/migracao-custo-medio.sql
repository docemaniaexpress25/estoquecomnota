-- =============================================
-- MIGRAÇÃO: Novo modelo de custo médio por entrada
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Criar tabela de entradas (Entry)
CREATE TABLE IF NOT EXISTS "Entry" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cupomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- 2. Criar índice e FK para Entry
CREATE INDEX "Entry_productId_idx" ON "Entry"("productId");
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Adicionar coluna averageCost na tabela Movement
ALTER TABLE "Movement" ADD COLUMN IF NOT EXISTS "averageCost" DOUBLE PRECISION;

-- 4. Migrar dados existentes: criar entradas a partir de movimentações ENTRADA existentes
INSERT INTO "Entry" ("id", "productId", "quantity", "unitCost", "total", "cupomId", "createdAt")
SELECT
    "Movement"."id",
    "Movement"."productId",
    "Movement"."quantity",
    "Movement"."unitPrice",
    "Movement"."total",
    "Movement"."cupomId",
    "Movement"."createdAt"
FROM "Movement"
WHERE "Movement"."type" = 'ENTRADA'
AND NOT EXISTS (
    SELECT 1 FROM "Entry" WHERE "Entry"."id" = "Movement"."id"
);

-- 5. Calcular e preencher averageCost para movimentações SAIDA existentes
-- Para cada saída, calcula o custo médio das entradas do mesmo produto até aquela data
UPDATE "Movement"
SET "averageCost" = subq.avg_cost
FROM (
    SELECT
        m.id as movement_id,
        COALESCE(
            (SELECT SUM(e.total) / NULLIF(SUM(e.quantity), 0)
             FROM "Entry" e
             WHERE e."productId" = m."productId"
             AND e."createdAt" <= m."createdAt"),
            0
        ) as avg_cost
    FROM "Movement" m
    WHERE m."type" = 'SAIDA'
) subq
WHERE "Movement"."id" = subq.movement_id
AND "Movement"."averageCost" IS NULL;

-- 6. Remover colunas costPrice e salePrice do Product
ALTER TABLE "Product" DROP COLUMN IF EXISTS "costPrice";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "salePrice";

-- =============================================
-- PRONTO! A migração foi concluída.
-- =============================================
