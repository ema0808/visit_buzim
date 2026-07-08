import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { t } from '@/lib/strings'
import type { House, HousePhoto, UnavailableDate } from '@/lib/types'
import AvailabilityChecker from './AvailabilityChecker'
import Navbar from '@/components/Navbar'
import PhotoGallery from '@/components/PhotoGallery'

type Props = { params: Promise<{ id: string }> }

export default async function HousePage(props: Props) {
  const { id } = await props.params
  const supabase = await createClient()

  const [houseResult, photosResult, unavailableResult] = await Promise.all([
    supabase.from('houses').select('*').eq('id', id).eq('is_published', true).single(),
    supabase.from('house_photos').select('*').eq('house_id', id).order('sort_order'),
    supabase.from('unavailable_dates').select('*').eq('house_id', id),
  ])

  if (houseResult.error || !houseResult.data) {
    notFound()
  }

  const house: House = houseResult.data
  const photos: HousePhoto[] = photosResult.data ?? []
  const unavailableDates: UnavailableDate[] = unavailableResult.data ?? []

  const photoUrls = photos.map((p) => {
    const { data } = supabase.storage.from('house-photos').getPublicUrl(p.storage_path)
    return data.publicUrl
  })

  return (
    <main className="min-h-full" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-bold" style={{ color: '#1a3785' }}>
          {house.name}
        </h1>

        {house.address && (
          <p className="mt-1 text-sm text-gray-500">{house.address}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {house.has_pool && (
            <span
              className="rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: '#1e7d45' }}
            >
              {t.house.pool}
            </span>
          )}
          {house.max_guests && (
            <span className="rounded-full bg-white border border-gray-200 px-3 py-1 text-sm text-gray-600">
              {t.house.guests(house.max_guests)}
            </span>
          )}
          {house.price_per_night && (
            <span
              className="rounded-full px-3 py-1 text-sm font-bold text-white"
              style={{ backgroundColor: '#c8922a' }}
            >
              {t.house.perNight(house.price_per_night)}
            </span>
          )}
        </div>

        <PhotoGallery urls={photoUrls} houseName={house.name} />

        {house.description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold" style={{ color: '#1a3785' }}>
              {t.house.about}
            </h2>
            <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {house.description}
            </p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold" style={{ color: '#1a3785' }}>
            {t.house.checkAvailability}
          </h2>
          <AvailabilityChecker houseId={house.id} unavailableDates={unavailableDates} />
        </div>

        <div
          className="mt-6 rounded-2xl p-6 text-white"
          style={{ backgroundColor: '#1a3785' }}
        >
          <h2 className="text-lg font-semibold">{t.house.howToBook}</h2>
          <p className="mt-2 text-blue-200 text-sm leading-relaxed">
            {t.house.howToBookBody}
          </p>
        </div>

      </div>
    </main>
  )
}
