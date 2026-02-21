import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // Only update fields that are provided
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.image_url !== undefined) data.image_url = body.image_url || null
  if (body.value !== undefined) data.value = body.value
  if (body.is_available !== undefined) data.is_available = body.is_available

  const prize = await prisma.prize.update({
    where: { id },
    data,
  })

  return NextResponse.json(prize)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Remove references in episode_questions first
  await prisma.episodeQuestion.deleteMany({ where: { prize_id: id } })
  await prisma.prize.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
