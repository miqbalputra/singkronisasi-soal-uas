import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(_request: Request, context: { params: Promise<{ subjectId: string; filename: string }> }) {
  if ((await cookies()).get('auth_pin')?.value !== 'verified') {
    return new Response('Silakan masuk terlebih dahulu.', { status: 401 })
  }
  const { subjectId, filename } = await context.params
  if (!/^[a-f0-9-]{36}\.[a-z0-9]+$/.test(filename)) return new Response('File tidak ditemukan.', { status: 404 })
  const attachmentUrl = `/api/chat-files/${encodeURIComponent(subjectId)}/${filename}`
  const message = await prisma.comment.findFirst({ where: { subjectId, attachmentUrl }, select: { attachmentName: true } })
  if (!message?.attachmentName) return new Response('File tidak ditemukan.', { status: 404 })
  try {
    const bytes = await readFile(path.join(process.cwd(), 'storage', 'chat', filename))
    const encodedName = encodeURIComponent(message.attachmentName).replace(/['()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    return new Response(bytes, { headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="attachment${path.extname(filename)}"; filename*=UTF-8''${encodedName}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    } })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Response('File tidak ditemukan.', { status: 404 })
    console.error('Failed to download chat attachment:', error)
    return new Response('File belum dapat diunduh.', { status: 500 })
  }
}
