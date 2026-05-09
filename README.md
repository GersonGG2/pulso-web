# pulso-web

Next.js web client for Pulso — the meritocratic esports platform for League of Legends in Latin America.

Stack: Next.js 15 · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Lucide icons

## Requirements

- Node.js >= 20
- pnpm >= 9
- `pulso-backend` running on `localhost:3000` for full functionality

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Site runs at `http://localhost:3001`.

## Routes

| Path | Source |
|---|---|
| `/` | Landing pública (hero + value props + waitlist) |
| `/leaderboard` | `GET /players/leaderboard` |
| `/tournaments` | `GET /tournaments` |
| `/t/[slug]` | `GET /tournaments/by-slug/:slug` + bracket |
| `/players/[username]` | `GET /users/by-username/:username` |

## Stack notes

- **Tailwind v4** with `@theme` directive in `globals.css` (no `tailwind.config.ts`).
- **shadcn/ui** components live in `src/components/ui/`, configured for the New York style and CSS variables.
- **Server Components** for all data-fetching (`apiGet` uses Next.js fetch cache, 30s default).
- **Client components** only where interactivity is needed (waitlist form, future auth).

## Authentication (Clerk)

Public routes work without setup. To unlock `/dashboard`, `/sign-in`, `/sign-up`:

1. Create a free Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Copy the keys into `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Restart `pnpm dev`

When the keys are missing, private routes show a friendly setup card instead
of crashing. The middleware degrades to a no-op.

## Pending (next sprints)

- Riot account linking flow on web
- Tournament registration UI
- Live bracket via WebSocket
- Subscriptions (Pro Player upsell)

## License

UNLICENSED — Private. © 2026 Pulso.
