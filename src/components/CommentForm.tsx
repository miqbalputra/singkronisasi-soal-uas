'use client'

import { useState, useRef } from 'react'

export default function CommentForm({ submitAction }: { submitAction: (formData: FormData) => void }) {
  const [sender, setSender] = useState('Ustadz')
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form 
      ref={formRef}
      action={(formData) => {
        submitAction(formData)
        formRef.current?.reset()
      }} 
      style={{ display: 'flex', gap: '0.5rem' }}
    >
      <select 
        name="sender" 
        className="input" 
        style={{ 
          width: '150px', 
          background: sender === 'Ustadz' ? 'var(--ustadz)' : 'var(--ustadzah)',
          color: 'white',
          fontWeight: 'bold'
        }}
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      >
        <option value="Ustadz" style={{ background: 'var(--surface)', color: 'var(--text-color)' }}>Ustadz</option>
        <option value="Ustadzah" style={{ background: 'var(--surface)', color: 'var(--text-color)' }}>Ustadzah</option>
      </select>
      <input type="text" name="content" className="input" placeholder="Tulis komentar..." required style={{ flex: 1 }} />
      <button type="submit" className="btn btn-primary">Kirim</button>
    </form>
  )
}
