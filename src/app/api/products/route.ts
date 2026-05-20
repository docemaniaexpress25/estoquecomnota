import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { name: 'asc' },
    })

    const productsWithAvgCost = await Promise.all(
      products.map(async (product) => {
        const entries = await db.entry.findMany({
          where: { productId: product.id },
        })
        let averageCost = 0
        if (entries.length > 0) {
          const totalCost = entries.reduce((sum, e) => sum + e.total, 0)
          const totalQty = entries.reduce((sum, e) => sum + e.quantity, 0)
          averageCost = totalQty > 0 ? totalCost / totalQty : 0
        }
        return { ...product, averageCost }
      })
    )

    return NextResponse.json(productsWithAvgCost)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
      },
    })

    return NextResponse.json({ ...product, averageCost: 0 }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, stock } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await db.entry.deleteMany({ where: { productId: id } })
    await db.movement.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 })
  }
}
