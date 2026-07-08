import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const notes = await db.note.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 1,
    })
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Erro ao buscar notas:', error)
    return NextResponse.json({ error: 'Erro ao buscar notas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Conteudo e obrigatorio' }, { status: 400 })
    }

    const note = await db.note.create({
      data: { content: content.trim() },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar nota:', error)
    return NextResponse.json({ error: 'Erro ao criar nota' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, content } = body

    if (!id || !content) {
      return NextResponse.json({ error: 'ID e conteudo sao obrigatorios' }, { status: 400 })
    }

    const note = await db.note.update({
      where: { id },
      data: { content: content.trim() },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Erro ao atualizar nota:', error)
    return NextResponse.json({ error: 'Erro ao atualizar nota' }, { status: 500 })
  }
}