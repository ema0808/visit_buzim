import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, address, maxGuests, hasPool, pricePerNight } = await request.json()

  if (!name) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const details = [
    `- Naziv: ${name}`,
    address ? `- Adresa: ${address}` : null,
    maxGuests ? `- Maks. gostiju: ${maxGuests}` : null,
    `- Bazen: ${hasPool ? 'Da' : 'Ne'}`,
    pricePerNight ? `- Cijena po noći: ${pricePerNight} KM` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Napiši kratki, privlačni opis vikend kuće za turistički portal u Bužimu, Bosna i Hercegovina. Napiši 2-3 rečenice na bosanskom jeziku koje ističu ključne karakteristike. Koristi samo latinicu. Nemoj praviti pravopisne greške. Ton treba biti topao i pozivajući.

Detalji kuće:
${details}

Napiši samo opis, bez uvoda ili zaključka.`,
      },
    ],
  })

  const description =
    message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  return Response.json({ description })
}
