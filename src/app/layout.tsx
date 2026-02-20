import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'عزيز - مسابقة تلفزيونية',
  description: 'منصة المسابقات التلفزيونية التفاعلية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-bg-dark text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
