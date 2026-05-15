import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, dataNota, referencia, observacao } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Envie ao menos um item para registrar.' }, { status: 400 })
    }

    for (const item of items) {
      if (!item.produtoId || !item.quantidade || item.quantidade <= 0) {
        return NextResponse.json({ error: 'Cada item deve ter produtoId e quantidade válida.' }, { status: 400 })
      }
      if (isNaN(Number(item.preco)) || Number(item.preco) < 0) {
        return NextResponse.json({ error: 'Cada item deve ter um preço unitário válido.' }, { status: 400 })
      }
    }

    const results = []
    const data = dataNota || new Date().toISOString().split('T')[0]

    for (const item of items) {
      const produto = await db.produto.findUnique({ where: { id: item.produtoId } })
      if (!produto) {
        return NextResponse.json({ error: `Produto "${item.produtoId}" não encontrado.` }, { status: 404 })
      }

      const qty = Number(item.quantidade)
      const preco = Number(item.preco)
      const novoEstoque = produto.estoque + qty
      const valorTotal = (produto.precoMedio * produto.estoque) + (preco * qty)
      const novoPrecoMedio = novoEstoque > 0 ? valorTotal / novoEstoque : preco

      await db.produto.update({
        where: { id: item.produtoId },
        data: { estoque: novoEstoque, precoMedio: novoPrecoMedio }
      })

      const nota = await db.notaEntrada.create({
        data: {
          produtoId: item.produtoId,
          quantidade: qty,
          preco,
          dataNota: data,
          observacao: [referencia, item.observacao, observacao].filter(Boolean).join(' | ') || null,
        }
      })

      results.push(nota)
    }

    return NextResponse.json({ message: `${results.length} entrada(s) registrada(s) com sucesso.`, count: results.length }, { status: 201 })
  } catch (error) {
    console.error('ERRO ENTRADA BATCH:', error)
    return NextResponse.json({ error: 'Erro ao registrar entradas em lote.', detail: String(error) }, { status: 500 })
  }
}
