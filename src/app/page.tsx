import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { logoutPin } from './actions'
import StatusBadge from '@/components/StatusBadge'
import PeriodSelector from '@/components/PeriodSelector'
import { 
  Settings, 
  LogOut, 
  BookOpen, 
  Printer, 
  Clock, 
  AlertCircle, 
  FileText, 
  Globe, 
  MessageSquare, 
  CheckCircle2, 
  Timer,
  LayoutDashboard,
  FileSearch,
  CheckCircle
} from 'lucide-react'

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

export default async function HomePage({ searchParams }: { searchParams: Promise<{ periodId?: string }> }) {
  const { periodId } = await searchParams

  const periods = await prisma.period.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  const defaultPeriod = periods.find(p => p.isDefault) || periods[0]
  const currentPeriodId = periodId || defaultPeriod?.id
  const currentPeriod = periods.find(p => p.id === currentPeriodId)

  const classes = await prisma.class.findMany({
    where: { periodId: currentPeriodId },
    include: {
      subjects: {
        include: {
          _count: {
            select: { comments: true }
          }
        }
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Global Statistics
  let totalSubjects = 0
  let completedSubjects = 0
  let inProcessSubjects = 0
  let draftSubjects = 0

  classes.forEach(cls => {
    cls.subjects.forEach(sub => {
      totalSubjects++
      if (['READY_TO_PRINT', 'PRINTING', 'PRINTED'].includes(sub.status)) {
        completedSubjects++
      } else if (sub.status === 'PROCESS') {
        inProcessSubjects++
      } else {
        draftSubjects++
      }
    })
  })

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 0', borderBottom: '5px solid black', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ 
            background: 'black', 
            color: 'white', 
            padding: '0.6rem 1.5rem', 
            display: 'inline-block',
            boxShadow: '6px 6px 0px 0px var(--ustadzah)',
            border: '3px solid black'
          }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>
              SINKRONISASI SOAL
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', background: 'white', border: '2px solid black', padding: '0.2rem 0.5rem', boxShadow: '2px 2px 0px 0px black' }}>
              PERIODE AKTIF
            </span>
            <PeriodSelector periods={periods} currentPeriodId={currentPeriodId} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link href="/admin" className="btn" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem' }}>
            <BrutalIcon bg="white" size="sm">
              <Settings size={18} strokeWidth={3} />
            </BrutalIcon>
            <span style={{ fontWeight: 900 }}>ADMIN</span>
          </Link>
          <form action={logoutPin}>
            <button type="submit" className="btn" style={{ background: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem' }}>
              <BrutalIcon bg="white" size="sm">
                <LogOut size={18} strokeWidth={3} />
              </BrutalIcon>
              <span style={{ fontWeight: 900 }}>KELUAR</span>
            </button>
          </form>
        </div>
      </header>

      {!currentPeriod?.isDefault && currentPeriod?.isActive && (
        <div className="card" style={{ marginBottom: '2rem', background: 'var(--warning)', padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '3px solid black' }}>
          <AlertCircle size={24} /> Anda sedang melihat Arsip Periode: {currentPeriod.name}
        </div>
      )}

      {/* Compact Global Statistics */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, background: 'white', border: '3px solid black', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', minWidth: '200px' }}>
          <BrutalIcon bg="var(--ustadz)" size="sm">
            <BookOpen size={18} color="white" strokeWidth={3} />
          </BrutalIcon>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.7, textTransform: 'uppercase' }}>Total Mapel</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>{totalSubjects}</span>
          </div>
        </div>
        <div className="card" style={{ flex: 1, background: 'var(--primary)', border: '3px solid black', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', color: 'white', minWidth: '200px' }}>
          <BrutalIcon bg="white" size="sm">
            <Printer size={18} color="var(--primary)" strokeWidth={3} />
          </BrutalIcon>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.9, textTransform: 'uppercase' }}>Siap Cetak</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>{completedSubjects}</span>
          </div>
        </div>
        <div className="card" style={{ flex: 1, background: 'var(--warning)', border: '3px solid black', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', minWidth: '200px' }}>
          <BrutalIcon bg="white" size="sm">
            <Clock size={18} color="var(--warning)" strokeWidth={3} />
          </BrutalIcon>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.9, textTransform: 'uppercase' }}>Sedang Proses</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>{inProcessSubjects}</span>
          </div>
        </div>
        <div className="card" style={{ flex: 1, background: '#e2e8f0', border: '3px solid black', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', minWidth: '200px' }}>
          <BrutalIcon bg="white" size="sm">
            <AlertCircle size={18} color="#64748b" strokeWidth={3} />
          </BrutalIcon>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.7, textTransform: 'uppercase' }}>Belum Ada Dokumen</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>{draftSubjects}</span>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem' }}>
          <h3>Belum ada data kelas</h3>
          <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>Admin belum menambahkan data kelas dan mata pelajaran.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {classes.map((cls) => (
            <section key={cls.id}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '4px solid var(--border)', display: 'inline-block', paddingBottom: '0.25rem', textTransform: 'uppercase' }}>
                {cls.name}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {cls.subjects.length === 0 ? (
                  <p style={{ opacity: 0.7, fontWeight: 600 }}>Belum ada mapel.</p>
                ) : (
                  cls.subjects.map((subject) => (
                    <Link href={`/subject/${subject.id}`} key={subject.id}>
                      <div className="card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', marginTop: '0.5rem' }}>
                        
                        {/* Last Updated Badge */}
                        <div style={{ position: 'absolute', top: '-15px', right: '-10px', background: 'white', border: '2px solid var(--border)', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, borderRadius: 'var(--radius)', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Timer size={14} /> {timeAgo(subject.updatedAt)}
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>{subject.name}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem', opacity: 0.6 }}>
                                {subject.workMode === 'FILE' ? <FileText size={12} /> : <Globe size={12} />}
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                  {subject.workMode === 'FILE' ? 'Upload File' : 'Online Docs'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: subject.ustadzApproved ? 'var(--ustadz)' : 'white', color: subject.ustadzApproved ? 'white' : 'var(--text-color)', border: '2px solid black', borderRadius: 'var(--radius)', fontWeight: 900, boxShadow: '2px 2px 0px 0px black' }}>
                              USTADZ
                            </span>
                            <span style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: subject.ustadzahApproved ? 'var(--ustadzah)' : 'white', color: subject.ustadzahApproved ? 'white' : 'var(--text-color)', border: '2px solid black', borderRadius: 'var(--radius)', fontWeight: 900, boxShadow: '2px 2px 0px 0px black' }}>
                              USTADZAH
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                          <div style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}>
                            <StatusBadge status={subject.status} />
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            background: subject._count.comments > 0 ? '#fffbeb' : 'white', 
                            border: subject._count.comments > 0 ? '3px solid black' : '2px solid black', 
                            padding: '0.2rem 0.6rem 0.2rem 0.2rem', 
                            borderRadius: '10px', 
                            boxShadow: subject._count.comments > 0 ? '4px 4px 0px 0px black' : '2px 2px 0px 0px black',
                            transition: 'all 0.2s'
                          }}>
                            <BrutalIcon bg={subject._count.comments > 0 ? 'var(--warning)' : '#f1f5f9'} size="sm">
                              <MessageSquare size={14} strokeWidth={3} fill={subject._count.comments > 0 ? 'black' : 'none'} />
                            </BrutalIcon>
                            <span style={{ 
                              fontWeight: 900, 
                              fontSize: '1rem', 
                              lineHeight: 1,
                              color: subject._count.comments > 0 ? 'black' : '#64748b'
                            }}>
                              {subject._count.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Compact Legend */}
      <div className="card" style={{ marginTop: '3rem', background: '#f8fafc', border: '3px solid black', padding: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Panduan Status Soal
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem 2rem' }}>
          {[
            { status: 'DRAFT', desc: 'Link soal belum dibuat oleh Admin' },
            { status: 'PROCESS', desc: 'Soal sedang disusun & didiskusikan' },
            { status: 'READY_TO_PRINT', desc: 'Disetujui 100%, siap untuk dicetak admin' },
            { status: 'PRINTING', desc: 'Sedang dalam antrean cetak' },
            { status: 'PRINTED', desc: 'Selesai dicetak & diamplopkan' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '180px', flexShrink: 0, display: 'flex' }}>
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <StatusBadge status={item.status as any} />
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
