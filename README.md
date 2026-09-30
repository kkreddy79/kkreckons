# KKReckons

**Read deep. Think clearly.**

Mobile-first editorial site for KK Reddy's visual daily briefings.

## Stack
- Next.js 16
- React 19
- Vercel
- Firebase foundation planned for the publishing/admin layer
- Cloudflare remains the domain/DNS provider

## Routes
- `/` — home
- `/daily/` — archive
- `/daily/september-30-2026` — sample daily edition
- `/admin` — publishing dashboard foundation

## Deploy
Import this repository into Vercel. Vercel should auto-detect Next.js and the default root directory/build settings. No environment variables are required for this first visual deployment.

After the site is live, Firebase authentication/database/storage can be connected in a separate step.
