import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark to-bg-mid flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-8xl font-black text-gold-gradient">عزيز</h1>
        <p className="text-2xl text-white/70">منصة المسابقات التلفزيونية التفاعلية</p>
        <div className="flex gap-6 justify-center">
          <Link
            href="/admin"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-lg transition-all hover:scale-105"
          >
            لوحة التحكم
          </Link>
          <Link
            href="/admin/episodes"
            className="px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-xl text-lg transition-all hover:scale-105"
          >
            بدء المسابقة
          </Link>
        </div>
      </div>
    </div>
  )
}
