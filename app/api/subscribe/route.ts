import { BEEHIIV_PUBLICATION_ID, SITE_URL } from "@/lib/site";

// Adds a reader to the newsletter from the on-page sign-up form (components/EmailSignup.tsx).
// The beehiiv API key stays on the server; the browser only ever sends an email address.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_HOSTS = new Set([new URL(SITE_URL).host, "kkreckons.com", "localhost:3000"]);

const json = (status: number, body: object) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const key = process.env.BEEHIIV_API_KEY;
  if (!key) return json(503, { error: "not_configured" });

  // Only this site's own pages (and its Vercel previews) may post here.
  const host = URL.parse(req.headers.get("origin") ?? "")?.host ?? "";
  if (!ALLOWED_HOSTS.has(host) && !host.endsWith("-kkr-eckons.vercel.app")) return json(403, { error: "forbidden" });

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
