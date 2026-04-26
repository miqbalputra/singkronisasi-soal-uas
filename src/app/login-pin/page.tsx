'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { verifyPin } from '../actions'
import { 
  Sparkles, X, Rocket, MessageSquare, 
  CheckCircle, BarChart, Layout, Palette, Monitor 
} from 'lucide-react'

const initialState = {
  error: '',
}

// Custom Neo-Brutalist Icon Wrapper
const BrutalIcon = ({ children, bg = 'white', size = 'md' }: { children: React.ReactNode, bg?: string, size?: 'sm' | 'md' | 'lg' }) => {
  const dimension = size === 'sm' ? '28px' : size === 'md' ? '40px' : '52px'
  const borderWidth = size === 'sm' ? '2px' : '3px'
  const shadow = size === 'sm' ? '2px 2px 0px 0px black' : '4px 4px 0px 0px black'
  
  return (
    <div style={{
      background: bg,
      border: `${borderWidth} solid black`,
      width: dimension,
      height: dimension,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: shadow,
      borderRadius: size === 'lg' ? '12px' : '8px',
      color: 'black',
      flexShrink: 0
    }}>
      {children}
    </div>
  )
}

export default function LoginPinPage() {
  const [state, formAction, isPending] = useActionState(verifyPin as any, initialState)
  const [showInfo, setShowInfo] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    const mouse = { x: -1000, y: -1000 }

    const items: { x: number; y: number; s: number; vx: number; vy: number; rot: number; vrot: number; icon: string; color: string }[] = []
    const colors = ['#fde047', '#4ade80', '#38bdf8', '#f87171', '#a855f7', '#fb923c']
    const icons = ['✏️', '📖', '🎓', '💻', '📏']
    
    for (let i = 0; i < 20; i++) {
      items.push({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() * 20 + 55, 
        vx: (Math.random() - 0.5) * 0.25, 
        vy: (Math.random() - 0.5) * 0.25,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.008,
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      items.forEach(item => {
        // Mouse interaction
        const dx = item.x - mouse.x
        const dy = item.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 150) {
          const force = (150 - dist) / 150
          item.vx += (dx / dist) * force * 2
          item.vy += (dy / dist) * force * 2
        }

        item.x += item.vx
        item.y += item.vy
        
        // Add friction to stop excessive movement
        item.vx *= 0.98
        item.vy *= 0.98
        
        // Minimum movement to keep it floating
        if (Math.abs(item.vx) < 0.1) item.vx += (Math.random() - 0.5) * 0.1
        if (Math.abs(item.vy) < 0.1) item.vy += (Math.random() - 0.5) * 0.1

        item.rot += item.vrot

        if (item.x < -100) item.x = w + 100
        if (item.x > w + 100) item.x = -100
        if (item.y < -100) item.y = h + 100
        if (item.y > h + 100) item.y = -100

        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.rotate(item.rot)
        
        // Shadow
        ctx.fillStyle = 'black'
        ctx.fillRect(6, 6, item.s, item.s)
        
        // Box
        ctx.fillStyle = item.color
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 4
        ctx.fillRect(0, 0, item.s, item.s)
        ctx.strokeRect(0, 0, item.s, item.s)
        
        // Icon (Emoji)
        ctx.font = `${item.s * 0.5}px "Inter", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(item.icon, item.s/2, item.s/2)
        
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <main style={{ 
      position: 'fixed', 
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f4f4f0',
      backgroundImage: `
        linear-gradient(#00000012 1.5px, transparent 1.5px),
        linear-gradient(90deg, #00000012 1.5px, transparent 1.5px)
      `,
      backgroundSize: '40px 40px',
      overflow: 'hidden'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {/* Interactive Info Button (Bottom Center) */}
      <div style={{ 
        position: 'absolute', 
        bottom: '1.5rem', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 30, 
        display: 'flex', 
        flexDirection: 'column-reverse', 
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        pointerEvents: 'none'
      }}>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          style={{
            width: '180px',
            height: '48px',
            background: showInfo ? 'var(--danger)' : '#fde047',
            color: showInfo ? 'white' : 'black',
            border: '4px solid black',
            boxShadow: '4px 4px 0px 0px black',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'auto',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontSize: '0.8rem'
          }}
        >
          {showInfo ? <X size={20} strokeWidth={3} /> : <Sparkles size={20} strokeWidth={3} />}
          {showInfo ? 'Tutup Info' : 'Apa yang Baru?'}
        </button>

        {showInfo && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.25rem',
            width: '90%',
            maxWidth: '800px',
            animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            pointerEvents: 'auto',
            marginBottom: '0.5rem'
          }}>
            <div style={{ 
              flex: '1',
              minWidth: '280px',
              background: '#a855f7', 
              color: 'white', 
              padding: '1.25rem', 
              border: '4px solid black', 
              boxShadow: '8px 8px 0px 0px black',
              borderRadius: '20px'
            }}>
              <div style={{ background: 'black', color: 'white', padding: '0.3rem 0.8rem', display: 'inline-block', marginBottom: '1rem', border: '2px solid black' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Fitur Utama</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', fontWeight: 900, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BrutalIcon size="sm" bg="white"><Rocket size={14} strokeWidth={3} color="black" /></BrutalIcon>
                  <span>Dual Mode: GDocs & Upload</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BrutalIcon size="sm" bg="white"><MessageSquare size={14} strokeWidth={3} color="black" /></BrutalIcon>
                  <span>Ruang Diskusi Interaktif</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BrutalIcon size="sm" bg="white"><CheckCircle size={14} strokeWidth={3} color="black" /></BrutalIcon>
                  <span>Persetujuan 2 Arah</span>
                </li>
              </ul>
            </div>

            <div style={{ 
              flex: '1',
              minWidth: '280px',
              background: '#fb923c', 
              color: 'black', 
              padding: '1.25rem', 
              border: '4px solid black', 
              boxShadow: '8px 8px 0px 0px black',
              borderRadius: '20px'
            }}>
              <div style={{ background: 'black', color: 'white', padding: '0.3rem 0.8rem', display: 'inline-block', marginBottom: '1rem', border: '2px solid black' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Log Pembaruan (v1.2)</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', fontWeight: 900, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BrutalIcon size="sm" bg="white"><Sparkles size={14} strokeWidth={3} color="black" /></BrutalIcon>
                  <span>UI Neo-Brutalist Baru</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BrutalIcon size="sm" bg="white"><Layout size={14} strokeWidth={3} color="black" /></BrutalIcon>
                  <span>Perbaikan Layout & Simetri</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BrutalIcon size="sm" bg="white"><Palette size={14} strokeWidth={3} color="black" /></BrutalIcon>
                  <span>Highlight Diskusi Aktif</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
      <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', background: 'white', position: 'relative', zIndex: 10 }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Masuk dengan PIN</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-color)', opacity: 0.8 }}>
          Silakan masukkan PIN akses untuk melihat status soal UAS.
        </p>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="text"
              name="pin"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="••••••"
              className="input"
              required
              style={{ 
                textAlign: 'center', 
                letterSpacing: '0.5em', 
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
              maxLength={6}
            />
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>Masukkan 6 digit angka</p>
          </div>

          {state?.error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{state.error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={isPending}
          >
            {isPending ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '4px solid black', fontSize: '0.85rem' }}>
          <div style={{ padding: '0.6rem', background: '#fef08a', color: 'black', border: '3px solid black', borderRadius: '12px', boxShadow: '4px 4px 0px 0px black', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div className="marquee-container">
              <div className="marquee-content" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Technology Stack: <span style={{ color: 'var(--ustadz)' }}>Next.js</span> • <span style={{ color: 'var(--ustadzah)' }}>Prisma</span> • <span style={{ color: '#0ea5e9' }}>MariaDB</span> • <span style={{ color: '#6366f1' }}>TypeScript</span> • <span style={{ color: '#000' }}>NextAuth</span>
              </div>
            </div>
          </div>
          <p style={{ fontWeight: 800, opacity: 0.8 }}>Supported by <a href="#" style={{ textDecoration: 'underline', color: 'black' }}>SistemFlow</a></p>
        </div>
      </div>
    </main>
  )
}
