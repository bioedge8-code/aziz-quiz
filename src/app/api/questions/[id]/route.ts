import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const question = await prisma.question.update({
    where: { id },
    data: {
      text: body.text,
      option_a: body.option_a,
      option_b: body.option_b,
      option_c: body.option_c,
      option_d: body.option_d,
      correct_answer: body.correct_answer,
      category: body.category || null,
      difficulty: body.difficulty || 'easy',
      is_used: body.is_used,
    },
  })

  return NextResponse.json(question)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.question.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
