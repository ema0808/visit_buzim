import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import { t } from '@/lib/strings'
import type { House } from '@/lib/types'
import Navbar from '@/components/Navbar'
import HouseCard from '@/components/HouseCard'

export const metadata: Metadata = {
  title: t.vikendice.pageTitle,
}

export default async function VikendiceePage() {
  const supabase = await createClient()
  const { data: houses, error } = await supabase
    .from('houses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load houses:', error.message)
  }

  return (
    <main className="min-h-full" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#1a3785' }}>
          {t.vikendice.heading}
        </h1>

        {!houses || houses.length === 0 ? (
          <p className="text-gray-500">{t.vikendice.empty}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house: House) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
