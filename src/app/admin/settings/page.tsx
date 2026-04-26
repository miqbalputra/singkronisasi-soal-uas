import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function updatePin(formData: FormData) {
  'use server'
  const pin = formData.get('pin') as string
  if (pin && pin.length >= 4) {
    await prisma.setting.upsert({
      where: { key: 'pin' },
      update: { value: pin },
      create: { key: 'pin', value: pin },
    })
    revalidatePath('/admin/settings')
  }
}

async function updatePassword(formData: FormData) {
  'use server'
  const newPassword = formData.get('password') as string
  if (newPassword && newPassword.length >= 6) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({
      where: { username: 'admin' },
      data: { password: hashedPassword }
    })
  }
}

export default async function SettingsPage() {
  const session = await getServerSession()
  if (!session) redirect('/admin/login')

  const pinSetting = await prisma.setting.findUnique({ where: { key: 'pin' } })

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div className="card" style={{ flex: 1, minWidth: '300px' }}>
        <h2 style={{ marginBottom: '1rem', fontWeight: 600 }}>Ubah PIN Publik</h2>
        <p style={{ opacity: 0.8, marginBottom: '1rem', fontSize: '0.9rem' }}>
          PIN saat ini: <strong>{pinSetting?.value || 'Belum diatur'}</strong>
        </p>
        <form action={updatePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            name="pin" 
            className="input" 
            placeholder="Masukkan PIN baru" 
            required 
            minLength={4}
          />
          <button type="submit" className="btn btn-primary">Simpan PIN</button>
        </form>
      </div>

      <div className="card" style={{ flex: 1, minWidth: '300px' }}>
        <h2 style={{ marginBottom: '1rem', fontWeight: 600 }}>Ubah Password Admin</h2>
        <form action={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="password" 
            name="password" 
            className="input" 
            placeholder="Password baru (min 6 karakter)" 
            required 
            minLength={6}
          />
          <button type="submit" className="btn btn-primary">Simpan Password</button>
        </form>
      </div>
    </div>
  )
}
