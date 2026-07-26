# Wing Fires CRM (standalone)

A completely independent CRM — its own codebase, its own database, its own
logins. Nothing here talks to Supabase or Lovable; it's a fresh Next.js app
you fully own.

**What works right now:** team login (no public sign-up), a dashboard with
lead counts, and a full Leads module — add a lead, see it in the table,
change its status, all backed by a real Postgres database.

**What's next (not built yet, on purpose):** Customers, RFQs, Quotations,
Orders, Invoices. We'll add these as working modules the same way, once this
foundation is confirmed running.

## Setup — step by step

### 1. Create your database (Neon)
1. Go to **neon.tech** → sign up (GitHub login is easiest) → "Create a project"
2. Name it `wingfires-crm`, pick a region, click Create
3. On the project dashboard, find the **connection string** (click "Connect",
   choose "Pooled connection") — it looks like
   `postgresql://user:password@host/dbname?sslmode=require`
4. Copy it — you'll need it in a minute

### 2. Put this code on GitHub
1. Create a new, empty repository on GitHub (e.g. `wingfires-crm`)
2. Upload all these files into it (drag-and-drop on GitHub's web UI works
   fine for this, or use GitHub Desktop if you have it)

### 3. Deploy to Vercel
1. Go to vercel.com → "Add New" → "Project" → import the `wingfires-crm`
   repo you just created
2. Before clicking Deploy, open "Environment Variables" and add:
   - `DATABASE_URL` = the Neon connection string from step 1
   - `NEXTAUTH_SECRET` = any long random string (generate one at
     generate-secret.vercel.app/32)
   - `NEXTAUTH_URL` = your Vercel URL, e.g. `https://wingfires-crm.vercel.app`
     (you can add this after the first deploy once you know the URL, then
     redeploy)
3. Click Deploy

### 4. Set up the database structure
This needs to be run once from your computer (Vercel doesn't run this step
automatically). If you don't have Node.js installed, download it free from
nodejs.org first.

1. Download this project's files to your computer, open a terminal in that
   folder
2. Run: `npm install`
3. Create a file named `.env` (copy `.env.example` and fill in your real
   `DATABASE_URL`, plus `ADMIN_EMAIL` and `ADMIN_PASSWORD` for your first login)
4. Run: `npx prisma db push` — this creates all the tables in Neon
5. Run: `npm run seed` — this creates your first admin login

### 5. Log in
Go to your Vercel URL, log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you
just set. You're in.

### 6. Add teammates
There's no public sign-up page on purpose. To add a teammate, repeat step 4's
seed process with their email/password (change `ADMIN_EMAIL`/`ADMIN_PASSWORD`
in `.env` first), or ask me for a small script to add users without needing
to redo the whole setup each time.

## Connecting it to your wingfires.com quotes

This CRM can automatically pull in every quote submitted on wingfires.com as
a new Lead. It only *reads* from your website's database — it never changes
anything there, so there's no risk to your live site.

1. In Vercel, on this CRM project (not your wingfires.com one), go to
   Settings → Environment Variables and add:
   - `SOURCE_SUPABASE_URL` — the same value you already set as `SUPABASE_URL`
     on your wingfires.com Vercel project
   - `SOURCE_SUPABASE_SERVICE_ROLE_KEY` — the same value you already set as
     `SUPABASE_SERVICE_ROLE_KEY` on your wingfires.com Vercel project
   - `CRON_SECRET` — any random string (generate one the same way as
     `NEXTAUTH_SECRET`)
2. Redeploy this CRM project.
3. Log in, go to the Leads page, click **"Sync quotes from website now"**.
   Every existing quote request becomes a new Lead.
4. From then on, it also syncs automatically once an hour on its own
   (via the schedule in `vercel.json`) — but the button always works too,
   any time you want the newest quotes immediately.

## If something errors during deploy
Copy the exact error text from Vercel's build log and send it to me the same
way we debugged the Vercel/Lovable site — I'll read it and tell you exactly
what to fix.
