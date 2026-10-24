import { BEEHIIV_PUBLICATION_ID, SITE_URL } from "@/lib/site";

// Adds a reader to the newsletter from the on-page sign-up form (components/EmailSignup.tsx).
// The beehiiv API key stays on the server; the browser only ever sends an email address.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_HOSTS = new Set([new URL(SITE_URL).host, "kkreckons.com", "localhost:3000"]);
// This project's Vercel previews (kkreckons-<id>-kkr-eckons.vercel.app, kkreckons-git-<branch>-kkr-eckons.vercel.app),
// not any project whose name happens to end the same way.
const PREVIEW_HOST = /^kkreckons-[a-z0-9-]+-kkr-eckons\.vercel\.app$/;

// A brake on sign-up bombing (a script signing up strangers' addresses, each of whom gets a welcome email):
// at most 5 tries per IP and 60 in all per 10 minutes. Counts live in the function instance's memory, so they
// reset on a cold start and aren't shared between instances; a Vercel Firewall rate-limit rule on this path is
// the stronger layer. Real readers sign up once, so the limits never touch them.
const WINDOW_MS = 10 * 60 * 1000;
const PER_IP = 5;
const TOTAL = 60;
const tries = new Map<string, number[]>();

function limited(ip: string, now = Date.now()) {
  const recent = (k: string) => (tries.get(k) ?? []).filter((t) => now - t < WINDOW_MS);
  const mine = recent(ip);
  const all = recent("*");
  if (mine.length >= PER_IP || all.length >= TOTAL) return true;
  tries.set(ip, [...mine, now]);
  tries.set("*", [...all, now]);
  // Keep memory bounded: forget IPs whose window has passed.
  if (tries.size > 5000) for (const [k, v] of tries) if (v.every((t) => now - t >= WINDOW_MS)) tries.delete(k);
  return false;
}

const json = (status: number, body: object) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const key = process.env.BEEHIIV_API_KEY;
  if (!key) return json(503, { error: "not_configured" });

  // Only this site's own pages (and its Vercel previews) may post here.
  const host = URL.parse(req.headers.get("origin") ?? "")?.host ?? "";
  if (!ALLOWED_HOSTS.has(host) && !PREVIEW_HOST.test(host)) return json(403, { error: "forbidden" });

  // Vercel sets x-forwarded-for to the client's address (first entry).
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (limited(ip)) return json(429, { error: "rate_limited" });

  let body: { email?: unknown; website?: unknown; placement?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_request" });
  }
  // "website" is a field people never see; bots that fill it in get a quiet success.
  if (body.website) return json(200, { ok: true });
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) return json(400, { error: "invalid_email" });
  const placement = typeof body.placement === "string" ? body.placement.slice(0, 40) : "";
  const page = typeof body.page === "string" && body.page.startsWith("/") ? body.page.slice(0, 200) : "/";

  let res: Response;
  try {
    res = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: "kkreckons.com",
        utm_medium: "website",
        utm_campaign: placement || "inline",
        referring_site: `${SITE_URL}${page}`,
      }),
    });
  } catch (err) {
    console.error("beehiiv subscribe unreachable", err);
    return json(502, { error: "upstream" });
  }
  if (!res.ok) {
    console.error("beehiiv subscribe failed", res.status, (await res.text()).slice(0, 300));
    return json(502, { error: "upstream" });
  }
  return json(200, { ok: true });
}
