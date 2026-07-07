'use client'

import { useRef, useState } from 'react'
import { t } from '@/lib/strings'
import type { House } from '@/lib/types'
import { saveHouse } from '../actions'

export default function HouseEditForm({ house }: { house: House }) {
  const [description, setDescription] = useState(house.description ?? '')
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const saveHouseForThis = saveHouse.bind(null, house.id)

  async function handleGenerate() {
    if (!formRef.current) return
    const data = new FormData(formRef.current)
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          address: data.get('address'),
          maxGuests: data.get('max_guests') ? Number(data.get('max_guests')) : undefined,
          hasPool: data.get('has_pool') === 'on',
          pricePerNight: data.get('price_per_night') ? Number(data.get('price_per_night')) : undefined,
        }),
      })
      const json = await res.json()
      if (json.description) setDescription(json.description)
    } catch {
      // keep existing description on error
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    await saveHouseForThis(formData)
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form ref={formRef} action={handleSubmit} onChange={() => setDirty(true)} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
      <Field label={t.owner.houseName} name="name" defaultValue={house.name} required />
      <Field label={t.owner.address} name="address" defaultValue={house.address ?? ''} required />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label={t.owner.maxGuests}
          name="max_guests"
          type="number"
          min={1}
          defaultValue={house.max_guests ?? ''}
          required
        />
        <Field
          label={t.owner.pricePerNight}
          name="price_per_night"
          type="number"
          min={0}
          step={0.01}
          defaultValue={house.price_per_night ?? ''}
          required
        />
      </div>
      <CheckboxField label={t.owner.hasPool} name="has_pool" defaultChecked={house.has_pool} />

      {/* Description with generate button */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{t.owner.description}</label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="text-xs font-semibold px-3 py-1 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#c8922a', color: '#fff' }}
          >
            {generating ? t.owner.generating : `✦ ${t.owner.generateDescription}`}
          </button>
        </div>
        <textarea
          name="description"
          rows={8}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
          style={{ '--tw-ring-color': '#1a3785' } as React.CSSProperties}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!dirty}
          className="flex-1 rounded-full py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1a3785' }}
        >
          {t.owner.save}
        </button>
        {saved && (
          <span className="text-sm font-medium" style={{ color: '#1e7d45' }}>
            ✓ Sačuvano
          </span>
        )}
      </div>
    </form>
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
