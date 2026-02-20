import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-[#0D1B3E] to-bg-mid flex items-center justify-center stars-bg ramadan-pattern relative overflow-hidden">
      {/* Crescent moon */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-7xl animate-crescent opacity-30 select-none">&#9790;</div>

      <div className="text-center space-y-8 relative z-10">
        <div className="space-y-2">
          <h1 className="text-9xl font-black text-gold-gradient">عزيز</h1>
          <p className="text-xl text-accent-light/60">مسابقات رمضان</p>
        </div>
        <p className="text-2xl text-white/60">منصة المسابقات التلفزيونية التفاعلية</p>
        <div className="flex gap-6 justify-center">
          <Link
            href="/admin"
            className="px-8 py-4 glass hover:bg-white/10 rounded-xl text-lg transition-all hover:scale-105"
          >
            لوحة التحكم
          </Link>
          <Link
            href="/admin/episodes"
            className="px-8 py-4 bg-gradient-to-r from-accent to-accent-light text-white font-bold rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-accent/20"
          >
            بدء المسابقة
          </Link>
        </div>
      </div>
    </div>
  )
}
