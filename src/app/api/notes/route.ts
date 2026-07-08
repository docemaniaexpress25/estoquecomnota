import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const notes = await db.note.findMany({
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
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
    const { title, content, color } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const validColors = ['zinc', 'emerald', 'red', 'amber', 'blue']
    const noteColor = validColors.includes(color) ? color : 'zinc'

    const note = await db.note.create({
      data: {
        title: title.trim(),
        content: content?.trim() || null,
        color: noteColor,
      },
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
    const { id, title, content, color, pinned } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) updateData.content = content?.trim() || null
    if (pinned !== undefined) updateData.pinned = pinned

    if (color !== undefined) {
      const validColors = ['zinc', 'emerald', 'red', 'amber', 'blue']
      if (validColors.includes(color)) {
        updateData.color = color
      }
    }

    const note = await db.note.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Erro ao atualizar nota:', error)
    return NextResponse.json({ error: 'Erro ao atualizar nota' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    await db.note.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar nota:', error)
    return NextResponse.json({ error: 'Erro ao deletar nota' }, { status: 500 })
  }
}
