'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type Prize = {
  id: string
  name: string
  image_url: string | null
  value: string
  is_available: boolean
}

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', image_url: '', value: '', is_available: true })
  const [uploading, setUploading] = useState(false)

  const loadPrizes = async () => {
    const res = await fetch('/api/prizes')
    const data = await res.json()
    setPrizes(data)
    setLoading(false)
  }

  useEffect(() => { loadPrizes() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingId ? `/api/prizes/${editingId}` : '/api/prizes'
    const method = editingId ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: form.value ? parseFloat(form.value) : 0 }),
    })

    setForm({ name: '', image_url: '', value: '', is_available: true })
    setEditingId(null)
    setShowForm(false)
    loadPrizes()
  }

  const handleEdit = (p: Prize) => {
    setForm({ name: p.name, image_url: p.image_url || '', value: p.value.toString(), is_available: p.is_available })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الجائزة؟')) return
    await fetch(`/api/prizes/${id}`, { method: 'DELETE' })
    loadPrizes()
  }

  const toggleAvailability = async (prize: Prize) => {
    await fetch(`/api/prizes/${prize.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prize, is_available: !prize.is_available }),
    })
    loadPrizes()
  }

  const totalPrizes = prizes.length
  const availablePrizes = prizes.filter(p => p.is_available).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">الجوائز</h1>
          <div className="flex gap-4 mt-2 text-sm text-white/50">
            <span>الإجمالي: {totalPrizes}</span>
            <span>متاح: {availablePrizes}</span>
            <span>محجوز: {totalPrizes - availablePrizes}</span>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', image_url: '', value: '', is_available: true }) }}
          className="px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          + إضافة جائزة
        </button>
      </div>

      {/* Prize Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'تعديل الجائزة' : 'إضافة جائزة جديدة'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسم الجائزة (مثال: آيفون 16)"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
              />
              {/* Image upload */}
              <div className="space-y-2">
                <label className="block text-sm text-white/60">صورة الجائزة (اختياري)</label>
                <div className="flex gap-3">
                  <label className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-sm',
                    uploading && 'opacity-50 pointer-events-none'
                  )}>
                    <span className="text-white/40">{uploading ? 'جاري الرفع...' : form.image_url ? '✅ تم رفع الصورة' : '📁 اختر صورة من الجهاز'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        const formData = new FormData()
                        formData.append('file', file)
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: formData })
                          const data = await res.json()
                          if (data.url) setForm(prev => ({ ...prev, image_url: data.url }))
                        } catch { /* ignore */ }
                        setUploading(false)
                      }}
                    />
                  </label>
                </div>
                {form.image_url && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="text-xs text-red-400 hover:text-red-300">حذف الصورة</button>
                  </div>
                )}
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="أو أدخل رابط الصورة"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50 text-sm"
                />
              </div>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="القيمة التقريبية بالريال (اختياري)"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50"
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity">{editingId ? 'تحديث' : 'إضافة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prizes Grid */}
      {loading ? (
        <div className="text-center py-12 text-white/50">جاري التحميل...</div>
      ) : prizes.length === 0 ? (
        <div className="text-center py-12 text-white/50">لا توجد جوائز</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {prizes.map((prize) => (
            <div key={prize.id} className={cn('glass rounded-xl p-4 transition-all hover:scale-[1.02]', !prize.is_available && 'opacity-50')}>
              {prize.image_url && (
                <div className="w-full h-32 bg-white/5 rounded-lg mb-3 overflow-hidden">
                  <img src={prize.image_url} alt={prize.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="font-bold text-lg">{prize.name}</h3>
              {parseFloat(prize.value) > 0 && (
                <p className="text-gold font-bold mt-1">{parseFloat(prize.value).toLocaleString('ar-SA')} ريال</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => toggleAvailability(prize)}
                  className={cn(
                    'px-3 py-1 rounded text-xs transition-colors',
                    prize.is_available ? 'bg-correct/20 text-correct' : 'bg-white/10 text-white/40'
                  )}
                >
                  {prize.is_available ? 'متاح' : 'غير متاح'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(prize)} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors">تعديل</button>
                  <button onClick={() => handleDelete(prize.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
