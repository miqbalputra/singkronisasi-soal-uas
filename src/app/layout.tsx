import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWARegistration from '@/components/PWARegistration'

export const metadata: Metadata = {
  title: 'Sync Soal UAS GQ',
  description: 'Sistem Sinkronisasi & Persetujuan Soal UAS',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sync Soal GQ',
  },
}

export const viewport: Viewport = {
  themeColor: '#4ade80',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <PWARegistration />
        <main className="container" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
