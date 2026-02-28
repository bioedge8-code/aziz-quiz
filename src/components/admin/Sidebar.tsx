'use client'

import Link from 'next/link'
import Image from 'next/image'
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
        <Image src="/images/logo.jpg" alt="اهبد مع عزيز" width={200} height={80} className="w-40 h-auto" />
        <p className="text-sm text-white/50 mt-2">لوحة التحكم</p>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm',
              pathname === item.href
                ? 'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30'
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
