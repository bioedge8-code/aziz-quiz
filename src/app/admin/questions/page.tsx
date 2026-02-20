'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

type Question = {
  id: string
  text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  is_used: boolean
}

const difficultyLabels = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' }
const difficultyColors = { easy: 'bg-green-500/20 text-green-400', medium: 'bg-yellow-500/20 text-yellow-400', hard: 'bg-red-500/20 text-red-400' }

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [filterUsed, setFilterUsed] = useState('')
  const [bulkText, setBulkText] = useState('')

  const [form, setForm] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    category: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
  })

  const loadQuestions = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterDifficulty) params.set('difficulty', filterDifficulty)
    if (filterUsed) params.set('is_used', filterUsed)

    const res = await fetch(`/api/questions?${params}`)
    const data = await res.json()
    setQuestions(data)
    setLoading(false)
  }, [search, filterDifficulty, filterUsed])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingId ? `/api/questions/${editingId}` : '/api/questions'
    const method = editingId ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setForm({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', category: '', difficulty: 'easy' })
    setEditingId(null)
    setShowForm(false)
    loadQuestions()
  }

  const handleEdit = (q: Question) => {
    setForm({
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      category: q.category || '',
      difficulty: q.difficulty,
    })
    setEditingId(q.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return
    await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    loadQuestions()
  }

  const handleBulkImport = async () => {
    try {
      const lines = bulkText.trim().split('\n').filter(l => l.trim())
      const questions = lines.map(line => {
        const parts = line.split('\t').length > 1 ? line.split('\t') : line.split('|')
        if (parts.length < 6) throw new Error('تنسيق غير صحيح')
        return {
          text: parts[0].trim(),
          option_a: parts[1].trim(),
          option_b: parts[2].trim(),
          option_c: parts[3].trim(),
          option_d: parts[4].trim(),
          correct_answer: parts[5].trim().toUpperCase(),
          category: parts[6]?.trim() || '',
          difficulty: parts[7]?.trim() || 'easy',
        }
      })

      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions),
      })

      setBulkText('')
      setShowBulk(false)
      loadQuestions()
    } catch {
      alert('خطأ في تنسيق البيانات. استخدم الفاصل | أو Tab بين الأعمدة')
    }
  }

  const totalQuestions = questions.length
  const usedQuestions = questions.filter(q => q.is_used).length
  const availableQuestions = totalQuestions - usedQuestions

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">بنك الأسئلة</h1>
          <div className="flex gap-4 mt-2 text-sm text-white/50">
            <span>الإجمالي: {totalQuestions}</span>
            <span>متاح: {availableQuestions}</span>
            <span>مستخدم: {usedQuestions}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulk(true)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            استيراد جماعي
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', category: '', difficulty: 'easy' }) }}
            className="px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            + إضافة سؤال
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50 text-sm"
        />
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50 text-sm"
        >
          <option value="">كل المستويات</option>
          <option value="easy">سهل</option>
          <option value="medium">متوسط</option>
          <option value="hard">صعب</option>
        </select>
        <select
          value={filterUsed}
          onChange={(e) => setFilterUsed(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50 text-sm"
        >
          <option value="">الكل</option>
          <option value="false">متاح</option>
          <option value="true">مستخدم</option>
        </select>
      </div>

      {/* Question Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="نص السؤال"
                required
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50 resize-none"
              />

              <div className="grid grid-cols-2 gap-4">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <div key={opt} className="relative">
                    <span className={cn(
                      'absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      form.correct_answer === opt ? 'bg-correct text-black' : 'bg-white/20'
                    )}>
                      {opt}
                    </span>
                    <input
                      value={form[`option_${opt.toLowerCase()}` as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [`option_${opt.toLowerCase()}`]: e.target.value })}
                      placeholder={`الخيار ${opt}`}
                      required
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <select
                  value={form.correct_answer}
                  onChange={(e) => setForm({ ...form, correct_answer: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50"
                >
                  <option value="A">الإجابة: A</option>
                  <option value="B">الإجابة: B</option>
                  <option value="C">الإجابة: C</option>
                  <option value="D">الإجابة: D</option>
                </select>

                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="التصنيف (اختياري)"
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
                />

                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold/50"
                >
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null) }}
                  className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingId ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">استيراد جماعي</h2>
            <p className="text-white/50 text-sm mb-4">
              أدخل كل سؤال في سطر جديد. استخدم | أو Tab للفصل بين الأعمدة:
              <br />
              نص السؤال | خيار A | خيار B | خيار C | خيار D | الإجابة | التصنيف | المستوى
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              placeholder="ما هي عاصمة السعودية؟|الرياض|جدة|مكة|المدينة|A|جغرافيا|easy"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50 resize-none font-mono text-sm"
              dir="rtl"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setShowBulk(false)}
                className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleBulkImport}
                className="px-6 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                استيراد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Table */}
      {loading ? (
        <div className="text-center py-12 text-white/50">جاري التحميل...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-white/50">لا توجد أسئلة</div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right px-4 py-3 text-sm text-white/50">السؤال</th>
                <th className="text-center px-4 py-3 text-sm text-white/50">الإجابة</th>
                <th className="text-center px-4 py-3 text-sm text-white/50">المستوى</th>
                <th className="text-center px-4 py-3 text-sm text-white/50">التصنيف</th>
                <th className="text-center px-4 py-3 text-sm text-white/50">الحالة</th>
                <th className="text-center px-4 py-3 text-sm text-white/50">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm max-w-md truncate">{q.text}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-correct/20 text-correct rounded text-xs font-bold">{q.correct_answer}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2 py-1 rounded text-xs', difficultyColors[q.difficulty])}>
                      {difficultyLabels[q.difficulty]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-white/50">{q.category || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('px-2 py-1 rounded text-xs', q.is_used ? 'bg-white/10 text-white/40' : 'bg-blue-500/20 text-blue-400')}>
                      {q.is_used ? 'مستخدم' : 'متاح'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => handleEdit(q)} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors">
                        تعديل
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
