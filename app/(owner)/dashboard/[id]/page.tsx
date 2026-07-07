import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { t } from '@/lib/strings'
import type { House, HousePhoto } from '@/lib/types'
import { uploadPhoto, deletePhoto, addUnavailableDate, deleteUnavailableDate } from '../actions'
import type { UnavailableDate } from '@/lib/types'
import HouseEditForm from './HouseEditForm'
import BookingCalendar from './BookingCalendar'
import PhotoUploadForm from './PhotoUploadForm'

type Props = { params: Promise<{ id: string }> }

type PhotoWithUrl = HousePhoto & { url: string }

export default async function EditHousePage(props: Props) {
  const { id } = await props.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/prijava')

  const [houseResult, photosResult, datesResult] = await Promise.all([
    supabase.from('houses').select('*').eq('id', id).eq('owner_id', user.id).single(),
    supabase.from('house_photos').select('*').eq('house_id', id).order('sort_order'),
    supabase.from('unavailable_dates').select('*').eq('house_id', id).order('start_date'),
  ])

  if (houseResult.error || !houseResult.data) notFound()

  const house: House = houseResult.data
  const photos: PhotoWithUrl[] = (photosResult.data ?? []).map((p) => ({
    ...p,
    url: supabase.storage.from('house-photos').getPublicUrl(p.storage_path).data.publicUrl,
  }))
  const dates: UnavailableDate[] = datesResult.data ?? []

  const now = new Date()
  const uploadPhotoForThis = uploadPhoto.bind(null, id)
  const addDateForThis = addUnavailableDate.bind(null, id)

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← {t.owner.dashboard}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold truncate" style={{ color: '#1a3785' }}>
          {house.name}
        </h1>
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <HouseEditForm house={house} />
        </div>

        {/* Photos section */}
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold mb-5" style={{ color: '#1a3785' }}>
          {t.owner.photos}
        </h2>

        {photos.length === 0 ? (
          <p className="text-sm text-gray-400 mb-5">{t.owner.noPhotos}</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {photos.map((photo) => {
              const deleteForThis = deletePhoto.bind(null, photo.id, id)
              return (
                <div key={photo.id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full aspect-square object-cover rounded-xl bg-gray-100"
                  />
                  <form
                    action={deleteForThis}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <button
                      type="submit"
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow"
                      style={{ backgroundColor: 'rgba(220,38,38,0.85)' }}
                    >
                      {t.owner.deletePhoto}
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}

        <PhotoUploadForm action={uploadPhotoForThis} />
        </div>
      </div>

      {/* Booked dates section */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold mb-5" style={{ color: '#1a3785' }}>
          {t.owner.bookedDates}
        </h2>

        <BookingCalendar dates={dates} initialYear={now.getFullYear()} initialMonth={now.getMonth()} />

        {dates.length === 0 ? (
          <p className="text-sm text-gray-400 mb-5">{t.owner.noBookedDates}</p>
        ) : (
          <div className="space-y-2 mb-6">
            {dates.map((d) => {
              const deleteForThis = deleteUnavailableDate.bind(null, d.id, id)
              const fmt = (s: string) =>
                new Date(s + 'T00:00:00').toLocaleDateString('bs-BA', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-800">
                      {fmt(d.start_date)} – {fmt(d.end_date)}
                    </span>
                    {d.note && (
                      <span className="ml-2 text-sm text-gray-400">{d.note}</span>
                    )}
                  </div>
                  <form action={deleteForThis}>
                    <button
                      type="submit"
                      className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                      {t.owner.deleteDate}
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}

        {/* Add date range form */}
        <form action={addDateForThis} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">{t.owner.dateFrom}</label>
            <input
              type="date"
              name="start_date"
              required
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#1a3785' } as React.CSSProperties}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">{t.owner.dateTo}</label>
            <input
              type="date"
              name="end_date"
              required
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#1a3785' } as React.CSSProperties}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-40">
            <label className="text-xs font-medium text-gray-500">{t.owner.dateNote}</label>
            <input
              type="text"
              name="note"
              placeholder="npr. Porodica Ibrić"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#1a3785' } as React.CSSProperties}
            />
          </div>
          <button
            type="submit"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1a3785' }}
          >
            + {t.owner.addBookedDate}
          </button>
        </form>
      </div>
    </div>
  )
}
