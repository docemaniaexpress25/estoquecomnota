import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const notas = await db.notaEntrada.findMany({
      orderBy: { createdAt: 'desc' },
      include: { produto: { select: { nome: true } } }
    })
    return NextResponse.json(notas)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar notas de entrada' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { produtoId, quantidade, preco, dataNota, observacao } = body

    if (!produtoId || !quantidade || quantidade <= 0) {
      return NextResponse.json({ error: 'Produto e quantidade válida são obrigatórios' }, { status: 400 })
    }

    const produto = await db.produto.findUnique({ where: { id: produtoId } })
    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const novoEstoque = produto.estoque + quantidade
    const valorTotal = (produto.precoMedio * produto.estoque) + (preco * quantidade)
    const novoPrecoMedio = novoEstoque > 0 ? valorTotal / novoEstoque : preco

    await db.produto.update({
      where: { id: produtoId },
      data: { estoque: novoEstoque, precoMedio: novoPrecoMedio }
    })

    const nota = await db.notaEntrada.create({
      data: {
        produtoId,
        quantidade,
        preco,
        dataNota: dataNota || new Date().toISOString().split('T')[0],
        observacao: observacao || null,
      }
    })

    return NextResponse.json(nota, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar nota de entrada' }, { status: 500 })
  }
}
