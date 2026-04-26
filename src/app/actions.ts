'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function verifyPin(prevState: any, formData: FormData) {
  const pin = formData.get('pin') as string
  if (!pin) {
    return { error: 'PIN tidak boleh kosong' }
  }

  const pinSetting = await prisma.setting.findUnique({
    where: { key: 'pin' },
  })

  if (!pinSetting || pinSetting.value !== pin) {
    return { error: 'PIN tidak valid' }
  }

  const cookieStore = await cookies()
  cookieStore.set('auth_pin', 'verified', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  redirect('/')
}

export async function logoutPin() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_pin')
  redirect('/login-pin')
}
