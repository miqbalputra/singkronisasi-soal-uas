'use client'

import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, Clock3, Download, FileText, Maximize2, MessageSquare, Minimize2, X } from 'lucide-react'
import CommentForm from './CommentForm'
import type { SubmitComment } from '@/lib/chat'
import { formatChatFileSize } from '@/lib/chat'
import { messageBlocks } from '@/lib/chat-numbering'
import { getPendingReply } from '@/lib/chat-pending'
import styles from './ChatBox.module.css'

interface Comment {
  id: string
  sender: string
  content: string
  createdAt: Date
  attachmentName?: string | null
  attachmentUrl?: string | null
  attachmentSize?: number | null
}

export default function ChatBox({ comments, subjectId, submitAction }: {
  comments: Comment[]
  subjectId: string
  submitAction: SubmitComment
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showLatest, setShowLatest] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  const messages = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const router = useRouter()
  const id = useId()
  const lastMessage = comments.at(-1)?.id
  const pendingReply = getPendingReply(comments)

  function scrollToLatest() {
    const list = messages.current
    if (list) list.scrollTop = list.scrollHeight
    nearBottom.current = true
    setShowLatest(false)
  }

  const close = useCallback(() => {
    setIsOpen(false)
    requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }))
  }, [])

  useEffect(() => {
    if (!isOpen || document.visibilityState !== 'visible') return
    if (nearBottom.current) {
      const list = messages.current
      if (list) list.scrollTop = list.scrollHeight
    } else {
      setShowLatest(true)
    }
  }, [isOpen, lastMessage])

  useEffect(() => {
    const revealLatest = () => {
      if (nearBottom.current && document.visibilityState === 'visible') {
        const list = messages.current
        if (list) list.scrollTop = list.scrollHeight
      }
    }
    document.addEventListener('visibilitychange', revealLatest)
    return () => document.removeEventListener('visibilitychange', revealLatest)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    panel.current?.focus({ preventScroll: true })
    const viewport = window.visualViewport
    const resize = () => {
      panel.current?.style.setProperty('--chat-viewport-height', `${viewport?.height ?? window.innerHeight}px`)
      panel.current?.style.setProperty('--chat-viewport-top', `${viewport?.offsetTop ?? 0}px`)
    }
    resize()
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('keydown', escape)
    viewport?.addEventListener('resize', resize)
    viewport?.addEventListener('scroll', resize)
    return () => {
      document.removeEventListener('keydown', escape)
      viewport?.removeEventListener('resize', resize)
      viewport?.removeEventListener('scroll', resize)
    }
  }, [isOpen, close])

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') router.refresh() }
    refresh()
    const interval = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [router, subjectId])

  return (
    <>
      <button ref={launcher} type="button" className={styles.launcher} hidden={isOpen}
        aria-label={pendingReply
          ? `Buka ruang diskusi, ${pendingReply.count} pesan menunggu balasan ${pendingReply.waitingFor}`
          : 'Buka ruang diskusi'}
        aria-expanded={isOpen} aria-controls={id}
        onClick={() => { nearBottom.current = true; setIsOpen(true) }}>
        <MessageSquare size={24} aria-hidden="true" />
        <span className={styles.launcherText}>Diskusi
          {pendingReply && <span>Menunggu {pendingReply.waitingFor}</span>}
        </span>
        {pendingReply && <span className={styles.count}>{pendingReply.count > 99 ? '99+' : pendingReply.count}</span>}
      </button>
      {/* Keep the form mounted so closing the panel does not discard the draft. */}
      <section ref={panel} id={id} hidden={!isOpen} tabIndex={-1} role="dialog"
        aria-labelledby={`${id}-title`} className={`${styles.panel} ${isMaximized ? styles.maximized : ''}`}>
        <header className={styles.header}>
          <div className={styles.headerIcon}><MessageSquare size={24} aria-hidden="true" /></div>
          <div className={styles.heading}>
            <h2 id={`${id}-title`}>Ruang Diskusi</h2>
            <p>Koordinasi Ustadz &amp; Ustadzah</p>
          </div>
          <button type="button" className={`${styles.iconButton} ${styles.resizeButton}`}
            aria-label={isMaximized ? 'Kembalikan ukuran diskusi' : 'Perbesar diskusi'}
            onClick={() => setIsMaximized(!isMaximized)}>
            {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button type="button" className={styles.iconButton} aria-label="Tutup diskusi" onClick={close}><X size={22} /></button>
        </header>
        {pendingReply && <div className={styles.replyBanner} role="status">
          <Clock3 size={20} aria-hidden="true" />
          <div><strong>{pendingReply.count} pesan menunggu balasan {pendingReply.waitingFor}</strong>
            <p>Angka tetap muncul sampai {pendingReply.waitingFor} membalas.</p>
          </div>
        </div>}
        <div ref={messages} className={styles.messages} role="log" aria-label="Pesan diskusi"
          aria-live={isOpen ? 'polite' : 'off'} aria-relevant="additions" tabIndex={0}
          onScroll={event => {
            const list = event.currentTarget
            nearBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80
            if (nearBottom.current) setShowLatest(false)
          }}>
          {comments.length === 0 ? (
            <div className={styles.empty}>
              <MessageSquare size={40} aria-hidden="true" />
              <h3>Mulai diskusi soal</h3>
              <p>Sampaikan pertanyaan atau catatan revisi. Pilih Ustadz atau Ustadzah sebelum mengirim.</p>
            </div>
          ) : comments.map(comment => (
            <Fragment key={comment.id}>
            {comment.id === pendingReply?.firstMessageId && <div className={styles.pendingDivider}>
              <span>Menunggu balasan {pendingReply.waitingFor}</span>
            </div>}
            <article className={`${styles.message} ${comment.sender === 'Ustadzah' ? styles.ustadzah : styles.ustadz}`}>
              <span className={styles.sender}>{comment.sender}</span>
              {comment.content && <div className={styles.messageText}>
                {messageBlocks(comment.content).map((block, index) => block.type === 'text'
                  ? <p key={index}>{block.text}</p>
                  : <ol key={index} start={block.items[0].number}>
                    {block.items.map((item, itemIndex) => <li key={itemIndex} value={item.number}>{item.text}</li>)}
                  </ol>)}
              </div>}
              {comment.attachmentName && comment.attachmentUrl && <a className={styles.fileDownload}
                href={comment.attachmentUrl} download={comment.attachmentName}>
                <FileText size={24} aria-hidden="true" />
                <span><strong>{comment.attachmentName}</strong>
                  <small>{comment.attachmentSize != null && `${formatChatFileSize(comment.attachmentSize)} · `}Unduh file</small>
                </span><Download size={19} aria-hidden="true" />
              </a>}
              <time dateTime={new Date(comment.createdAt).toISOString()}>
                {new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(comment.createdAt))} WIB
              </time>
            </article>
            </Fragment>
          ))}
        </div>
        {showLatest && <button type="button" className={styles.latest} onClick={scrollToLatest}><ArrowDown size={16} /> Pesan terbaru</button>}
        <CommentForm submitAction={submitAction} pendingReply={pendingReply}
          onSent={() => { scrollToLatest(); router.refresh() }} />
      </section>
    </>
  )
}
