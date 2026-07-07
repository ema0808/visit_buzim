'use client'

import { useEffect, useState } from 'react'
import type { UnavailableDate } from '@/lib/types'

const WEEKDAYS = ['P', 'U', 'S', 'Č', 'P', 'S', 'N']
const MONTHS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isBooked(iso: string, dates: UnavailableDate[]): boolean {
  return dates.some((d) => d.start_date <= iso && iso <= d.end_date)
}

export default function BookingCalendar({
  dates,
  initialYear,
  initialMonth,
}: {
  dates: UnavailableDate[]
  initialYear: number
  initialMonth: number
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [todayISO, setTodayISO] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    setTodayISO(toISO(now.getFullYear(), now.getMonth(), now.getDate()))
  }, [])

  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7

  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDayOfWeek + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg leading-none"
        >
          ‹
        </button>
        <span className="text-sm font-semibold" style={{ color: '#1a3785' }}>
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg leading-none"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const iso = toISO(year, month, day)
          const booked = isBooked(iso, dates)
          const isToday = iso === todayISO
          return (
            <div
              key={i}
              className={[
                'flex items-center justify-center text-xs h-8 w-8 mx-auto rounded-full',
                booked
                  ? 'bg-red-100 text-red-700 font-semibold'
                  : isToday
                  ? 'ring-1 ring-gray-400 text-gray-700'
                  : 'text-gray-600',
              ].join(' ')}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
