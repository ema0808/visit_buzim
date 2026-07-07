'use client'

import { useState } from 'react'
import { t } from '@/lib/strings'
import type { UnavailableDate } from '@/lib/types'

type Props = {
  houseId: string
  unavailableDates: UnavailableDate[]
}

export default function AvailabilityChecker({ unavailableDates }: Props) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const result = checkAvailability(checkIn, checkOut, unavailableDates)

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          {t.availability.checkIn}
          <input
            type="date"
            value={checkIn}
            min={today()}
            onChange={(e) => setCheckIn(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#1e7d45' } as React.CSSProperties}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-600">
          {t.availability.checkOut}
          <input
            type="date"
            value={checkOut}
            min={checkIn || today()}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#1e7d45' } as React.CSSProperties}
          />
        </label>
      </div>

      {result === 'available' && (
        <p className="font-medium" style={{ color: '#1e7d45' }}>
          {t.availability.available}
        </p>
      )}
      {result === 'unavailable' && (
        <p className="font-medium text-red-600">{t.availability.unavailable}</p>
      )}
      {result === 'invalid' && (
        <p className="text-sm text-gray-400">{t.availability.invalid}</p>
      )}
    </div>
  )
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function checkAvailability(
  checkIn: string,
  checkOut: string,
  unavailableDates: UnavailableDate[],
): 'available' | 'unavailable' | 'invalid' | null {
  if (!checkIn || !checkOut) return null
  if (checkOut <= checkIn) return 'invalid'

  const overlaps = unavailableDates.some(
    (range) => range.start_date <= checkOut && range.end_date >= checkIn,
  )

  return overlaps ? 'unavailable' : 'available'
}
