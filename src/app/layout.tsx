import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sinkronisasi Soal UAS',
  description: 'Sistem Sinkronisasi & Persetujuan Soal UAS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <main className="container" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
