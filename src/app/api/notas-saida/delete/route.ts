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
      const nota = await db.notaSaida.findUnique({
        where: { id: notaId },
        include: { produto: true },
      })

      if (!nota) {
        results.push({ id: notaId, status: 'not_found' })
        continue
      }

      const produto = nota.produto

      await db.produto.update({
        where: { id: produto.id },
        data: { estoque: produto.estoque + nota.quantidade },
      })

      await db.notaSaida.delete({ where: { id: notaId } })
      results.push({ id: notaId, status: 'deleted', produto: produto.nome })
    }

    const deleted = results.filter(r => r.status === 'deleted').length
    return NextResponse.json({ message: `${deleted} saida(s) excluida(s) com sucesso.`, deleted }, { status: 200 })
  } catch (error) {
    console.error('ERRO EXCLUIR SAIDA:', error)
    return NextResponse.json({ error: 'Erro ao excluir saidas.' }, { status: 500 })
  }
}
