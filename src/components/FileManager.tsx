'use client'

import React, { useState } from 'react'
import { uploadFile, deleteFile } from '@/app/subject/[id]/actions'
import { Download, Trash2, Upload, FileText, CheckCircle2 } from 'lucide-react'

interface Attachment {
  id: string
  filename: string
  fileUrl: string
  uploadedBy: string
  createdAt: Date
}

interface FileManagerProps {
  subjectId: string
  attachments: Attachment[]
  isLocked: boolean
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' tahun lalu'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' bulan lalu'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' hari lalu'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' jam lalu'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' menit lalu'
  
  return 'Baru saja'
}

export default function FileManager({ subjectId, attachments, isLocked }: FileManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [sender, setSender] = useState<'Ustadz' | 'Ustadzah' | ''>('')
  const [error, setError] = useState('')

  const ustadzFile = attachments.find(a => a.uploadedBy === 'Ustadz')
  const ustadzahFile = attachments.find(a => a.uploadedBy === 'Ustadzah')

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sender) {
      setError('Pilih pengirim terlebih dahulu')
      return
    }

    const formData = new FormData(e.currentTarget)
    setIsUploading(true)
    setError('')

    try {
      const result = await uploadFile(subjectId, sender, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        // Reset form
        const form = e.target as HTMLFormElement
        form.reset()
        setSender('')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengunggah file')
    } finally {
      setIsUploading(false)
    }
  }

  const sortedAttachments = [...attachments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Simplified Last Upload Info */}
      <div className="card" style={{ 
        padding: '0.75rem 1.25rem', 
        border: '3px solid var(--border)', 
        background: '#f8fafc',
        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem'
      }}>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          background: sortedAttachments.length > 0 ? 'var(--primary)' : '#cbd5e1',
          border: '2px solid black'
        }}></div>
        <span style={{ fontWeight: 800 }}>
          {sortedAttachments.length > 0 
            ? `Update Terakhir oleh ${sortedAttachments[0].uploadedBy} (${timeAgo(new Date(sortedAttachments[0].createdAt))})`
            : 'Belum ada file yang diunggah'
          }
        </span>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '3px solid black', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>📂 Manajemen File Soal</h3>
          {sortedAttachments.length > 0 && (
            <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius)', fontWeight: 'bold', border: '2px solid black' }}>
              {sortedAttachments.length} Versi
            </span>
          )}
        </div>

        {!isLocked && (
          <form onSubmit={handleUpload} style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius)', border: '2px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setSender('Ustadz')}
                className="btn"
                style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  padding: '0.4rem',
                  background: sender === 'Ustadz' ? 'var(--ustadz)' : 'white', 
                  color: sender === 'Ustadz' ? 'white' : 'inherit',
                  border: '2px solid var(--border)',
                  boxShadow: sender === 'Ustadz' ? 'none' : '2px 2px 0px 0px rgba(0,0,0,1)',
                  transform: sender === 'Ustadz' ? 'translate(1px, 1px)' : 'none'
                }}
              >
                USTADZ {sender === 'Ustadz' && '✅'}
              </button>
              <button 
                type="button" 
                onClick={() => setSender('Ustadzah')}
                className="btn"
                style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  padding: '0.4rem',
                  background: sender === 'Ustadzah' ? 'var(--ustadzah)' : 'white', 
                  color: sender === 'Ustadzah' ? 'white' : 'inherit',
                  border: '2px solid var(--border)',
                  boxShadow: sender === 'Ustadzah' ? 'none' : '2px 2px 0px 0px rgba(0,0,0,1)',
                  transform: sender === 'Ustadzah' ? 'translate(1px, 1px)' : 'none'
                }}
              >
                USTADZAH {sender === 'Ustadzah' && '✅'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', padding: '0.4rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ flex: 1, position: 'relative', paddingLeft: '0.25rem' }}>
                <input 
                  type="file" 
                  name="file" 
                  id="file-upload"
                  accept=".doc,.docx,.pdf"
                  required 
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }}
                />
                <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                  <Upload size={14} /> PILIH FILE
                </label>
              </div>
              <button 
                type="submit" 
                disabled={isUploading || !sender} 
                className="btn btn-primary"
                style={{ padding: '0.4rem 1rem', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem' }}
              >
                {isUploading ? '...' : 'UNGGAH'}
              </button>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 800 }}>⚠️ {error}</p>}
          </form>
        )}


      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', padding: '0.5rem' }}>
        {sortedAttachments.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: 'var(--radius)', border: '3px dashed var(--border)', opacity: 0.6 }}>
            <FileText size={64} style={{ margin: '0 auto 1.5rem', display: 'block' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>Belum ada file yang diunggah.</p>
            <p style={{ fontSize: '0.9rem' }}>Silakan unggah draf soal dalam bentuk Word (.docx)</p>
          </div>
        ) : (
          sortedAttachments.map((file, index) => (
            <div 
              key={file.id} 
              className="file-card"
              style={{ 
                background: 'white', 
                border: index === 0 ? '3px solid var(--primary)' : '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                boxShadow: index === 0 ? '4px 4px 0px 0px var(--primary)' : '3px 3px 0px 0px rgba(0,0,0,1)',
                transition: 'transform 0.2s ease',
                cursor: 'default'
              }}
            >
              {index === 0 && (
                <div style={{ position: 'absolute', top: '-12px', left: '12px', background: 'var(--primary)', color: 'white', fontSize: '0.7rem', fontWeight: 900, padding: '0.15rem 0.5rem', borderRadius: '4px', border: '2px solid black', textTransform: 'uppercase', letterSpacing: '0.5px', zIndex: 10 }}>
                  TERBARU ⭐
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: file.uploadedBy === 'Ustadz' ? 'var(--ustadz)' : 'var(--ustadzah)', 
                  color: 'white', 
                  padding: '0.5rem', 
                  borderRadius: '8px',
                  border: '2px solid black',
                  boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                }}>
                  <FileText size={24} />
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ 
                    fontWeight: 900, 
                    fontSize: '0.85rem', 
                    lineHeight: 1.2,
                    marginBottom: '0.15rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-all'
                  }} title={file.filename}>
                    {file.filename}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                    <span style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 800, 
                      padding: '0.05rem 0.3rem', 
                      background: file.uploadedBy === 'Ustadz' ? 'var(--ustadz)' : 'var(--ustadzah)',
                      color: 'white',
                      borderRadius: '3px',
                      textTransform: 'uppercase'
                    }}>
                      {file.uploadedBy}
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.6 }}>
                      {timeAgo(new Date(file.createdAt))}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto' }}>
                <a 
                  href={file.fileUrl} 
                  download 
                  className="btn" 
                  style={{ 
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    border: '2px solid black',
                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
                    textDecoration: 'none'
                  }}
                >
                  <Download size={16} /> UNDUH
                </a>
                
                {!isLocked && (
                  <button 
                    onClick={() => {
                      if(confirm('Hapus file ini?')) deleteFile(subjectId, file.id)
                    }}
                    className="btn"
                    style={{ 
                      padding: '0.5rem', 
                      background: '#fee2e2', 
                      border: '2px solid #ef4444', 
                      color: '#ef4444',
                      boxShadow: '2px 2px 0px 0px #ef4444'
                    }}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
  )
}
