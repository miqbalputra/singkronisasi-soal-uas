'use client'

import { useState } from 'react'

export default function ApprovalButtons({ 
  subjectId, 
  ustadzApproved, 
  ustadzahApproved, 
  isLocked,
  onToggle
}: { 
  subjectId: string, 
  ustadzApproved: boolean, 
  ustadzahApproved: boolean,
  isLocked: boolean,
  onToggle: (role: 'Ustadz' | 'Ustadzah') => Promise<void>
}) {
  const [showStamp, setShowStamp] = useState(false)
  const [stampText, setStampText] = useState('')

  const handleToggle = async (role: 'Ustadz' | 'Ustadzah', currentStatus: boolean) => {
    if (isLocked) return

    // Play animation if we are approving (not un-approving)
    if (!currentStatus) {
      setStampText('SETUJU!')
      setShowStamp(true)
      setTimeout(() => setShowStamp(false), 2500)
    }

    await onToggle(role)
  }

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {showStamp && (
        <div className="stamp-overlay">
          <img src="/stamp.png" alt="STAMP" style={{ 
            width: '80vw', 
            maxWidth: '1000px',
            animation: 'stamp-impact 2.5s ease-out forwards',
            filter: 'drop-shadow(10px 10px 0px rgba(0,0,0,0.3))'
          }} />
        </div>
      )}

      <button 
        className="btn" 
        style={{ 
          background: ustadzApproved ? 'var(--ustadz)' : 'var(--surface)', 
          color: ustadzApproved ? 'white' : 'var(--text-color)' 
        }}
        disabled={isLocked}
        onClick={() => handleToggle('Ustadz', ustadzApproved)}
      >
        Ustadz {ustadzApproved ? 'Disetujui' : 'Setuju'}
      </button>

      <button 
        className="btn" 
        style={{ 
          background: ustadzahApproved ? 'var(--ustadzah)' : 'var(--surface)', 
          color: ustadzahApproved ? 'white' : 'var(--text-color)' 
        }}
        disabled={isLocked}
        onClick={() => handleToggle('Ustadzah', ustadzahApproved)}
      >
        Ustadzah {ustadzahApproved ? 'Disetujui' : 'Setuju'}
      </button>
    </div>
  )
}
