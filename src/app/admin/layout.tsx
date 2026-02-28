'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated via cookie
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: '' }),
        })
        // If cookie exists, the middleware would handle it
        // For simplicity, check localStorage
        if (localStorage.getItem('admin_auth') === 'true') {
          setAuthenticated(true)
        }
      } catch {
        // Not authenticated
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      localStorage.setItem('admin_auth', 'true')
      setAuthenticated(true)
    } else {
      setError('كلمة المرور غير صحيحة')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-dark to-bg-mid flex items-center justify-center">
        <div className="text-gold text-2xl">جاري التحميل...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-dark to-bg-mid flex items-center justify-center">
        <form onSubmit={handleLogin} className="glass rounded-2xl p-8 w-96 space-y-6">
          <div className="text-center">
            <Image src="/images/logo.jpg" alt="اهبد مع عزيز" width={250} height={100} className="w-48 h-auto mx-auto" />
            <p className="text-white/50 mt-3">تسجيل الدخول للوحة التحكم</p>
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-wrong text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            دخول
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark to-bg-mid flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
