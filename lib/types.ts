export type House = {
  id: string
  owner_id: string
  name: string
  description: string | null
  address: string | null
  max_guests: number | null
  has_pool: boolean
  price_per_night: number | null
  is_published: boolean
  is_recommended: boolean
  created_at: string
}

export type HousePhoto = {
  id: string
  house_id: string
  storage_path: string
  sort_order: number
}

export type UnavailableDate = {
  id: string
  house_id: string
  start_date: string
  end_date: string
  note: string | null
}
