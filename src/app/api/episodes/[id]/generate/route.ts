import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { shuffleArray } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Parse count from request body (default 15)
  let count = 15
  try {
    const body = await request.json()
    if (body.count && body.count >= 1 && body.count <= 50) {
      count = body.count
    }
  } catch {
    // No body or invalid JSON, use default
  }

  // Check episode exists
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: { questions: true },
  })

  if (!episode) {
    return NextResponse.json({ error: 'الحلقة غير موجودة' }, { status: 404 })
  }

  // Delete existing episode questions if regenerating, return questions & prizes
  if (episode.questions.length > 0) {
    const oldQuestionIds = episode.questions.map(eq => eq.question_id)
    const oldPrizeIds = episode.questions.map(eq => eq.prize_id)

    await prisma.episodeQuestion.deleteMany({
      where: { episode_id: id },
    })

    // Return old questions and prizes to available
    if (oldQuestionIds.length > 0) {
      await prisma.question.updateMany({
        where: { id: { in: oldQuestionIds } },
        data: { is_used: false },
      })
    }
    if (oldPrizeIds.length > 0) {
      await prisma.prize.updateMany({
        where: { id: { in: oldPrizeIds } },
        data: { is_available: true },
      })
    }
  }

  // Get random unused questions
  const availableQuestions = await prisma.question.findMany({
    where: { is_used: false },
  })

  if (availableQuestions.length < count) {
    return NextResponse.json(
      { error: `لا يوجد أسئلة كافية. المتاح: ${availableQuestions.length}، المطلوب: ${count}` },
      { status: 400 }
    )
  }

  // Get random available prizes
  const availablePrizes = await prisma.prize.findMany({
    where: { is_available: true },
  })

  if (availablePrizes.length < count) {
    return NextResponse.json(
      { error: `لا يوجد جوائز كافية. المتاح: ${availablePrizes.length}، المطلوب: ${count}` },
      { status: 400 }
    )
  }

  const selectedQuestions = shuffleArray(availableQuestions).slice(0, count)
  const selectedPrizes = shuffleArray(availablePrizes).slice(0, count)

  // Create episode questions with paired prizes
  const episodeQuestions = selectedQuestions.map((question, index) => ({
    episode_id: id,
    question_id: question.id,
    prize_id: selectedPrizes[index].id,
    display_order: index + 1,
    status: 'pending' as const,
  }))

  await prisma.episodeQuestion.createMany({
    data: episodeQuestions,
  })

  // Mark selected questions as used and prizes as unavailable
  await prisma.question.updateMany({
    where: { id: { in: selectedQuestions.map(q => q.id) } },
    data: { is_used: true },
  })
  await prisma.prize.updateMany({
    where: { id: { in: selectedPrizes.map(p => p.id) } },
    data: { is_available: false },
  })

  // Return updated episode
  const updated = await prisma.episode.findUnique({
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

  return NextResponse.json(updated)
}
