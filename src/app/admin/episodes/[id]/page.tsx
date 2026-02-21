'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type EpisodeQuestion = {
  id: string
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
    correct_answer: string
    difficulty: string
    category: string | null
  }
  prize: {
    id: string
    name: string
    value: string
    image_url: string | null
  }
}

type Episode = {
  id: string
  title: string
  status: 'draft' | 'active' | 'completed'
  questions: EpisodeQuestion[]
}

type Question = {
  id: string
  text: string
  correct_answer: string
  category: string | null
  difficulty: string
}

type Prize = {
  id: string
  name: string
  value: string
  is_available: boolean
  image_url: string | null
}

const statusColors = {
  pending: 'bg-white/10 text-white/50',
  revealed: 'bg-yellow-500/20 text-yellow-400',
  answered_correct: 'bg-green-500/20 text-green-400',
  answered_wrong: 'bg-red-500/20 text-red-400',
}

const statusLabels = {
  pending: 'في الانتظار',
  revealed: 'تم الكشف',
  answered_correct: 'إجابة صحيحة',
  answered_wrong: 'إجابة خاطئة',
}

const btnBase = 'transition-all duration-150 active:scale-90'

export default function EpisodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)

  // Swap modal state
  const [swapModal, setSwapModal] = useState<{ type: 'question' | 'prize'; eqId: string; currentId: string } | null>(null)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [allPrizes, setAllPrizes] = useState<Prize[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [swapLoading, setSwapLoading] = useState(false)

  const loadEpisode = async () => {
    const res = await fetch(`/api/episodes/${id}`)
    const data = await res.json()
    setEpisode(data)
    setLoading(false)
  }

  useEffect(() => { loadEpisode() }, [id])

  const updateStatus = async (newStatus: string) => {
    await fetch(`/api/episodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: episode?.title, status: newStatus }),
    })
    loadEpisode()
  }

  const regenerate = async () => {
    const countStr = prompt('كم عدد الأسئلة؟', String(episode?.questions.length || 15))
    if (!countStr) return
    const count = parseInt(countStr)
    if (isNaN(count) || count < 1) return

    const res = await fetch(`/api/episodes/${id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'فشل في إعادة التوليد')
      return
    }
    loadEpisode()
  }

  const openSwapQuestion = async (eqId: string, currentQuestionId: string) => {
    setSwapModal({ type: 'question', eqId, currentId: currentQuestionId })
    setSearchTerm('')
    const res = await fetch('/api/questions')
    const data = await res.json()
    setAllQuestions(data)
  }

  const openSwapPrize = async (eqId: string, currentPrizeId: string) => {
    setSwapModal({ type: 'prize', eqId, currentId: currentPrizeId })
    setSearchTerm('')
    const res = await fetch('/api/prizes')
    const data = await res.json()
    setAllPrizes(data)
  }

  const swapQuestion = async (newQuestionId: string) => {
    if (!swapModal) return
    setSwapLoading(true)
    await fetch(`/api/episodes/${id}/questions/${swapModal.eqId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: newQuestionId }),
    })
    setSwapLoading(false)
    setSwapModal(null)
    loadEpisode()
  }

  const swapPrize = async (newPrizeId: string) => {
    if (!swapModal) return
    setSwapLoading(true)
    await fetch(`/api/episodes/${id}/questions/${swapModal.eqId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prize_id: newPrizeId }),
    })
    setSwapLoading(false)
    setSwapModal(null)
    loadEpisode()
  }

  if (loading) return <div className="text-center py-12 text-white/50">جاري التحميل...</div>
  if (!episode) return <div className="text-center py-12 text-white/50">الحلقة غير موجودة</div>

  const answeredCorrect = episode.questions.filter(q => q.status === 'answered_correct').length
  const answeredWrong = episode.questions.filter(q => q.status === 'answered_wrong').length

  // Get IDs already used in this episode
  const usedQuestionIds = new Set(episode.questions.map(eq => eq.question.id))
  const usedPrizeIds = new Set(episode.questions.map(eq => eq.prize.id))

  // Filter for swap modal
  const filteredQuestions = allQuestions.filter(q =>
    !usedQuestionIds.has(q.id) &&
    (searchTerm === '' || q.text.includes(searchTerm) || (q.category || '').includes(searchTerm))
  )

  const filteredPrizes = allPrizes.filter(p =>
    !usedPrizeIds.has(p.id) &&
    (searchTerm === '' || p.name.includes(searchTerm))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{episode.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-white/50">
            <span>أسئلة: {episode.questions.length}</span>
            <span className="text-correct">صحيحة: {answeredCorrect}</span>
            <span className="text-wrong">خاطئة: {answeredWrong}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {episode.status === 'draft' && (
            <>
              <button onClick={regenerate} className={cn(btnBase, 'px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm hover:bg-white/20')}>
                إعادة التوليد
              </button>
              <button onClick={() => updateStatus('active')} className={cn(btnBase, 'px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg text-sm hover:opacity-90')}>
                تفعيل الحلقة
              </button>
            </>
          )}
          {episode.status === 'active' && (
            <>
              <Link
                href={`/play/${id}`}
                target="_blank"
                className={cn(btnBase, 'px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg text-sm hover:opacity-90')}
              >
                فتح شاشة العرض
              </Link>
              <button onClick={() => updateStatus('completed')} className={cn(btnBase, 'px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg text-sm hover:opacity-90')}>
                إنهاء الحلقة
              </button>
            </>
          )}
          {episode.status === 'completed' && (
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">مكتملة</span>
          )}
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-4 gap-4">
        {episode.questions.map((eq) => (
          <div key={eq.id} className={cn('glass rounded-xl p-4 transition-all', statusColors[eq.status])}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-gold">{eq.display_order}</span>
              <span className="text-xs px-2 py-1 rounded bg-black/20">
                {statusLabels[eq.status]}
              </span>
            </div>
            <p className="text-sm line-clamp-2 mb-2">{eq.question.text}</p>
            <div className="text-xs text-white/40 space-y-1">
              <p>الإجابة: {eq.question.correct_answer}</p>
              <p className="text-gold">الجائزة: {eq.prize.name}</p>
              {parseFloat(eq.prize.value) > 0 && <p>{parseFloat(eq.prize.value).toLocaleString('ar-SA')} ريال</p>}
              {eq.contestant_name && <p>المتسابق: {eq.contestant_name}</p>}
            </div>
            {/* Swap buttons */}
            {eq.status === 'pending' && (
              <div className="flex gap-1.5 mt-3 border-t border-white/10 pt-3">
                <button
                  onClick={() => openSwapQuestion(eq.id, eq.question.id)}
                  className={cn(btnBase, 'flex-1 px-2 py-1.5 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30')}
                >
                  تغيير السؤال
                </button>
                <button
                  onClick={() => openSwapPrize(eq.id, eq.prize.id)}
                  className={cn(btnBase, 'flex-1 px-2 py-1.5 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30')}
                >
                  تغيير الجائزة
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Swap Modal */}
      {swapModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSwapModal(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {swapModal.type === 'question' ? 'اختر سؤال بديل' : 'اختر جائزة بديلة'}
              </h2>
              <button onClick={() => setSwapModal(null)} className={cn(btnBase, 'text-white/40 hover:text-white text-2xl')}>✕</button>
            </div>

            {/* Search */}
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={swapModal.type === 'question' ? 'ابحث بالنص أو التصنيف...' : 'ابحث باسم الجائزة...'}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50 mb-4"
              autoFocus
            />

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {swapModal.type === 'question' ? (
                filteredQuestions.length === 0 ? (
                  <p className="text-center text-white/40 py-8">لا توجد أسئلة متاحة</p>
                ) : (
                  filteredQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => swapQuestion(q.id)}
                      disabled={swapLoading}
                      className={cn(
                        btnBase,
                        'w-full text-right p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all',
                        swapLoading && 'opacity-50'
                      )}
                    >
                      <p className="text-sm font-medium mb-1">{q.text}</p>
                      <div className="flex gap-3 text-xs text-white/40">
                        <span>الإجابة: {q.correct_answer}</span>
                        {q.category && <span className="text-gold/60">{q.category}</span>}
                        <span className={cn(
                          q.difficulty === 'easy' ? 'text-green-400' : q.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                        </span>
                      </div>
                    </button>
                  ))
                )
              ) : (
                filteredPrizes.length === 0 ? (
                  <p className="text-center text-white/40 py-8">لا توجد جوائز متاحة</p>
                ) : (
                  filteredPrizes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => swapPrize(p.id)}
                      disabled={swapLoading}
                      className={cn(
                        btnBase,
                        'w-full text-right p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/30 transition-all flex items-center gap-4',
                        swapLoading && 'opacity-50'
                      )}
                    >
                      {p.image_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <div className="flex gap-3 text-xs text-white/40 mt-1">
                          {parseFloat(p.value) > 0 && (
                            <span className="text-gold">{parseFloat(p.value).toLocaleString('ar-SA')} ريال</span>
                          )}
                          <span className={p.is_available ? 'text-green-400' : 'text-red-400'}>
                            {p.is_available ? 'متاح' : 'غير متاح'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
