import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2a4a] via-[#0D1B3E] to-[#0a1225] flex items-center justify-center stars-bg ramadan-pattern relative overflow-hidden">
      {/* Mosque silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 200%22><path d=%22M0,200 L0,120 Q50,100 100,120 L100,80 Q150,20 200,80 L200,120 Q250,100 300,120 L300,90 L320,40 L340,90 L340,120 Q400,100 450,120 L450,60 Q500,10 550,60 L550,120 Q600,100 650,120 L650,100 L670,50 L690,100 L690,120 Q750,100 800,120 L800,80 Q850,30 900,80 L900,120 Q950,100 1000,120 L1000,90 L1020,45 L1040,90 L1040,120 Q1100,100 1150,120 L1200,120 L1200,200 Z%22 fill=%22rgba(0,0,0,0.3)%22/></svg>')] bg-cover bg-bottom pointer-events-none" />

      {/* Lantern decorations */}
      <div className="absolute top-8 right-[15%] text-4xl animate-float opacity-40 select-none">🏮</div>
      <div className="absolute top-16 left-[20%] text-3xl animate-float opacity-30 select-none" style={{ animationDelay: '1s' }}>🏮</div>
      <div className="absolute top-12 right-[40%] text-2xl animate-float opacity-25 select-none" style={{ animationDelay: '0.5s' }}>🏮</div>

      <div className="text-center space-y-6 relative z-10 px-4">
        {/* Photo */}
        <div className="w-48 h-48 mx-auto rounded-full border-4 border-white/80 overflow-hidden shadow-2xl shadow-black/50">
          <Image src="/images/aziz-photo.jpg" alt="عزيز" width={192} height={192} className="w-full h-full object-cover" />
        </div>

        {/* Logo */}
        <div className="mx-auto w-80">
          <Image src="/images/logo.png" alt="اهبد مع عزيز" width={400} height={200} className="w-full h-auto" />
        </div>

        <div className="flex gap-6 justify-center pt-4">
          <Link
            href="/admin"
            className="px-8 py-4 glass hover:bg-white/10 rounded-xl text-lg transition-all hover:scale-105"
          >
            لوحة التحكم
          </Link>
          <Link
            href="/admin/episodes"
            className="px-8 py-4 bg-gradient-to-r from-[#F5A623] to-[#E8912D] text-white font-bold rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-[#F5A623]/20"
          >
            بدء المسابقة
          </Link>
        </div>
      </div>
    </div>
  )
}
