import Link from 'next/link'
import { t } from '@/lib/strings'
import type { House } from '@/lib/types'

export default function HouseCard({ house }: { house: House }) {
  return (
    <Link
      href={`/vikendice/${house.id}`}
      className="group block rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-white hover:border-[#c8922a]"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-[#1a3785] transition-colors">
            {house.name}
          </h2>
          {house.has_pool && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: '#1e7d45' }}
            >
              {t.house.pool}
            </span>
          )}
        </div>

        {house.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-3 leading-relaxed">
            {house.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          {house.max_guests && (
            <span className="text-sm text-gray-400">{t.house.guests(house.max_guests)}</span>
          )}
          {house.price_per_night && (
            <span className="text-sm font-bold" style={{ color: '#c8922a' }}>
              {t.house.perNight(house.price_per_night)}
            </span>
          )}
        </div>
      </div>

      <div
        className="h-0.5 w-0 group-hover:w-full transition-all duration-300"
        style={{ backgroundColor: '#c8922a' }}
      />
    </Link>
  )
}
