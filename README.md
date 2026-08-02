# SecretApp 💌

A cute little web app for asking someone out. Create a pretty invitation with a
few proposed dates, send them one link, and find out exactly when they're free.
No accounts, no sign-up friction — just butterflies.

## How it works

1. **Create an invite** at `/new` — your names, a sweet message, 1–5 proposed
   date/time options (each with an optional end time and an activity such as
   🎬 movie, 🎤 concert or 🏛️ museum), and a theme.
2. **Share the link** (`/i/<slug>`) — copy it, or let the app email the invite
   for you. They open an animated envelope, tap **Yes** (confetti included),
   and pick the times that work — or suggest their own.
3. **See their answer** on your private manage page (`/manage/<secret>`), where
   you can also (re)send the invite by email.

### Themes

Blush Pink 🌸, Lavender Dream 💜, Golden Sunset 🌅, Shepherd Pup 🐕 and Ragdoll
Kitty 🐱. The pet themes come with an illustrated german shepherd / ragdoll cat
that blinks at you, plus paw-print particles and matching confetti.

Access control is via unguessable URL tokens — the public `slug` for the
invitee and the private `secret` for the creator.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Framer Motion](https://motion.dev) + canvas-confetti for the cute factor
- [Prisma](https://prisma.io) + PostgreSQL (local Postgres for dev, [Neon](https://neon.tech) in production)

## Local development

Prerequisites: Node.js 20+ and PostgreSQL running locally.

```bash
# 1. Install dependencies
npm install

# 2. Configure the database
cp .env.example .env   # then edit DATABASE_URL if needed
createdb secretapp

# 3. Apply migrations and generate the Prisma client
npx prisma migrate dev

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Hosted on [Vercel](https://vercel.com) with a [Neon](https://neon.tech)
Postgres database:

1. Import this GitHub repo into Vercel.
2. In the Vercel project, go to **Storage → Create Database → Neon** — this
   provisions Postgres and sets `DATABASE_URL` automatically.
3. Deploy. Migrations can be applied with
   `npx prisma migrate deploy` against the production `DATABASE_URL`.

Every push to `main` auto-deploys.
