import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, dataNota, referencia, observacao } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Envie ao menos um item para registrar.' }, { status: 400 })
    }

    // First pass: validate all items
    for (const item of items) {
      if (!item.produtoId || !item.quantidade || item.quantidade <= 0) {
        return NextResponse.json({ error: 'Cada item deve ter produtoId e quantidade válida.' }, { status: 400 })
      }
      const produto = await db.produto.findUnique({ where: { id: item.produtoId } })
      if (!produto) {
        return NextResponse.json({ error: `Produto não encontrado.` }, { status: 404 })
      }
      if (produto.estoque < Number(item.quantidade)) {
        return NextResponse.json(
          { error: `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}` },
          { status: 400 }
        )
      }
    }

    // Second pass: process all
    const results = []
    const data = dataNota || new Date().toISOString().split('T')[0]

    for (const item of items) {
      const produto = await db.produto.findUnique({ where: { id: item.produtoId } })
      if (!produto) continue

      const qty = Number(item.quantidade)

      await db.produto.update({
        where: { id: item.produtoId },
        data: { estoque: produto.estoque - qty }
      })

      const nota = await db.notaSaida.create({
        data: {
          produtoId: item.produtoId,
          quantidade: qty,
          precoUnit: produto.precoMedio,
          dataNota: data,
          referencia: referencia || null,
          observacao: item.observacao || observacao || null,
        }
      })

      results.push(nota)
    }

    return NextResponse.json({ message: `${results.length} saída(s) registrada(s) com sucesso.`, count: results.length }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar saídas em lote.' }, { status: 500 })
  }
}
