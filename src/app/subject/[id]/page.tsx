import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { addComment, toggleApproval } from './actions'
import CommentForm from '@/components/CommentForm'
import DocsViewer from '@/components/DocsViewer'
import FileManager from '@/components/FileManager'
import StatusBadge from '@/components/StatusBadge'
import ApprovalButtons from '@/components/ApprovalButtons'
import ChatBox from '@/components/ChatBox'

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      class: true,
      comments: {
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
      }
    },
  })

  if (!subject) return notFound()

  const isLocked = subject.status === 'PRINTING' || subject.status === 'PRINTED'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '100vh', padding: '1rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-block', marginBottom: '0.5rem' }}>&larr; Kembali ke Beranda</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{subject.name} - {subject.class.name}</h1>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <StatusBadge status={subject.status} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', background: '#f1f5f9', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }}>
              MODE: {subject.workMode === 'FILE' ? '📁 UPLOAD FILE' : '🌐 ONLINE'}
            </span>
          </div>
        </div>
        
        <ApprovalButtons 
          subjectId={subject.id}
          ustadzApproved={subject.ustadzApproved}
          ustadzahApproved={subject.ustadzahApproved}
          isLocked={isLocked}
          onToggle={async (role) => {
            'use server'
            await toggleApproval(subject.id, role)
          }}
        />
      </header>

      {/* Main Content: DocsViewer OR FileManager */}
      <div style={{ flex: 1, position: 'relative', marginTop: '1rem', marginBottom: '1rem', minHeight: 0 }}>
        {subject.workMode === 'FILE' ? (
          <FileManager 
            subjectId={subject.id} 
            attachments={subject.attachments} 
            isLocked={isLocked} 
          />
        ) : (
          <DocsViewer url={subject.googleDocsUrl} title={subject.name} />
        )}
      </div>

      {/* Floating ChatBox */}
      <ChatBox 
        comments={subject.comments} 
        subjectId={subject.id} 
        submitAction={async (formData) => {
          'use server'
          const sender = formData.get('sender') as string
          const content = formData.get('content') as string
          if (!content) return
          await addComment(subject.id, sender, content)
        }} 
      />
    </div>
  )
}

