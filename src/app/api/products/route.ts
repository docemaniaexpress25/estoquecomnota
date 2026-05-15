import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, costPrice, salePrice, stock } = body

    if (!name || costPrice === undefined || stock === undefined) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        costPrice: parseFloat(costPrice),
        salePrice: salePrice !== undefined ? parseFloat(salePrice) : 0,
        stock: parseInt(stock),
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, costPrice, salePrice, stock } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(salePrice !== undefined && { salePrice: parseFloat(salePrice) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
      },
    })

    return NextResponse.json(product)
  } catch {
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

    await db.movement.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 })
  }
}
