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
  if (!name) return 'Naziv kuće je obavezan.'

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
      description: (formData.get('description') as string) || null,
      address: (formData.get('address') as string) || null,
      max_guests: formData.get('max_guests') ? Number(formData.get('max_guests')) : null,
      has_pool: formData.get('has_pool') === 'on',
      price_per_night: formData.get('price_per_night')
        ? Number(formData.get('price_per_night'))
        : null,
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
  if (!name) return

  await supabase
    .from('houses')
    .update({
      name,
      description: (formData.get('description') as string) || null,
      address: (formData.get('address') as string) || null,
      max_guests: formData.get('max_guests') ? Number(formData.get('max_guests')) : null,
      has_pool: formData.get('has_pool') === 'on',
      price_per_night: formData.get('price_per_night')
        ? Number(formData.get('price_per_night'))
        : null,
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
