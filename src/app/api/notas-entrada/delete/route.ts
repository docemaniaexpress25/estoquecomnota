import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Envie ao menos um ID para excluir.' }, { status: 400 })
    }

    const results = []

    for (const notaId of ids) {
      const nota = await db.notaEntrada.findUnique({
        where: { id: notaId },
        include: { produto: true },
      })

      if (!nota) {
        results.push({ id: notaId, status: 'not_found' })
        continue
      }

      const produto = nota.produto
      const novaQtd = Math.max(0, produto.estoque - nota.quantidade)

      // Recalcular preço médio revertendo a entrada
      // A entrada tinha: novoPrecoMedio = (estoque * precoMedio + qty * preco) / (estoque + qty)
      // Para reverter: antigoPrecoMedio = (novoPrecoMedio * novoEstoque - qty * preco) / antigoEstoque
      let novoPrecoMedio = produto.precoMedio
      if (produto.estoque > 0) {
        const valorTotalAtual = produto.precoMedio * produto.estoque
        const valorTotalAntes = valorTotalAtual - (nota.quantidade * nota.preco)
        novoPrecoMedio = novaQtd > 0 ? valorTotalAntes / novaQtd : 0
      }

      await db.produto.update({
        where: { id: produto.id },
        data: { estoque: novaQtd, precoMedio: Math.max(0, novoPrecoMedio) },
      })

      await db.notaEntrada.delete({ where: { id: notaId } })
      results.push({ id: notaId, status: 'deleted', produto: produto.nome })
    }

    const deleted = results.filter(r => r.status === 'deleted').length
    return NextResponse.json({ message: `${deleted} entrada(s) excluida(s) com sucesso.`, deleted }, { status: 200 })
  } catch (error) {
    console.error('ERRO EXCLUIR ENTRADA:', error)
    return NextResponse.json({ error: 'Erro ao excluir entradas.' }, { status: 500 })
  }
}
