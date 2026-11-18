export const MAX_MESSAGE_LENGTH = 4000

export type ChatResult = { success: true } | { error: string }
export type SubmitComment = (formData: FormData) => Promise<ChatResult>
