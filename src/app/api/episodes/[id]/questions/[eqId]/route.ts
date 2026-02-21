import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eqId: string }> }
) {
  const { eqId } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.status) updateData.status = body.status
  if (body.contestant_name !== undefined) updateData.contestant_name = body.contestant_name
  if (body.question_id) updateData.question_id = body.question_id
  if (body.prize_id) updateData.prize_id = body.prize_id

  // If answered wrong, return the prize to stock
  if (body.status === 'answered_wrong') {
    const eq = await prisma.episodeQuestion.findUnique({
      where: { id: eqId },
    })
    if (eq) {
      await prisma.prize.update({
        where: { id: eq.prize_id },
        data: { is_available: true },
      })
    }
  }

  // If answered correct, mark prize as unavailable
  if (body.status === 'answered_correct') {
    const eq = await prisma.episodeQuestion.findUnique({
      where: { id: eqId },
    })
    if (eq) {
      await prisma.prize.update({
        where: { id: eq.prize_id },
        data: { is_available: false },
      })
    }
  }

  const updated = await prisma.episodeQuestion.update({
    where: { id: eqId },
    data: updateData,
    include: {
      question: true,
      prize: true,
    },
  })

  return NextResponse.json(updated)
}
