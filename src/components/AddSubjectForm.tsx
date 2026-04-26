'use client'

import React, { useState } from 'react'
import { PlusCircle, Globe, FileText } from 'lucide-react'

interface Class {
  id: string
  name: string
}

interface AddSubjectFormProps {
  classes: Class[]
  addSubject: (formData: FormData) => Promise<void>
}

export default function AddSubjectForm({ classes, addSubject }: AddSubjectFormProps) {
  const [mode, setMode] = useState('ONLINE')

  return (
    <form 
      action={async (formData) => {
        await addSubject(formData)
        // Optionally reset state or form if needed
        const form = document.getElementById('add-subject-form') as HTMLFormElement
        if (form) form.reset()
        setMode('ONLINE')
      }} 
      id="add-subject-form"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Pilih Kelas</label>
          <select name="classId" className="input" style={{ width: '100%', padding: '0.6rem' }} required>
            <option value="">-- Pilih Kelas --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Nama Mata Pelajaran</label>
          <input type="text" name="name" className="input" style={{ width: '100%', padding: '0.6rem' }} placeholder="Contoh: Akidah Akhlak" required />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>Model Sistem Penggunaan</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button 
            type="button" 
            onClick={() => setMode('ONLINE')}
            style={{
              padding: '1.25rem',
              background: mode === 'ONLINE' ? 'var(--primary)' : 'white',
              color: mode === 'ONLINE' ? 'white' : 'black',
              border: '4px solid black',
              borderRadius: '12px',
              boxShadow: mode === 'ONLINE' ? 'none' : '6px 6px 0px 0px black',
              transform: mode === 'ONLINE' ? 'translate(3px, 3px)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.1s'
            }}
          >
            <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '1px' }}>MODEL ISI ONLINE</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>(GOOGLE DOCS)</span>
            <input type="radio" name="workMode" value="ONLINE" checked={mode === 'ONLINE'} readOnly style={{ display: 'none' }} />
          </button>

          <button 
            type="button" 
            onClick={() => setMode('FILE')}
            style={{
              padding: '1.25rem',
              background: mode === 'FILE' ? 'var(--ustadzah)' : 'white',
              color: mode === 'FILE' ? 'white' : 'black',
              border: '4px solid black',
              borderRadius: '12px',
              boxShadow: mode === 'FILE' ? 'none' : '6px 6px 0px 0px black',
              transform: mode === 'FILE' ? 'translate(3px, 3px)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.1s'
            }}
          >
            <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '1px' }}>MODEL UPLOAD FILE</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>(DOCX)</span>
            <input type="radio" name="workMode" value="FILE" checked={mode === 'FILE'} readOnly style={{ display: 'none' }} />
          </button>
        </div>
      </div>

      {mode === 'ONLINE' && (
        <div style={{ 
          padding: '1.25rem', 
          background: '#eff6ff', 
          border: '4px dashed var(--primary)', 
          borderRadius: '12px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>Link Google Docs (Wajib)</label>
          <input 
            type="url" 
            name="googleDocsUrl" 
            className="input" 
            placeholder="https://docs.google.com/document/d/..." 
            style={{ width: '100%', padding: '0.75rem', border: '3px solid black', fontWeight: 700 }}
            required={mode === 'ONLINE'}
          />
          <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', fontWeight: 700, opacity: 0.8 }}>* Jika memilih model Online, link GDocs harus valid agar Ustadz/Ustadzah bisa mengisi.</p>
        </div>
      )}

      <button type="submit" className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
        TAMBAH MATA PELAJARAN
      </button>
    </form>
  )
}
