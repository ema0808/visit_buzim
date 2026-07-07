import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Create owners row if it doesn't exist yet (email-confirmed signup path)
        const { data: existing } = await supabase
          .from('owners')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existing) {
          await supabase.from('owners').insert({
            id: user.id,
            full_name: user.user_metadata?.full_name ?? '',
            phone: user.user_metadata?.phone ?? '',
            email: user.email ?? '',
          })
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/prijava`)
}
