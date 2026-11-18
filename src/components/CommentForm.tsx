'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { FileText, ListOrdered, LoaderCircle, Paperclip, Send, X } from 'lucide-react'
import { CHAT_FILE_ACCEPT, formatChatFileSize, MAX_MESSAGE_LENGTH, validateChatFile, type SubmitComment } from '@/lib/chat'
import { continueNumberedList, toggleNumberedList, type TextEdit } from '@/lib/chat-numbering'
import type { PendingReply } from '@/lib/chat-pending'
import styles from './ChatBox.module.css'

export default function CommentForm({ submitAction, onSent, pendingReply }: {
  submitAction: SubmitComment
  onSent: () => void
  pendingReply: PendingReply | null
}) {
  const [sender, setSender] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const submitting = useRef(false)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const skipNumbering = useRef(false)
  const pendingSelection = useRef<TextEdit | null>(null)
  const id = useId()
  const isReply = Boolean(pendingReply && sender === pendingReply.waitingFor)
  const recipient = sender === 'Ustadz' ? 'Ustadzah' : 'Ustadz'

  function applyEdit(edit: TextEdit) {
    if (edit.value.length > MAX_MESSAGE_LENGTH) {
      setError('Pesan maksimal 4.000 karakter.')
      return
    }
    pendingSelection.current = edit
    setContent(edit.value)
    setError('')
    setStatus('')
  }

  useLayoutEffect(() => {
    const edit = pendingSelection.current
    pendingSelection.current = null
    if (!edit || edit.value !== content) return
    textarea.current?.focus({ preventScroll: true })
    textarea.current?.setSelectionRange(edit.caret, edit.caret)
  }, [content])

  useEffect(() => {
    const field = textarea.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${Math.min(field.scrollHeight, 160)}px`
  }, [content])

  return (
    <form className={styles.composer} aria-busy={pending} onSubmit={async event => {
      event.preventDefault()
      if (submitting.current || !sender || (!content.trim() && !file)) return
      submitting.current = true
      setPending(true)
      setError('')
      setStatus('')
      const data = new FormData()
      data.set('sender', sender)
      data.set('content', content.trim())
      if (file) data.set('file', file)
      try {
        const result = await submitAction(data)
        if ('error' in result) { setError(result.error); return }
        setContent('')
        setFile(null)
        if (fileInput.current) fileInput.current.value = ''
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
      <div className={styles.toolbar} role="group" aria-label="Alat pesan">
        <button type="button" disabled={pending} className={styles.toolButton}
          title="Daftar bernomor. Enter melanjutkan nomor, Enter pada nomor kosong mengakhiri daftar."
          onClick={() => {
            const field = textarea.current
            if (field) applyEdit(toggleNumberedList(content, field.selectionStart, field.selectionEnd))
          }}><ListOrdered size={19} aria-hidden="true" /> Daftar</button>
        <button type="button" disabled={pending} className={styles.toolButton}
          onClick={() => fileInput.current?.click()}><Paperclip size={19} aria-hidden="true" /> Lampirkan</button>
        <input ref={fileInput} type="file" accept={CHAT_FILE_ACCEPT} hidden aria-label="Pilih lampiran"
          onChange={event => {
            const selected = event.target.files?.[0]
            if (!selected) return
            const validationError = validateChatFile(selected)
            if (validationError) { setError(validationError); event.target.value = ''; return }
            setFile(selected); setError(''); setStatus('')
          }} />
      </div>
      {file && <div className={styles.filePreview}>
        <FileText size={22} aria-hidden="true" />
        <div><strong>{file.name}</strong><span>{formatChatFileSize(file.size)} · Siap dikirim</span></div>
        <button type="button" disabled={pending} aria-label="Hapus lampiran" onClick={() => {
          setFile(null); if (fileInput.current) fileInput.current.value = ''
        }}><X size={18} /></button>
      </div>}
      <label className={styles.srOnly} htmlFor={`${id}-message`}>Tulis pesan</label>
      <textarea ref={textarea} id={`${id}-message`} name="content" rows={2}
        placeholder={isReply ? `Tulis balasan untuk ${recipient}…` : 'Tulis pesan diskusi…'} value={content} readOnly={pending}
        required={!file} maxLength={MAX_MESSAGE_LENGTH} aria-invalid={Boolean(error)}
        aria-describedby={`${id}-context ${id}-hint${error ? ` ${id}-error` : ''}`}
        onChange={event => {
          const value = event.target.value
          const caret = event.target.selectionStart
          // Some mobile keyboards insert a line break without an Enter key event.
          const insertedNewline = value.length === content.length + 1 && value[caret - 1] === '\n'
            && value.slice(0, caret - 1) + value.slice(caret) === content
          const edit = !skipNumbering.current && !(event.nativeEvent as InputEvent).isComposing && insertedNewline
            ? continueNumberedList(content, caret - 1, caret - 1) : null
          skipNumbering.current = false
          if (edit) applyEdit(edit)
          else { setContent(value); setError(''); setStatus('') }
        }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return
          skipNumbering.current = event.key === 'Enter' && event.shiftKey
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          } else if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
            const edit = continueNumberedList(content, event.currentTarget.selectionStart, event.currentTarget.selectionEnd)
            if (edit) { event.preventDefault(); applyEdit(edit) }
          }
        }} />
      <div className={styles.composerFooter}>
        {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
        <div id={`${id}-hint`} className={styles.hint}>
          <span>Enter: baris / nomor berikutnya</span>
          <span>{content.length.toLocaleString('id-ID')} / 4.000 karakter</span>
        </div>
        <button type="submit" className={styles.send} disabled={pending || !sender || (!content.trim() && !file)}>
          {pending ? <LoaderCircle size={18} className={styles.spinner} /> : <Send size={18} />}
          {pending ? 'Mengirim…' : isReply ? 'Balas' : 'Kirim'}
        </button>
      </div>
      <p className={styles.uploadHint}>1 file maks. 10 MB · PDF, Office, gambar, TXT, ZIP</p>
      <p className={styles.srOnly} role="status">{status}</p>
    </form>
  )
}
