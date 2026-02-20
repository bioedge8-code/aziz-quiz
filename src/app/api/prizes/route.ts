import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const prizes = await prisma.prize.findMany({
    orderBy: { created_at: 'desc' },
  })
  return NextResponse.json(prizes)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const prize = await prisma.prize.create({
    data: {
      name: body.name,
      image_url: body.image_url || null,
      value: body.value,
      is_available: body.is_available ?? true,
    },
  })

  return NextResponse.json(prize, { status: 201 })
}
