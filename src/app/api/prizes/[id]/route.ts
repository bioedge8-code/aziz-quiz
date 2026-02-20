import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const prize = await prisma.prize.update({
    where: { id },
    data: {
      name: body.name,
      image_url: body.image_url || null,
      value: body.value,
      is_available: body.is_available,
    },
  })

  return NextResponse.json(prize)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.prize.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
