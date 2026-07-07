import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { t } from '@/lib/strings'
import type { House } from '@/lib/types'
import HouseCard from '@/components/HouseCard'

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
          <Link
            href="/vikendice"
            className="mt-8 inline-block rounded-full px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#c8922a' }}
          >
            {t.home.ctaButton}
          </Link>
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
