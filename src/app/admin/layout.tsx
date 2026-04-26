import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { LayoutDashboard, Settings, LogOut, Home } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <div>
      {session && (
        <nav style={{ 
          background: 'white', 
          borderBottom: '4px solid black', 
          padding: '1.25rem 0', 
          marginBottom: '3rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ 
              background: 'black', 
              color: 'white', 
              padding: '0.4rem 1.25rem', 
              display: 'inline-block',
              boxShadow: '6px 6px 0px 0px #fef08a',
              border: '3px solid black'
            }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', margin: 0, lineHeight: 1 }}>
                ADMIN PANEL
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/" className="btn" style={{ background: '#fef08a', color: 'black', fontWeight: 900, textTransform: 'uppercase', padding: '0.6rem 1.25rem' }}>
                Dashboard Utama
              </Link>
              <Link href="/admin" className="btn" style={{ background: 'white', border: '3px solid black', fontWeight: 900, textTransform: 'uppercase', padding: '0.6rem 1.25rem' }}>
                Kelola Mapel
              </Link>
              <Link href="/admin/settings" className="btn" style={{ background: 'white', border: '3px solid black', fontWeight: 900, textTransform: 'uppercase', padding: '0.6rem 1.25rem' }}>
                Pengaturan
              </Link>
              <a href="/api/auth/signout" className="btn" style={{ background: 'var(--danger)', color: 'white', fontWeight: 900, textTransform: 'uppercase', padding: '0.6rem 1.25rem' }}>
                Logout
              </a>
            </div>
          </div>
        </nav>
      )}
      <div className="container">
        {children}
      </div>
    </div>
  )
}
