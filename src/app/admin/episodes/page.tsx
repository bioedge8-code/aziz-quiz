'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Episode = {
  id: string
  title: string
  status: 'draft' | 'active' | 'completed'
  created_at: string
  questions: { id: string; status: string }[]
}

const statusLabels = { draft: 'مسودة', active: 'نشطة', completed: 'مكتملة' }
const statusColors = {
  draft: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-blue-500/20 text-blue-400',
}

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')

  const loadEpisodes = async () => {
    const res = await fetch('/api/episodes')
    const data = await res.json()
    setEpisodes(data)
    setLoading(false)
  }

  useEffect(() => { loadEpisodes() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/episodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const episode = await res.json()
    setTitle('')
    setShowForm(false)

    // Auto-generate questions
    await fetch(`/api/episodes/${episode.id}/generate`, { method: 'POST' })
    loadEpisodes()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return
    await fetch(`/api/episodes/${id}`, { method: 'DELETE' })
    loadEpisodes()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">الحلقات</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          + حلقة جديدة
        </button>
      </div>

      {/* Create Episode Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إنشاء حلقة جديدة</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الحلقة (مثال: الحلقة 1)"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
              />
              <p className="text-white/50 text-sm">سيتم اختيار 20 سؤال عشوائي وتعيين جوائز عشوائية تلقائياً</p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity">إنشاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episodes List */}
      {loading ? (
        <div className="text-center py-12 text-white/50">جاري التحميل...</div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-12 text-white/50">لا توجد حلقات</div>
      ) : (
        <div className="grid gap-4">
          {episodes.map((ep) => (
            <div key={ep.id} className="glass rounded-xl p-6 hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{ep.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={cn('px-3 py-1 rounded-full text-xs', statusColors[ep.status])}>
                      {statusLabels[ep.status]}
                    </span>
                    <span className="text-white/40 text-sm">{ep.questions.length} سؤال</span>
                    <span className="text-white/40 text-sm">
                      {new Date(ep.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/episodes/${ep.id}`}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    التحكم
                  </Link>
                  {ep.status === 'active' && (
                    <Link
                      href={`/play/${ep.id}`}
                      target="_blank"
                      className="px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                      شاشة العرض
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(ep.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
