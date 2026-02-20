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

export default function EpisodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)

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
      body: JSON.stringify({ ...episode, status: newStatus }),
    })
    loadEpisode()
  }

  const regenerate = async () => {
    if (!confirm('سيتم إعادة اختيار الأسئلة والجوائز. هل أنت متأكد؟')) return
    const res = await fetch(`/api/episodes/${id}/generate`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'فشل في إعادة التوليد')
      return
    }
    loadEpisode()
  }

  if (loading) return <div className="text-center py-12 text-white/50">جاري التحميل...</div>
  if (!episode) return <div className="text-center py-12 text-white/50">الحلقة غير موجودة</div>

  const answeredCorrect = episode.questions.filter(q => q.status === 'answered_correct').length
  const answeredWrong = episode.questions.filter(q => q.status === 'answered_wrong').length

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
              <button onClick={regenerate} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors">
                إعادة التوليد
              </button>
              <button onClick={() => updateStatus('active')} className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg text-sm hover:opacity-90 transition-opacity">
                تفعيل الحلقة
              </button>
            </>
          )}
          {episode.status === 'active' && (
            <>
              <Link
                href={`/play/${id}`}
                target="_blank"
                className="px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                فتح شاشة العرض
              </Link>
              <button onClick={() => updateStatus('completed')} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg text-sm hover:opacity-90 transition-opacity">
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
          </div>
        ))}
      </div>
    </div>
  )
}
