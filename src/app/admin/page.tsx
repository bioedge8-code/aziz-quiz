'use client'

import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    usedQuestions: 0,
    availableQuestions: 0,
    totalPrizes: 0,
    availablePrizes: 0,
    totalEpisodes: 0,
    activeEpisodes: 0,
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [questionsRes, prizesRes, episodesRes] = await Promise.all([
          fetch('/api/questions'),
          fetch('/api/prizes'),
          fetch('/api/episodes'),
        ])

        const questions = await questionsRes.json()
        const prizes = await prizesRes.json()
        const episodes = await episodesRes.json()

        setStats({
          totalQuestions: questions.length,
          usedQuestions: questions.filter((q: { is_used: boolean }) => q.is_used).length,
          availableQuestions: questions.filter((q: { is_used: boolean }) => !q.is_used).length,
          totalPrizes: prizes.length,
          availablePrizes: prizes.filter((p: { is_available: boolean }) => p.is_available).length,
          totalEpisodes: episodes.length,
          activeEpisodes: episodes.filter((e: { status: string }) => e.status === 'active').length,
        })
      } catch {
        // Handle error silently
      }
    }
    loadStats()
  }, [])

  const cards = [
    { title: 'إجمالي الأسئلة', value: stats.totalQuestions, color: 'from-blue-500 to-blue-700' },
    { title: 'أسئلة متاحة', value: stats.availableQuestions, color: 'from-green-500 to-green-700' },
    { title: 'أسئلة مستخدمة', value: stats.usedQuestions, color: 'from-orange-500 to-orange-700' },
    { title: 'إجمالي الجوائز', value: stats.totalPrizes, color: 'from-purple-500 to-purple-700' },
    { title: 'جوائز متاحة', value: stats.availablePrizes, color: 'from-yellow-500 to-yellow-700' },
    { title: 'إجمالي الحلقات', value: stats.totalEpisodes, color: 'from-pink-500 to-pink-700' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="glass rounded-xl p-6 hover:scale-[1.02] transition-transform"
          >
            <p className="text-white/60 text-sm">{card.title}</p>
            <p className={`text-4xl font-black mt-2 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
