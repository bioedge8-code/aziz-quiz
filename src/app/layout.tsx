import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'اهبد مع عزيز',
  description: 'مسابقات رمضان التفاعلية - اهبد مع عزيز',
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
