'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'الرئيسية', icon: '📊' },
  { href: '/admin/questions', label: 'بنك الأسئلة', icon: '❓' },
  { href: '/admin/prizes', label: 'الجوائز', icon: '🎁' },
  { href: '/admin/episodes', label: 'الحلقات', icon: '🎬' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-bg-mid/50 border-l border-white/10 min-h-screen p-6">
      <Link href="/admin" className="block mb-8">
        <h1 className="text-3xl font-black text-gold-gradient">عزيز</h1>
        <p className="text-sm text-white/50 mt-1">لوحة التحكم</p>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm',
              pathname === item.href
                ? 'bg-accent/20 text-accent-light border border-accent/30'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <span>🏠</span>
          <span>الصفحة الرئيسية</span>
        </Link>
      </div>
    </aside>
  )
}
