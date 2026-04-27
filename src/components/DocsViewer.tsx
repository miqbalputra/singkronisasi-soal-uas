'use client'

import { useState } from 'react'

export default function DocsViewer({ url, title }: { url: string | null, title: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!url) {
    return (
      <div style={{ flex: 1, border: '3px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', boxShadow: '5px 5px 0px 0px rgba(0,0,0,1)' }}>
        <p style={{ fontWeight: 600 }}>Admin belum menyematkan link Google Docs.</p>
      </div>
    )
  }

  const containerStyle = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    background: 'var(--bg-color)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  } : {
    flex: 1,
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '750px',
    height: '75vh',
  }

  const frameStyle = {
    flex: 1,
    border: '3px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: '5px 5px 0px 0px rgba(0,0,0,1)',
    overflow: 'hidden',
    background: 'var(--surface)'
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', position: isFullscreen ? 'static' : 'absolute', top: '-2.5rem', right: '0', zIndex: 10 }}>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)} 
          className="btn"
          style={{ 
            padding: '0.25rem 0.75rem', 
            fontSize: '0.8rem', 
            background: isFullscreen ? 'var(--warning)' : 'var(--surface)',
            boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)'
          }}
        >
          {isFullscreen ? '↙ Minimize' : '⛶ Fullscreen'}
        </button>
      </div>
      <div style={frameStyle}>
        <iframe 
          src={url} 
          width="100%" 
          height="100%" 
          style={{ border: 'none', display: 'block' }}
          title={`Dokumen ${title}`}
        />
      </div>
    </div>
  )
}
