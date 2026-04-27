'use client'

import { useEffect } from 'react'

export default function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service worker registered'))
        .catch((err) => console.log('Service worker registration failed', err))
    }
  }, [])

  return null
}
