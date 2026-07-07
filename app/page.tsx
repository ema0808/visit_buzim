import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { t } from '@/lib/strings'
import type { House } from '@/lib/types'

export default async function HomePage() {
  const { data: houses, error } = await supabase
    .from('houses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load houses:', error.message)
  }

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 px-4 text-center relative"
        style={{
          backgroundImage: "url('/krajolik.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26, 55, 133, 0.2)' }} />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {t.home.heading}
          </h1>
          <p className="mt-3 text-blue-200 text-lg max-w-md mx-auto">
            {t.home.subtitle}
          </p>
          <div
            className="mt-8 mx-auto h-0.5 w-24 rounded-full"
            style={{ backgroundColor: '#c8922a' }}
          />
        </div>
      </section>

      {/* About */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-5" style={{ color: '#1a3785' }}>
            {t.home.aboutTitle}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">{t.home.aboutP1}</p>
          <p className="text-gray-700 leading-relaxed">{t.home.aboutP2}</p>
        </div>
      </section>

      {/* Listings */}
      <section className="flex-1 py-12 px-4" style={{ backgroundColor: '#f7f4ef' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-xl font-semibold mb-8 tracking-wide uppercase text-sm"
            style={{ color: '#1a3785' }}
          >
            {t.home.listingsHeading}
          </h2>

          {!houses || houses.length === 0 ? (
            <p className="text-gray-500">{t.home.empty}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {houses.map((house: House) => (
                <HouseCard key={house.id} house={house} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function HouseCard({ house }: { house: House }) {
  return (
    <Link
      href={`/houses/${house.id}`}
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

      <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#c8922a' }} />
    </Link>
  )
}
