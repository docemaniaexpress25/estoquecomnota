import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const calculateAvg = searchParams.get('avg')

    if (!productId) {
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 })
    }

    if (calculateAvg === 'true') {
      const entries = await db.entry.findMany({
        where: { productId },
      })

      let averageCost = 0
      if (entries.length > 0) {
        const totalCost = entries.reduce((sum, e) => sum + e.total, 0)
        const totalQty = entries.reduce((sum, e) => sum + e.quantity, 0)
        averageCost = totalQty > 0 ? totalCost / totalQty : 0
      }

      return NextResponse.json({ averageCost, totalEntries: entries.length })
    }

    const entries = await db.entry.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Erro ao buscar entradas:', error)
    return NextResponse.json({ error: 'Erro ao buscar entradas' }, { status: 500 })
  }
}
