'use client'

import React, { useState } from 'react'
import { MessageSquare, Minus, Maximize2, X, Send } from 'lucide-react'
import CommentForm from './CommentForm'

interface Comment {
  id: string
  sender: string
  content: string
  createdAt: Date
}

interface ChatBoxProps {
  comments: Comment[]
  subjectId: string
  submitAction: (formData: FormData) => Promise<void>
}

export default function ChatBox({ comments, subjectId, submitAction }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          border: '4px solid black',
          boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >
        <MessageSquare size={30} />
        {comments.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'var(--danger)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 900,
            padding: '0.2rem 0.5rem',
            borderRadius: '10px',
            border: '2px solid black'
          }}>
            {comments.length}
          </span>
        )}
      </button>
    )
  }

  const width = isMaximized ? '80vw' : '400px'
  const height = isMaximized ? '80vh' : '500px'

  return (
    <div style={{
      position: 'fixed',
      bottom: isMaximized ? '10vh' : '2rem',
      right: isMaximized ? '10vw' : '2rem',
      width: width,
      height: height,
      maxWidth: '95vw',
      maxHeight: '95vh',
      background: 'white',
      border: '4px solid black',
      boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '0.75rem 1rem', 
        background: 'var(--primary)', 
        color: 'white', 
        borderBottom: '4px solid black',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} />
          <h3 style={{ fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ruang Diskusi</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setIsMaximized(!isMaximized)} 
            style={{ background: 'white', border: '2px solid black', borderRadius: '4px', padding: '2px', cursor: 'pointer' }}
            title={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? <Minus size={16} color="black" /> : <Maximize2 size={16} color="black" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ background: 'var(--danger)', border: '2px solid black', borderRadius: '4px', padding: '2px', cursor: 'pointer' }}
            title="Close"
          >
            <X size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        background: '#f8fafc'
      }}>
        {comments.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
            <p style={{ fontWeight: 700 }}>Belum ada diskusi.</p>
            <p style={{ fontSize: '0.85rem' }}>Mulai percakapan sekarang!</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ 
              padding: '0.75rem 1rem', 
              borderRadius: '12px', 
              background: c.sender === 'Ustadz' ? 'var(--ustadz)' : 'var(--ustadzah)', 
              width: 'fit-content', 
              maxWidth: '85%',
              alignSelf: c.sender === 'Ustadz' ? 'flex-start' : 'flex-end', 
              border: '3px solid black', 
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
              position: 'relative'
            }}>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 900, 
                color: 'white', 
                display: 'block', 
                marginBottom: '0.25rem', 
                textTransform: 'uppercase',
                opacity: 0.9
              }}>
                {c.sender}
              </span>
              <p style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600, lineHeight: 1.4 }}>{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Form Area */}
      <div style={{ padding: '1rem', background: 'white', borderTop: '4px solid black' }}>
        <CommentForm submitAction={submitAction} />
      </div>
    </div>
  )
}
