import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const produtos = await db.produto.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entradas: true, saidas: true }
        }
      }
    })
    return NextResponse.json(produtos)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, estoque, precoMedio } = body

    if (!nome || nome.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const produto = await db.produto.create({
      data: {
        nome: nome.trim(),
        estoque: estoque ?? 0,
        precoMedio: precoMedio ?? 0,
      }
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, nome, estoque, precoMedio } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const produto = await db.produto.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(estoque !== undefined && { estoque }),
        ...(precoMedio !== undefined && { precoMedio }),
      }
    })

    return NextResponse.json(produto)
  } catch (error) {
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

    await db.notaEntrada.deleteMany({ where: { produtoId: id } })
    await db.notaSaida.deleteMany({ where: { produtoId: id } })
    await db.produto.delete({ where: { id } })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 })
  }
}
