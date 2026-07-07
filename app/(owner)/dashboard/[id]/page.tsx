import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { t } from '@/lib/strings'
import type { House, HousePhoto } from '@/lib/types'
import { saveHouse, uploadPhoto, deletePhoto } from '../actions'

type Props = { params: Promise<{ id: string }> }

type PhotoWithUrl = HousePhoto & { url: string }

export default async function EditHousePage(props: Props) {
  const { id } = await props.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/prijava')

  const [houseResult, photosResult] = await Promise.all([
    supabase.from('houses').select('*').eq('id', id).eq('owner_id', user.id).single(),
    supabase.from('house_photos').select('*').eq('house_id', id).order('sort_order'),
  ])

  if (houseResult.error || !houseResult.data) notFound()

  const house: House = houseResult.data
  const photos: PhotoWithUrl[] = (photosResult.data ?? []).map((p) => ({
    ...p,
    url: supabase.storage.from('house-photos').getPublicUrl(p.storage_path).data.publicUrl,
  }))

  const saveHouseForThis = saveHouse.bind(null, id)
  const uploadPhotoForThis = uploadPhoto.bind(null, id)

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← {t.owner.dashboard}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold truncate" style={{ color: '#1a3785' }}>
          {house.name}
        </h1>
      </div>

      {/* House info form */}
      <form action={saveHouseForThis} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
        <Field label={t.owner.houseName} name="name" defaultValue={house.name} required />
        <Field label={t.owner.address} name="address" defaultValue={house.address ?? ''} />
        <TextareaField label={t.owner.description} name="description" defaultValue={house.description ?? ''} />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label={t.owner.maxGuests}
            name="max_guests"
            type="number"
            min={1}
            defaultValue={house.max_guests ?? ''}
          />
          <Field
            label={t.owner.pricePerNight}
            name="price_per_night"
            type="number"
            min={0}
            step={0.01}
            defaultValue={house.price_per_night ?? ''}
          />
        </div>
        <CheckboxField label={t.owner.hasPool} name="has_pool" defaultChecked={house.has_pool} />

        <button
          type="submit"
          className="w-full rounded-full py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#1a3785' }}
        >
          {t.owner.save}
        </button>
      </form>

      {/* Photos section */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-8">
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
                  <form action={deleteForThis} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Upload form */}
        <form action={uploadPhotoForThis} className="flex items-center gap-3">
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-white file:cursor-pointer"
            style={{ '--file-bg': '#c8922a' } as React.CSSProperties}
          />
          <button
            type="submit"
            className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#c8922a' }}
          >
            {t.owner.uploadPhoto}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  ...rest
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string | number
  [key: string]: unknown
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
        style={{ '--tw-ring-color': '#1a3785' } as React.CSSProperties}
        {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    </div>
  )
}

function TextareaField({
  label,
  name,
  defaultValue,
}: {
  label: string
  name: string
  defaultValue?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue}
        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
        style={{ '--tw-ring-color': '#1a3785' } as React.CSSProperties}
      />
    </div>
  )
}

function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string
  name: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 rounded accent-[#1a3785]"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}
