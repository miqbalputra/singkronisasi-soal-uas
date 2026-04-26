import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import DeleteButton from '@/components/DeleteButton'
import StatusBadge from '@/components/StatusBadge'
import PeriodSelector from '@/components/PeriodSelector'
import SubjectRowForm from '@/components/SubjectRowForm'
import AddSubjectForm from '@/components/AddSubjectForm'
import { Suspense } from 'react'

async function addClass(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const periodId = formData.get('periodId') as string
  if (name && periodId) {
    await prisma.class.create({ data: { name, periodId } })
    revalidatePath('/admin')
  }
}

async function addPeriod(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  if (name) {
    const totalPeriods = await prisma.period.count()
    await prisma.period.create({ 
      data: { 
        name,
        isDefault: totalPeriods === 0,
        isActive: true
      } 
    })
    revalidatePath('/admin')
  }
}

async function setPeriodDefault(periodId: string) {
  'use server'
  await prisma.$transaction([
    prisma.period.updateMany({ data: { isDefault: false } }),
    prisma.period.update({ where: { id: periodId }, data: { isDefault: true, isActive: true } })
  ])
  revalidatePath('/admin')
}

async function togglePeriodActive(periodId: string, currentStatus: boolean) {
  'use server'
  await prisma.period.update({
    where: { id: periodId },
    data: { isActive: !currentStatus }
  })
  revalidatePath('/admin')
}

async function deletePeriod(periodId: string) {
  'use server'
  await prisma.period.delete({ where: { id: periodId } })
  revalidatePath('/admin')
}

async function addSubject(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const classId = formData.get('classId') as string
  const googleDocsUrl = formData.get('googleDocsUrl') as string
  const workMode = formData.get('workMode') as string || 'ONLINE'
  
  if (workMode === 'ONLINE' && !googleDocsUrl) {
    // We can't easily return errors to the form without more complex state, 
    // but we can prevent creation.
    return
  }

  if (name && classId) {
    await prisma.subject.create({
      data: { 
        name, 
        classId, 
        googleDocsUrl: workMode === 'ONLINE' ? googleDocsUrl : null,
        workMode,
        status: (workMode === 'ONLINE' && googleDocsUrl) || workMode === 'FILE' ? 'PROCESS' : 'DRAFT'
      }
    })
    revalidatePath('/admin')
  }
}

async function updateSubjectStatus(subjectId: string, status: string) {
  'use server'
  await prisma.subject.update({
    where: { id: subjectId },
    data: { status }
  })
  revalidatePath('/admin')
}

async function deleteSubject(subjectId: string) {
  'use server'
  await prisma.subject.delete({ where: { id: subjectId } })
  revalidatePath('/admin')
}

async function updateSubject(formData: FormData) {
  'use server'
  const subjectId = formData.get('subjectId') as string
  const name = formData.get('name') as string
  const googleDocsUrl = formData.get('googleDocsUrl') as string
  const workMode = formData.get('workMode') as string
  
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (subject) {
    let newStatus = subject.status
    if (workMode === 'ONLINE') {
      if (!googleDocsUrl) return // Validation

      if (googleDocsUrl && subject.status === 'DRAFT') {
        newStatus = 'PROCESS'
      } else if (!googleDocsUrl && subject.status === 'PROCESS') {
        newStatus = 'DRAFT'
      }
    } else if (workMode === 'FILE' && subject.status === 'DRAFT') {
      newStatus = 'PROCESS'
    }

    await prisma.subject.update({
      where: { id: subjectId },
      data: { 
        name, 
        googleDocsUrl: workMode === 'ONLINE' ? googleDocsUrl : null, 
        workMode, 
        status: newStatus 
      }
    })
    revalidatePath('/admin')
    revalidatePath('/')
  }
}

// Named actions for loops
async function handleSetPeriodDefault(id: string) {
  'use server'
  await setPeriodDefault(id)
}

async function handleTogglePeriodActive(id: string, active: boolean) {
  'use server'
  await togglePeriodActive(id, active)
}

async function handleDeletePeriod(id: string) {
  'use server'
  await deletePeriod(id)
}

async function handleUpdateSubjectStatus(id: string, status: string) {
  'use server'
  await updateSubjectStatus(id, status)
}

