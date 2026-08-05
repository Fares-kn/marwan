# Graduation Guestbook

A private two-page guestbook: guests sign a simple form at `/`, and only you
can read the messages (and export them to a PDF) at `/admin`.

## How the privacy works

- Guests submit messages using Supabase's public **anon key**. A Row Level
  Security (RLS) policy on the `messages` table allows that key to `INSERT`
  only — there is no `SELECT` policy for it, so it is impossible for a guest
  to read messages back through the browser, even by inspecting the network
  tab or calling the API directly.
- `/admin` fetches messages using the **service role key**, which bypasses
  RLS. That key only ever runs on the server (inside a Server Component), so
  it's never sent to the browser.
- `/admin` itself is gated by a password, stored server-side and checked via
  a Server Action that sets an `httpOnly` cookie. There's no link to `/admin`
  anywhere in the guest-facing UI — it's just a route only you know about.

## 1. Create the Supabase project and table

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this one secret)

## 2. Configure environment variables

Copy the example file and fill in the values from the step above:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SESSION_SECRET=generate-a-long-random-string
```

Generate `ADMIN_SESSION_SECRET` with something like:

```bash
openssl rand -hex 32
```

## 3. Run locally

```bash
npm install
npm run dev
```

- Guest form: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin (enter `ADMIN_PASSWORD`)

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   the repo (the free Hobby tier is enough).
3. In **Environment Variables**, add the same five variables from your
   `.env.local`.
4. Deploy. Vercel will give you a URL — that's the link you share with
   guests. Only tell people the base URL; keep `/admin` to yourself.

## Notes on the PDF export

Each message is rendered off-screen with real HTML/CSS and rasterized with
`html2canvas`, then placed as an image into the `jsPDF` document — one image
per message, with `jsPDF` handling page breaks and drawing the header/rules
as normal vector text.

This is a deliberate choice, not the simplest option: `jsPDF`'s built-in
fonts (`helvetica`, `times`, `courier`) are the old PDF "base14" fonts,
which only cover Latin characters. Arabic (or any other complex script)
drawn directly with `doc.text()` comes out as garbled glyphs, because the
Unicode codepoints have no matching glyph in those fonts and there's no
shaping engine to join the letterforms correctly. Rendering each message
through the browser's own text engine first sidesteps both problems, since
the browser already knows how to shape and lay out Arabic correctly - the
PDF just gets a picture of that correct rendering. The header line stays as
fast vector text since it's always plain English.

## Notes on "sign once"

There's no guest login, so "once" is enforced per browser/device via a
`localStorage` flag (backed up by a plain cookie in case storage is
cleared). After a first successful submission, the same browser will always
see the "already signed" screen instead of the form - there's no button to
sign again.

This is intentionally a soft guard, not a hard one: clearing site data,
opening an incognito window, or using a different device resets it. For a
trusted graduation guestbook that's a reasonable tradeoff. If you want it
enforced harder, two options that fit without much extra complexity:

- **Per-guest invite links** - generate a unique token per invited guest
  and require it as a query param; once used, mark that token consumed in
  Supabase. Strongest, but only works if you're sending personalized links.
- **IP-based rate limiting** - reject a second submission from the same IP
  within some window, via a Supabase Edge Function. Simple, but a bad fit
  for an in-person event where many guests share one venue Wi-Fi IP address
  - it would block legitimate guests, not just repeat submissions.

## Project structure

```
app/
  page.tsx              Guest form + success screen (client component)
  i18n.ts                English/Arabic copy for the guest page
  layout.tsx, globals.css
  admin/
    page.tsx             Server Component: auth gate + data fetch
    LoginForm.tsx         Password form (shown when not authenticated)
    AdminDashboard.tsx    Message grid + PDF export (client component)
    actions.ts            Server Actions: login / logout
lib/supabase/
  client.ts              Browser client (anon key)
  server.ts              Server-only client (service role key)
supabase/
  schema.sql             Table + RLS policies
```
