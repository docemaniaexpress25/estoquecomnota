import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const notas = await db.notaSaida.findMany({
      orderBy: { createdAt: 'desc' },
      include: { produto: { select: { nome: true } } }
    })
    return NextResponse.json(notas)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar notas de saída' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { produtoId, quantidade, dataNota, observacao } = body

    if (!produtoId || !quantidade || quantidade <= 0) {
      return NextResponse.json({ error: 'Produto e quantidade válida são obrigatórios' }, { status: 400 })
    }

    const produto = await db.produto.findUnique({ where: { id: produtoId } })
    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (produto.estoque < quantidade) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${produto.estoque}` },
        { status: 400 }
      )
    }

    await db.produto.update({
      where: { id: produtoId },
      data: { estoque: produto.estoque - quantidade }
    })

    const nota = await db.notaSaida.create({
      data: {
        produtoId,
        quantidade,
        precoUnit: produto.precoMedio,
        dataNota: dataNota || new Date().toISOString().split('T')[0],
        observacao: observacao || null,
      }
    })

    return NextResponse.json(nota, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar nota de saída' }, { status: 500 })
  }
}
