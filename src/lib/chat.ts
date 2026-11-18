export const MAX_MESSAGE_LENGTH = 4000
export const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024
export const CHAT_FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt,.zip'

export function validateChatFile(file: { name: string; size: number }): string | null {
  if (!file.size) return 'File kosong tidak dapat dikirim.'
  if (file.size > MAX_CHAT_FILE_SIZE) return 'Ukuran file maksimal 10 MB.'
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!CHAT_FILE_ACCEPT.split(',').includes(extension)) return 'Gunakan PDF, Word, Excel, PowerPoint, gambar, TXT, atau ZIP.'
  if (file.name.length > 255) return 'Nama file terlalu panjang. Maksimal 255 karakter.'
  return null
}

export function formatChatFileSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.ceil(bytes / 1024))} KB`
}

export type ChatResult = { success: true } | { error: string }
export type SubmitComment = (formData: FormData) => Promise<ChatResult>
