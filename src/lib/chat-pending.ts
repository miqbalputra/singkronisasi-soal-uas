export type ChatRole = 'Ustadz' | 'Ustadzah'

export interface PendingReply {
  count: number
  sender: ChatRole
  waitingFor: ChatRole
  firstMessageId: string
}

// Comments arrive in chronological order. Only an opposite-role message
// answers the preceding run; viewing the conversation never changes this state.
export function getPendingReply(comments: readonly { id: string; sender: string }[]): PendingReply | null {
  const valid = comments.filter(comment => comment.sender === 'Ustadz' || comment.sender === 'Ustadzah')
  const latest = valid.at(-1)
  if (!latest) return null
  const sender = latest.sender as ChatRole
  let first = valid.length - 1
  while (first > 0 && valid[first - 1].sender === sender) first--
  return {
    count: valid.length - first,
    sender,
    waitingFor: sender === 'Ustadz' ? 'Ustadzah' : 'Ustadz',
    firstMessageId: valid[first].id,
  }
}
