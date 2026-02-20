import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const episodes = await prisma.episode.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      questions: {
        include: {
          question: true,
          prize: true,
        },
        orderBy: { display_order: 'asc' },
      },
    },
  })
  return NextResponse.json(episodes)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const episode = await prisma.episode.create({
    data: {
      title: body.title,
      status: 'draft',
    },
  })

  return NextResponse.json(episode, { status: 201 })
}
