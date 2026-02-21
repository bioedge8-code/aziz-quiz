import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const episode = await prisma.episode.findUnique({
    where: { id },
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

  if (!episode) {
    return NextResponse.json({ error: 'الحلقة غير موجودة' }, { status: 404 })
  }

  return NextResponse.json(episode)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // Handle episode completion
  if (body.status === 'completed') {
    const episode = await prisma.episode.findUnique({
      where: { id },
      include: { questions: true },
    })

    if (episode) {
      // Mark all questions as used
      const questionIds = episode.questions.map(eq => eq.question_id)
      await prisma.question.updateMany({
        where: { id: { in: questionIds } },
        data: { is_used: true },
      })

      // Mark won prizes as unavailable, return unawarded prizes to stock
      const wonQuestions = episode.questions.filter(eq => eq.status === 'answered_correct')
      const lostQuestions = episode.questions.filter(eq => eq.status !== 'answered_correct')

      if (wonQuestions.length > 0) {
        await prisma.prize.updateMany({
          where: { id: { in: wonQuestions.map(eq => eq.prize_id) } },
          data: { is_available: false },
        })
      }

      if (lostQuestions.length > 0) {
        await prisma.prize.updateMany({
          where: { id: { in: lostQuestions.map(eq => eq.prize_id) } },
          data: { is_available: true },
        })
      }
    }
  }

  const updated = await prisma.episode.update({
    where: { id },
    data: {
      title: body.title,
      status: body.status,
    },
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

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Return all prizes and questions used in this episode
  const episodeQuestions = await prisma.episodeQuestion.findMany({
    where: { episode_id: id },
    select: { prize_id: true, question_id: true },
  })
  const prizeIds = episodeQuestions.map(eq => eq.prize_id)
  const questionIds = episodeQuestions.map(eq => eq.question_id)
  if (prizeIds.length > 0) {
    await prisma.prize.updateMany({
      where: { id: { in: prizeIds } },
      data: { is_available: true },
    })
  }
  if (questionIds.length > 0) {
    await prisma.question.updateMany({
      where: { id: { in: questionIds } },
      data: { is_used: false },
    })
  }

  await prisma.episode.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
