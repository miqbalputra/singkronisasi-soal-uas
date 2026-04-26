'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

export async function addComment(subjectId: string, sender: string, content: string) {
  if (!content.trim()) return { error: 'Komentar tidak boleh kosong' }
  if (sender !== 'Ustadz' && sender !== 'Ustadzah') return { error: 'Pengirim tidak valid' }

  await prisma.comment.create({
    data: {
      subjectId,
      sender,
      content,
    },
  })

  revalidatePath(`/subject/${subjectId}`)
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

  const fileUrl = `/uploads/${subjectId}/${filename}`

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
    const filePath = path.join(process.cwd(), 'public', attachment.fileUrl)
    await unlink(filePath)
  } catch (e) {
    console.error('Error deleting file:', e)
  }

  await prisma.attachment.delete({
    where: { id: attachmentId }
  })

  revalidatePath(`/subject/${subjectId}`)
}
