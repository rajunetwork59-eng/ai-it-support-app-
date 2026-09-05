# AI IT Support Assistant (Demo)

AI-powered IT support chatbot demo for TechNova Solutions — built with Next.js, Google Gemini API, and Supabase. All free tiers, no credit card.

## What it does
- Users sign up / log in with email + password (Supabase Auth)
- Each user describes an IT issue in a chat box
- Gemini AI classifies it (category + priority) and decides if it can be auto-resolved
- Ticket is saved to Supabase, tagged with that user's account
- A dashboard shows ticket volume, automation rate, and category breakdown — only for the logged-in user's own tickets (enforced by database-level Row Level Security, not just app logic)

## Setup (run this on your own laptop)

1. **Install Node.js** (v18+) if you don't have it: https://nodejs.org

2. **Unzip this project**, then open a terminal inside the folder and run:
   ```
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.local.example` to a new file named `.env.local`
   - Fill in your `GEMINI_API_KEY` (from https://aistudio.google.com/app/apikey)
   - Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from your Supabase project → Settings → API)

4. **Set up the database table**:
   - Go to your Supabase project → SQL Editor → New query
   - Paste the contents of `supabase_schema.sql` and click Run

5. **Add per-user security (if upgrading from the earlier version)**:
   - In the same SQL Editor, run `supabase_migration_auth.sql`
   - This adds a `user_id` column and restricts each user to only see their own tickets
   - In Supabase → Authentication → Providers, make sure Email is enabled. For quick local testing, you can disable "Confirm email" under Authentication → Settings so new accounts can log in immediately.

5. **Run the app locally**:
   ```
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

## Deploy for free (Vercel)

1. Push this project to a GitHub repository (e.g. `ai-it-support-app`)
2. Go to https://vercel.com → "Add New Project" → import your GitHub repo
3. In Vercel's project settings, add the same 3 environment variables from your `.env.local`
4. Click Deploy — you'll get a live link like `ai-it-support-app.vercel.app`

## Project structure
```
app/
  page.js               → chatbot UI (home page)
  dashboard/page.js      → KPI dashboard
  api/classify/route.js  → calls Gemini API to classify tickets
  api/tickets/route.js   → saves/reads tickets from Supabase
lib/supabaseClient.js    → Supabase client setup
supabase_schema.sql      → run this in Supabase to create the tickets table
```
