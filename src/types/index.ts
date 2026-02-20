export type { Question, Prize, Episode, EpisodeQuestion } from '@prisma/client'

export type EpisodeWithQuestions = {
  id: string
  title: string
  status: 'draft' | 'active' | 'completed'
  created_at: Date
  questions: (EpisodeQuestionWithDetails)[]
}

export type EpisodeQuestionWithDetails = {
  id: string
  episode_id: string
  question_id: string
  prize_id: string
  display_order: number
  status: 'pending' | 'revealed' | 'answered_correct' | 'answered_wrong'
  contestant_name: string | null
  question: {
    id: string
    text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: 'A' | 'B' | 'C' | 'D'
    category: string | null
    difficulty: 'easy' | 'medium' | 'hard'
  }
  prize: {
    id: string
    name: string
    image_url: string | null
    value: number | string
  }
}

export type GameState = 'board' | 'question' | 'answer_correct' | 'answer_wrong' | 'prize_reveal'