async function handleDeleteSubject(id: string) {
  'use server'
  await deleteSubject(id)
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ periodId?: string }> }) {
  const { periodId } = await searchParams
  const session = await getServerSession()
  if (!session) redirect('/admin/login')

  const periods = await prisma.period.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const defaultPeriod = periods.find(p => p.isDefault) || periods[0]
  const currentPeriodId = periodId || defaultPeriod?.id

  const classes = await prisma.class.findMany({
    where: { periodId: currentPeriodId },
    include: { subjects: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 300px' }}>
          <h2 style={{ marginBottom: '1rem', fontWeight: 600 }}>Tambah Kelas</h2>
          <form action={addClass} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input type="text" name="name" className="input" placeholder="Nama Kelas (e.g. Kelas 1)" required />
            <select name="periodId" className="input" defaultValue={currentPeriodId} required>
              {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">Tambah Kelas</button>
          </form>
        </div>

        <div className="card" style={{ flex: '1 1 300px' }}>
          <h2 style={{ marginBottom: '1rem', fontWeight: 600 }}>Tambah Periode</h2>
          <form action={addPeriod} style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" name="name" className="input" placeholder="e.g. 2024/2025 Genap" required />
            <button type="submit" className="btn btn-primary">+</button>
          </form>
          <div style={{ marginTop: '1rem', maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem' }}>
            {periods.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: p.isDefault ? 'bold' : 'normal' }}>
                  {p.name} {p.isDefault && '⭐'} {!p.isActive && '(Archived)'}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {!p.isDefault && (
                    <form action={handleSetPeriodDefault.bind(null, p.id)}>
                      <button className="btn" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>⭐</button>
                    </form>
                  )}
                  <form action={handleTogglePeriodActive.bind(null, p.id, p.isActive)}>
                    <button className="btn" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>{p.isActive ? '🔒' : '🔓'}</button>
                  </form>
                  {!p.isDefault && (
                    <form action={handleDeletePeriod.bind(null, p.id)}>
                      <button className="btn" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem', background: 'var(--danger)', color: 'white' }}>X</button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: '2 1 400px', border: '4px solid black' }}>
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase' }}>Tambah Mapel</h2>
          <AddSubjectForm classes={classes} addSubject={addSubject} />
        </div>
      </div>

      <div className="mt-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Daftar Kelas & Mapel</h2>
          <Suspense fallback={<p>Loading Filter...</p>}>
            <PeriodSelector periods={periods} currentPeriodId={currentPeriodId} label="Filter Periode:" />
          </Suspense>
        </div>
        {classes.map(cls => (
          <div key={cls.id} className="card mb-4">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{cls.name}</h3>
            <table style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem' }}>Mapel</th>
                  <th style={{ padding: '0.5rem' }}>Persetujuan</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Aksi Status</th>
                  <th style={{ padding: '0.5rem' }}>Hapus</th>
                </tr>
              </thead>
              <tbody>
                {cls.subjects.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', opacity: 0.7 }}>Belum ada mapel</td></tr>
                ) : (
                  cls.subjects.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ padding: '0.5rem' }}>
                        <SubjectRowForm sub={sub} updateSubject={updateSubject} />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        Ustadz: {sub.ustadzApproved ? '✅' : '❌'}<br />
                        Ustadzah: {sub.ustadzahApproved ? '✅' : '❌'}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <form action={async (formData) => { 
                          'use server'
                          const newStatus = formData.get('status') as string
                          await handleUpdateSubjectStatus(sub.id, newStatus) 
                        }} style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
                          <select name="status" className="input" defaultValue={sub.status} style={{ padding: '0.25rem', fontSize: '0.8rem' }}>
                            <option value="DRAFT">Belum Ada Dokumen</option>
                            <option value="PROCESS">Sedang Proses</option>
                            <option value="READY_TO_PRINT">Siap Print</option>
                            <option value="PRINTING">Proses Cetak</option>
                            <option value="PRINTED">Sudah Cetak</option>
                          </select>
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', alignSelf: 'flex-start' }}>Ubah Status</button>
                        </form>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                         <form action={handleDeleteSubject.bind(null, sub.id)}>
                            <DeleteButton text="Hapus" confirmMessage="Yakin ingin menghapus mapel ini? Semua diskusi akan hilang." />
                         </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
