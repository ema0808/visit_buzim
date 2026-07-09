# Posjeti Bužim

A full-stack tourism and weekend-house booking platform for the town of Bužim, Bosnia and Herzegovina — built to help local property owners list their houses (with pools) and let visitors browse listings and check availability, supporting the municipality's tourism promotion efforts. This poject is live, with demo data, currenty in phase of getting first customers.

**Live site:** https://visit-buzim.vercel.app

## About the project

Bužim is a small town with around 20 privately-owned weekend houses, most with pools, that were previously only bookable through word of mouth or informal local contacts. This project, developed with support from the local mayor's office, gives owners a simple way to register their properties online and gives visitors a single place to discover what's available — while keeping the actual booking process (phone/WhatsApp/email) offline and simple for owners, with no payment processing involved.

## Features

- **Public listings** — browse all published houses with photos, descriptions, and details (guests, pool, price)
-  **Availability calendar** — see which dates are already blocked/booked per house
-  **Owner accounts** — property owners register, log in, and manage only their own listings
-  **AI-powered description generator** — owners can generate a polished listing description from basic property details, using the Claude API
-  **Row-level security** — enforced at the database level, so owners can only ever read/write their own data
-  Content in Bosnian, built for the local community and visiting tourists

## Tech stack

| Layer | Technology |
|---|---|
| Frontend & backend | [Next.js](https://nextjs.org/) (App Router, TypeScript) |
| Database, Auth, Storage | [Supabase](https://supabase.com/) (PostgreSQL) |
| Hosting | [Vercel](https://vercel.com/) |
| AI features | [Claude API](https://www.anthropic.com/) (Haiku) |
| Styling | Tailwind CSS |

### Why this stack

The project intentionally favors a low/zero-cost, low-maintenance architecture over a more "traditional" setup:

- **Supabase** was chosen over a self-hosted database or a separate Node/Express backend because it bundles Postgres, authentication, file storage, and row-level security into one managed service — no servers to patch, no auth system to build from scratch.
- **Next.js API routes** serve as the backend (they run on Node.js), avoiding the cost and complexity of hosting a second, standalone server for a project of this scale.
- Booking stays **offline by design** — owners and visitors finalize bookings directly, which avoids the complexity, liability, and cost of building/maintaining a payment system for ~20 properties.

## Database schema

Core tables: `owners`, `houses`, `house_photos`, `unavailable_dates`.

- `owners.id` references `auth.users.id` directly — no separate signup table
- `unavailable_dates` stores date *ranges*, not one row per day, keeping availability checks cheap
- Row Level Security policies ensure:
  - The public can only read houses where `is_published = true`
  - Owners can fully manage only rows where `auth.uid() = owner_id`

## Getting started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project
- An [Anthropic API key](https://console.anthropic.com/) (for the description generator)

### Setup

```bash
git clone https://github.com/<your-username>/visit-buzim.git
cd visit-buzim
npm install
```

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

```bash
npm run dev
```

## Project structure

```
app/
  (public)/         → public-facing pages (home, listings, house details)
  (owner)/          → owner registration, login, and dashboard
  api/               → API routes (e.g. AI description generation)

```

## Roadmap

- [ ] Add option for visitors to conntact owners
- [ ] Fill Home page with Bužim's promo content
- [ ] Admin review queue for publishing new listings
- [ ] Multi-language listing translation (English/German) for tourism reach
- [ ] AI-suggested nearby attractions per listing
- [ ] Automated Supabase backup job (GitHub Actions)

## Author

Built by [Ema](https://www.linkedin.com/in/ema-begulic-burzic/) — Android developer expanding into full-stack, AI-first web development.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
