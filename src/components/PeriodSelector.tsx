'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function PeriodSelector({ 
  periods, 
  currentPeriodId,
  label = 'Periode:'
}: { 
  periods: { id: string, name: string, isDefault: boolean }[], 
  currentPeriodId: string,
  label?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodId', e.target.value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {label && <p style={{ fontWeight: 600, opacity: 0.8 }}>{label}</p>}
      <select 
        className="input" 
        style={{ padding: '0.25rem', width: '220px', fontWeight: 'bold' }}
        defaultValue={currentPeriodId}
        onChange={handleChange}
      >
        {periods.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} {p.isDefault ? '(Default)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
