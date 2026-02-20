import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Difficulty, CorrectAnswer } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const difficulty = searchParams.get('difficulty')
  const is_used = searchParams.get('is_used')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (difficulty) where.difficulty = difficulty
  if (is_used !== null && is_used !== '') where.is_used = is_used === 'true'
  if (search) where.text = { contains: search, mode: 'insensitive' }

  const questions = await prisma.question.findMany({
    where,
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json(questions)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Support bulk import
  if (Array.isArray(body)) {
    const questions = await prisma.question.createMany({
      data: body.map((q: Record<string, unknown>) => ({
        text: q.text as string,
        option_a: q.option_a as string,
        option_b: q.option_b as string,
        option_c: q.option_c as string,
        option_d: q.option_d as string,
        correct_answer: q.correct_answer as CorrectAnswer,
        category: (q.category as string) || null,
        difficulty: ((q.difficulty as string) || 'easy') as Difficulty,
      })),
    })
    return NextResponse.json({ count: questions.count }, { status: 201 })
  }

  const question = await prisma.question.create({
    data: {
      text: body.text,
      option_a: body.option_a,
      option_b: body.option_b,
      option_c: body.option_c,
      option_d: body.option_d,
      correct_answer: body.correct_answer,
      category: body.category || null,
      difficulty: body.difficulty || 'easy',
    },
  })

  return NextResponse.json(question, { status: 201 })
}
