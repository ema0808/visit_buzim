import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { t } from '@/lib/strings'
import type { House } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: houses } = await supabase
    .from('houses')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1a3785' }}>
          {t.owner.dashboard}
        </h1>
        <Link
          href="/dashboard/nova-kuca"
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#c8922a' }}
        >
          + {t.owner.addHouse}
        </Link>
      </div>

      {!houses || houses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500 mb-4">Još nemate nijednu kuću.</p>
          <Link
            href="/dashboard/nova-kuca"
            className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: '#1a3785' }}
          >
            {t.owner.addHouse}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {houses.map((house: House) => (
            <div
              key={house.id}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{house.name}</p>
                {house.price_per_night && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {house.price_per_night} KM / noć
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span
                  className="text-xs font-medium rounded-full px-2.5 py-1"
                  style={
                    house.is_published
                      ? { backgroundColor: '#dcfce7', color: '#166534' }
                      : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                  }
                >
                  {house.is_published ? t.owner.published : t.owner.draft}
                </span>
                <Link
                  href={`/dashboard/${house.id}`}
                  className="text-sm font-medium transition-colors"
                  style={{ color: '#1a3785' }}
                >
                  {t.owner.edit}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
