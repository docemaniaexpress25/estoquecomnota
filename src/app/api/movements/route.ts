import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, items, clientName } = body

    if (!type || !items || !items.length) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (type !== 'ENTRADA' && type !== 'SAIDA') {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const cupomId = randomUUID()
    const movements = []

    for (const item of items) {
      const product = await db.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        return NextResponse.json({ error: `Produto não encontrado: ${item.productId}` }, { status: 400 })
      }

      const quantity = parseInt(item.quantity)
      if (quantity <= 0) {
        return NextResponse.json({ error: `Quantidade inválida para ${product.name}` }, { status: 400 })
      }

      if (type === 'ENTRADA') {
        const unitCost = item.costPrice !== undefined && item.costPrice > 0
          ? parseFloat(item.costPrice) : 0

        const total = unitCost * quantity

        await db.entry.create({
          data: {
            productId: item.productId,
            quantity,
            unitCost,
            total,
            cupomId,
          },
        })

        const movement = await db.movement.create({
          data: {
            type,
            productId: item.productId,
            quantity,
            unitPrice: unitCost,
            total,
            cupomId,
            clientName: clientName || null,
          },
        })

        await db.product.update({
          where: { id: item.productId },
          data: { stock: product.stock + quantity },
        })

        movements.push({ ...movement, productName: product.name })

      } else {
        if (product.stock < quantity) {
          return NextResponse.json(
            { error: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}` },
            { status: 400 }
          )
        }

        const entries = await db.entry.findMany({
          where: { productId: item.productId },
        })

        let averageCost = 0
        if (entries.length > 0) {
          const totalEntryCost = entries.reduce((sum, e) => sum + e.total, 0)
          const totalEntryQty = entries.reduce((sum, e) => sum + e.quantity, 0)
          averageCost = totalEntryQty > 0 ? totalEntryCost / totalEntryQty : 0
        }

        const salePrice = item.salePrice !== undefined && item.salePrice > 0
          ? parseFloat(item.salePrice) : 0

        const total = salePrice * quantity

        const movement = await db.movement.create({
          data: {
            type,
            productId: item.productId,
            quantity,
            unitPrice: salePrice,
            averageCost,
            total,
            cupomId,
            clientName: clientName || null,
          },
        })

        await db.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - quantity },
        })

        movements.push({ ...movement, productName: product.name, averageCost })
      }
    }

    return NextResponse.json({ cupomId, type, clientName: clientName || null, movements }, { status: 201 })
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error)
    return NextResponse.json({ error: 'Erro ao registrar movimentação' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cupomId = searchParams.get('cupomId')

    if (!cupomId) {
      return NextResponse.json({ error: 'cupomId é obrigatório' }, { status: 400 })
    }

    const movements = await db.movement.findMany({
      where: { cupomId },
    })

    if (movements.length === 0) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 })
    }

    for (const m of movements) {
      const product = await db.product.findUnique({ where: { id: m.productId } })
      if (product) {
        const revertStock = m.type === 'ENTRADA'
          ? product.stock - m.quantity
          : product.stock + m.quantity

        await db.product.update({
          where: { id: m.productId },
          data: { stock: Math.max(0, revertStock) },
        })
      }
    }

    if (movements[0].type === 'ENTRADA') {
      await db.entry.deleteMany({ where: { cupomId } })
    }

    await db.movement.deleteMany({ where: { cupomId } })

    return NextResponse.json({ success: true, revertedItems: movements.length })
  } catch (error) {
    console.error('Erro ao excluir movimentação:', error)
    return NextResponse.json({ error: 'Erro ao excluir movimentação' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cupomId = searchParams.get('cupomId')
    const type = searchParams.get('type')

    const where: Record<string, string> = {}
    if (cupomId) where.cupomId = cupomId
    if (type) where.type = type

    const movements = await db.movement.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(movements)
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error)
    return NextResponse.json({ error: 'Erro ao buscar movimentações' }, { status: 500 })
  }
}
