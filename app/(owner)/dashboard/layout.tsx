import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-server'
import { t } from '@/lib/strings'
import LogoutButton from './LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/prijava')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/buzim-grb.png" alt="Bužim" width={28} height={32} />
              <span className="font-bold text-sm" style={{ color: '#1a3785' }}>
                Posjeti Bužim
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t.owner.dashboard}
            </Link>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">{children}</div>
    </div>
  )
}
