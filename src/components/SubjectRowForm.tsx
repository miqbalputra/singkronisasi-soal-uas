'use client'

import React, { useState } from 'react'

interface SubjectRowFormProps {
  sub: {
    id: string
    name: string
    workMode: string
    googleDocsUrl: string | null
  }
  updateSubject: (formData: FormData) => Promise<void>
}

export default function SubjectRowForm({ sub, updateSubject }: SubjectRowFormProps) {
  const [mode, setMode] = useState(sub.workMode)

  return (
    <form 
      action={async (formData) => {
        await updateSubject(formData)
      }} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem', 
        padding: '0.75rem', 
        background: '#f8fafc', 
        border: '3px solid black', 
        borderRadius: '12px',
        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
      }}
    >
      <input type="hidden" name="subjectId" value={sub.id} />
      
      <div>
        <label style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Nama Mata Pelajaran</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={sub.name} 
          className="input" 
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }} 
          placeholder="Nama Mapel" 
          required 
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Mode Kerja</label>
          <select 
            name="workMode" 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            className="input" 
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <option value="ONLINE">ONLINE (Google Docs)</option>
            <option value="FILE">UPLOAD FILE (.docx)</option>
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 900 }}>SIMPAN</button>
        </div>
      </div>

      {mode === 'ONLINE' && (
        <div style={{ 
          marginTop: '0.25rem', 
          padding: '0.75rem', 
          backgroundColor: 'rgba(74, 222, 128, 0.1)', 
          border: '2px dashed var(--primary)', 
          borderRadius: '8px' 
        }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', color: 'var(--primary)' }}>Link Google Docs</label>
          <input 
            type="url" 
            name="googleDocsUrl" 
            defaultValue={sub.googleDocsUrl || ''} 
            className="input" 
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', border: '2px solid black' }} 
            placeholder="https://docs.google.com/document/d/..." 
            required={mode === 'ONLINE'}
          />
          <p style={{ fontSize: '0.65rem', marginTop: '0.4rem', fontWeight: 700, color: 'var(--primary)' }}>* Pastikan link sudah di-set "Anyone with link can Edit"</p>
        </div>
      )}
      
      <a href={`/subject/${sub.id}`} target="_blank" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', fontSize: '0.8rem', marginTop: '0.25rem', display: 'inline-block' }}>Lihat Halaman Kolaborasi &rarr;</a>
    </form>
  )
}
