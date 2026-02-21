import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `prize-${Date.now()}.${ext}`

  // Save to public/uploads directory
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const filePath = path.join(uploadsDir, filename)
  await writeFile(filePath, buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}
