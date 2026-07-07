'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import { t } from '@/lib/strings'
import { createHouse } from '../actions'

export default function NovaKucaPage() {
  const [error, formAction, pending] = useActionState(createHouse, null)
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

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
      else setDescription(t.owner.generateError)
    } catch {
      setDescription(t.owner.generateError)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← {t.owner.dashboard}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold" style={{ color: '#1a3785' }}>
          {t.owner.addHouse}
        </h1>
      </div>

      <form ref={formRef} action={formAction} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
        <Field label={t.owner.houseName} name="name" required />
        <Field label={t.owner.address} name="address" required />
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.owner.maxGuests} name="max_guests" type="number" min="1" required />
          <Field label={t.owner.pricePerNight} name="price_per_night" type="number" min="0" step="0.01" required />
        </div>
        <CheckboxField label={t.owner.hasPool} name="has_pool" />

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

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#1a3785' }}
        >
          {pending ? '...' : `${t.owner.addHouse} →`}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
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
        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
        style={{ '--tw-ring-color': '#1a3785' } as React.CSSProperties}
        {...rest}
      />
    </div>
  )
}

function CheckboxField({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" name={name} className="w-4 h-4 rounded accent-[#1a3785]" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}
