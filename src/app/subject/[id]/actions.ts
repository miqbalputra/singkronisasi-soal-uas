'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { MAX_MESSAGE_LENGTH, validateChatFile, type ChatResult } from '@/lib/chat'

export async function addComment(subjectId: string, sender: unknown, content: unknown): Promise<ChatResult> {
  return saveChatMessage(subjectId, sender, content)
}

export async function sendChatMessage(subjectId: string, formData: FormData): Promise<ChatResult> {
  return saveChatMessage(subjectId, formData.get('sender'), formData.get('content'), formData.get('file'))
}

async function saveChatMessage(subjectId: string, sender: unknown, content: unknown, upload?: unknown): Promise<ChatResult> {
  if ((await cookies()).get('auth_pin')?.value !== 'verified') {
    return { error: 'Sesi berakhir. Buka aplikasi di tab baru dan masuk kembali sebelum mengirim.' }
  }
  if (typeof content !== 'string') return { error: 'Pesan tidak valid' }
  const file = upload instanceof File && upload.name ? upload : null
  if (upload != null && !file) return { error: 'Lampiran tidak valid' }
  if (!content.trim() && !file) return { error: 'Tulis pesan atau pilih file terlebih dahulu.' }
  if (content.length > MAX_MESSAGE_LENGTH) return { error: 'Pesan maksimal 4.000 karakter' }
  if (sender !== 'Ustadz' && sender !== 'Ustadzah') return { error: 'Pengirim tidak valid' }
  if (file) {
    const error = validateChatFile(file)
    if (error) return { error }
  }
  let savedFilePath: string | null = null

  try {
    let attachment: { attachmentName: string; attachmentUrl: string; attachmentSize: number } | undefined
    if (file) {
      // Confirm the subject exists before creating any files on disk.
      if (!await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } })) {
        return { error: 'Mata pelajaran tidak ditemukan.' }
      }
      const filename = `${randomUUID()}${path.extname(file.name).toLowerCase()}`
      const directory = path.join(process.cwd(), 'storage', 'chat')
      await mkdir(directory, { recursive: true })
      const destination = path.join(directory, filename)
      savedFilePath = destination
      try {
        await writeFile(destination, Buffer.from(await file.arrayBuffer()), { flag: 'wx' })
      } catch (error) {
        // A partial disk write may leave bytes behind; never remove an existing
        // file if exclusive creation failed because of an unlikely name collision.
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') savedFilePath = null
        throw error
      }
      attachment = {
        attachmentName: file.name,
        attachmentUrl: `/api/chat-files/${encodeURIComponent(subjectId)}/${filename}`,
        attachmentSize: file.size,
      }
    }
    await prisma.comment.create({
      data: {
        subjectId,
        sender,
        content: content.trim(),
        ...attachment,
      },
    })
  } catch (error) {
    if (savedFilePath) {
      try { await unlink(savedFilePath) } catch (cleanupError) {
        if ((cleanupError as NodeJS.ErrnoException).code !== 'ENOENT') console.error('Failed to clean up chat upload:', cleanupError)
      }
    }
    console.error('Failed to save discussion message:', error)
    return { error: 'Pesan atau lampiran belum tersimpan. Silakan coba lagi. Jika tetap gagal, hubungi admin.' }
  }

  revalidatePath(`/subject/${subjectId}`)
  return { success: true }
}

export async function toggleApproval(subjectId: string, sender: string) {
  if (sender !== 'Ustadz' && sender !== 'Ustadzah') return { error: 'Pengirim tidak valid' }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  })

  if (!subject) return { error: 'Mapel tidak ditemukan' }
  
  if (subject.status === 'PRINTING' || subject.status === 'PRINTED') {
      return { error: 'Soal sudah dikunci dan tidak bisa diubah.' }
  }

  const updateData: any = {}
  if (sender === 'Ustadz') updateData.ustadzApproved = !subject.ustadzApproved
  if (sender === 'Ustadzah') updateData.ustadzahApproved = !subject.ustadzahApproved

  const newUstadzApp = sender === 'Ustadz' ? !subject.ustadzApproved : subject.ustadzApproved
  const newUstadzahApp = sender === 'Ustadzah' ? !subject.ustadzahApproved : subject.ustadzahApproved

  if (newUstadzApp && newUstadzahApp) {
    updateData.status = 'READY_TO_PRINT'
  } else {
    updateData.status = 'PROCESS'
  }

  await prisma.subject.update({
    where: { id: subjectId },
    data: updateData,
  })

  revalidatePath(`/subject/${subjectId}`)
  revalidatePath('/')
}

export async function uploadFile(subjectId: string, sender: string, formData: FormData) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Tidak ada file yang dipilih' }
  if (sender !== 'Ustadz' && sender !== 'Ustadzah') return { error: 'Pengirim tidak valid' }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subjectId)
  await mkdir(uploadDir, { recursive: true })

  // Sanitize filename and add timestamp
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filename = `${Date.now()}-${sanitizedName}`
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  const fileUrl = `/api/uploads/${subjectId}/${filename}`

  await prisma.attachment.create({
    data: {
      subjectId,
      filename: file.name,
      fileUrl,
      uploadedBy: sender
    }
  })

  revalidatePath(`/subject/${subjectId}`)
  return { success: true }
}

export async function deleteFile(subjectId: string, attachmentId: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId }
  })

  if (!attachment) return { error: 'File tidak ditemukan' }

  try {
    // Extract filename from URL (e.g. /api/uploads/id/filename)
    const urlParts = attachment.fileUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    const filePath = path.join(process.cwd(), 'public', 'uploads', subjectId, filename)
    await unlink(filePath)
  } catch (e) {
    console.error('Error deleting file:', e)
  }

  await prisma.attachment.delete({
    where: { id: attachmentId }
  })

  revalidatePath(`/subject/${subjectId}`)
}
