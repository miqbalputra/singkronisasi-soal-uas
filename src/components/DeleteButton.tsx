'use client'

export default function DeleteButton({ text, confirmMessage }: { text: string, confirmMessage: string }) {
  return (
    <button 
      type="submit"
      className="btn" 
      style={{ background: 'var(--danger)', color: 'white', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} 
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault()
        }
      }}
    >
      {text}
    </button>
  )
}
