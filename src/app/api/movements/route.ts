import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, items } = body // items: [{ productId, quantity }]

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

      if (type === 'SAIDA' && product.stock < quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}` },
          { status: 400 }
        )
      }

      const total = product.costPrice * quantity

      const movement = await db.movement.create({
        data: {
          type,
          productId: item.productId,
          quantity,
          unitPrice: product.costPrice,
          total,
          cupomId,
        },
      })

      // Atualizar estoque
      const newStock = type === 'ENTRADA' ? product.stock + quantity : product.stock - quantity
      await db.product.update({
        where: { id: item.productId },
        data: { stock: newStock },
      })

      movements.push({
        ...movement,
        productName: product.name,
      })
    }

    return NextResponse.json({ cupomId, type, movements }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar movimentação' }, { status: 500 })
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
      take: 100,
    })

    return NextResponse.json(movements)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar movimentações' }, { status: 500 })
  }
}
