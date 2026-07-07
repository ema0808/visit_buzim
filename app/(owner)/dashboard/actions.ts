'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function createHouse(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/prijava')

  const name = String(formData.get('name') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()
  const maxGuests = formData.get('max_guests')
  const pricePerNight = formData.get('price_per_night')
  const description = String(formData.get('description') ?? '').trim()

  if (!name) return 'Naziv kuće je obavezan.'
  if (!address) return 'Adresa je obavezna.'
  if (!maxGuests) return 'Broj gostiju je obavezan.'
  if (!pricePerNight) return 'Cijena je obavezna.'
  if (!description) return 'Opis je obavezan.'

  // Ensure owners row exists — houses.owner_id has a FK to owners.id
  const { error: ownerError } = await supabase.from('owners').upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? '',
      phone: user.user_metadata?.phone ?? '',
      email: user.email ?? '',
    },
    { onConflict: 'id', ignoreDuplicates: true },
  )
  if (ownerError) {
    console.error('owners upsert error:', ownerError.message)
    return `Greška: ${ownerError.message}`
  }

  const { data: house, error } = await supabase
    .from('houses')
    .insert({
      owner_id: user.id,
      name,
      description,
      address,
      max_guests: Number(maxGuests),
      has_pool: formData.get('has_pool') === 'on',
      price_per_night: Number(pricePerNight),
      is_published: false,
    })
    .select('id')
    .single()

  if (error || !house) {
    console.error('houses insert error:', error?.message)
    return `Greška: ${error?.message ?? 'Nepoznata greška'}`
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/${house.id}`)
}

export async function saveHouse(houseId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/prijava')

  const name = String(formData.get('name') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()
  const maxGuests = formData.get('max_guests')
  const pricePerNight = formData.get('price_per_night')
  const description = String(formData.get('description') ?? '').trim()

  if (!name || !address || !maxGuests || !pricePerNight || !description) return

  await supabase
    .from('houses')
    .update({
      name,
      description,
      address,
      max_guests: Number(maxGuests),
      has_pool: formData.get('has_pool') === 'on',
      price_per_night: Number(pricePerNight),
    })
    .eq('id', houseId)
    .eq('owner_id', user.id)

  revalidatePath(`/dashboard/${houseId}`)
  revalidatePath('/dashboard')
  revalidatePath('/vikendice')
  revalidatePath(`/vikendice/${houseId}`)
}

export async function uploadPhoto(houseId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: house } = await supabase
    .from('houses')
    .select('id')
    .eq('id', houseId)
    .eq('owner_id', user.id)
    .single()
  if (!house) return

  const file = formData.get('photo') as File
  if (!file || file.size === 0) return

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${houseId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('house-photos')
    .upload(path, file, { contentType: file.type })
  if (uploadError) return

  const { data: existing } = await supabase
    .from('house_photos')
    .select('sort_order')
    .eq('house_id', houseId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = existing ? existing.sort_order + 1 : 0

  await supabase.from('house_photos').insert({
    house_id: houseId,
    storage_path: path,
    sort_order: nextOrder,
  })

  revalidatePath(`/dashboard/${houseId}`)
  revalidatePath(`/vikendice/${houseId}`)
}

export async function addUnavailableDate(houseId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: house } = await supabase
    .from('houses')
    .select('id')
    .eq('id', houseId)
    .eq('owner_id', user.id)
    .single()
  if (!house) return

  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const note = (formData.get('note') as string) || null

  if (!startDate || !endDate || endDate < startDate) return

  await supabase.from('unavailable_dates').insert({
    house_id: houseId,
    start_date: startDate,
    end_date: endDate,
    note,
  })

  revalidatePath(`/dashboard/${houseId}`)
  revalidatePath(`/vikendice/${houseId}`)
}

export async function deleteUnavailableDate(dateId: string, houseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('unavailable_dates').delete().eq('id', dateId)

  revalidatePath(`/dashboard/${houseId}`)
  revalidatePath(`/vikendice/${houseId}`)
}

export async function deletePhoto(photoId: string, houseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: photo } = await supabase
    .from('house_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single()
  if (!photo) return

  await supabase.storage.from('house-photos').remove([photo.storage_path])
  await supabase.from('house_photos').delete().eq('id', photoId)

  revalidatePath(`/dashboard/${houseId}`)
  revalidatePath(`/vikendice/${houseId}`)
}
