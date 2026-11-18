'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { LoaderCircle, Send } from 'lucide-react'
import { MAX_MESSAGE_LENGTH, type SubmitComment } from '@/lib/chat'
import type { PendingReply } from '@/lib/chat-pending'
import styles from './ChatBox.module.css'

export default function CommentForm({ submitAction, onSent, pendingReply }: {
  submitAction: SubmitComment
  onSent: () => void
  pendingReply: PendingReply | null
}) {
  const [sender, setSender] = useState('')
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const submitting = useRef(false)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  const isReply = Boolean(pendingReply && sender === pendingReply.waitingFor)
  const recipient = sender === 'Ustadz' ? 'Ustadzah' : 'Ustadz'

  useEffect(() => {
    const field = textarea.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${Math.min(field.scrollHeight, 160)}px`
  }, [content])

  return (
    <form className={styles.composer} aria-busy={pending} onSubmit={async event => {
      event.preventDefault()
      if (submitting.current || !sender || !content.trim()) return
      submitting.current = true
      setPending(true)
      setError('')
      setStatus('')
      const data = new FormData()
      data.set('sender', sender)
      data.set('content', content.trim())
      try {
        const result = await submitAction(data)
        if ('error' in result) { setError(result.error); return }
        setContent('')
        setStatus('Pesan terkirim.')
        onSent()
      } catch {
        setError('Pesan belum terkirim. Periksa koneksi Anda lalu coba kirim lagi.')
      } finally {
        submitting.current = false
        setPending(false)
        textarea.current?.focus({ preventScroll: true })
      }
    }}>
      <div className={styles.senderRow}>
        <label htmlFor={`${id}-sender`}>Kirim sebagai</label>
        <select id={`${id}-sender`} name="sender" value={sender} disabled={pending} required
          onChange={event => setSender(event.target.value)}>
          <option value="" disabled>Pilih peran Anda</option>
          <option value="Ustadz">Ustadz</option>
          <option value="Ustadzah">Ustadzah</option>
        </select>
      </div>
      <p className={styles.replyContext} id={`${id}-context`}>
        {!sender ? 'Pilih peran Anda sebelum mengirim pesan.'
          : isReply && pendingReply ? `Anda membalas ${pendingReply.count} pesan ${pendingReply.sender}.`
          : `Pesan Anda akan menunggu balasan ${recipient}.`}
      </p>
      <label className={styles.srOnly} htmlFor={`${id}-message`}>Tulis pesan</label>
      <textarea ref={textarea} id={`${id}-message`} name="content" rows={2}
        placeholder={isReply ? `Tulis balasan untuk ${recipient}…` : 'Tulis pesan diskusi…'} value={content} readOnly={pending}
        required maxLength={MAX_MESSAGE_LENGTH} aria-invalid={Boolean(error)}
        aria-describedby={`${id}-context ${id}-hint${error ? ` ${id}-error` : ''}`}
        onChange={event => { setContent(event.target.value); setError(''); setStatus('') }}
        onKeyDown={event => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }
        }} />
      <div className={styles.composerFooter}>
        <div id={`${id}-hint`} className={styles.hint}>
          <span>Enter untuk baris baru</span>
          <span>{content.length.toLocaleString('id-ID')} / 4.000 karakter</span>
        </div>
        <button type="submit" className={styles.send} disabled={pending || !sender || !content.trim()}>
          {pending ? <LoaderCircle size={18} className={styles.spinner} /> : <Send size={18} />}
          {pending ? 'Mengirim…' : isReply ? 'Balas' : 'Kirim'}
        </button>
      </div>
      {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
      <p className={styles.srOnly} role="status">{status}</p>
    </form>
  )
}
