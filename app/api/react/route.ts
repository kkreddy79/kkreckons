import { editions } from "@/lib/editions";
import { SITE_URL } from "@/lib/site";
import { REACTIONS } from "@/lib/reactions";

// Story reactions (components/Reactions.tsx). Counts only: one Redis hash per edition, `react:<date>`, with a
// field `<story number>:<reaction>` per count. Nothing about the reader is stored; which buttons a reader has
// pressed lives in their own browser. Redis is an Upstash store added from the Vercel Marketplace, which sets
// KV_REST_API_URL / KV_REST_API_TOKEN (or the UPSTASH_REDIS_REST_* pair). Without it the route answers 503
// and the buttons stay hidden.

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const ALLOWED_HOSTS = new Set([new URL(SITE_URL).host, "kkreckons.com", "localhost:3000"]);
const PREVIEW_HOST = /^kkreckons-[a-z0-9-]+-kkr-eckons\.vercel\.app$/;
const KINDS = new Set<string>(REACTIONS.map((r) => r.id));
const stories = new Map(editions.map((e) => [e.date, e.stories.length]));

// A brake on button-mashing scripts: 30 taps per IP per minute. In-memory per function instance, like
// /api/subscribe; a reader tapping a few buttons never comes near it.
const WINDOW_MS = 60 * 1000;
const PER_IP = 30;
const taps = new Map<string, number[]>();
function limited(ip: string, now = Date.now()) {
  const mine = (taps.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (mine.length >= PER_IP) return true;
  taps.set(ip, [...mine, now]);
  if (taps.size > 5000) for (const [k, v] of taps) if (v.every((t) => now - t >= WINDOW_MS)) taps.delete(k);
  return false;
}

const json = (status: number, body: object, cache = "no-store") => Response.json(body, { status, headers: { "Cache-Control": cache } });

async function redis(cmd: (string | number)[]) {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

/** GET /api/react?date=YYYY-MM-DD → { counts: { "<n>:<kind>": number } } */
export async function GET(req: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return json(503, { error: "not_configured" });
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!stories.has(date)) return json(400, { error: "bad_request" });
  try {
    const flat = ((await redis(["HGETALL", `react:${date}`])) as string[] | null) ?? [];
    const counts: Record<string, number> = {};
    for (let i = 0; i + 1 < flat.length; i += 2) counts[flat[i]] = Math.max(0, Number(flat[i + 1]) || 0);
    // A few seconds at the edge keeps a busy morning to a handful of Redis reads.
    return json(200, { counts }, "public, s-maxage=10, stale-while-revalidate=60");
  } catch {
    return json(502, { error: "unavailable" });
  }
}

/** POST { date, n, kind, undo? } → { count } */
export async function POST(req: Request) {
  if (!REDIS_URL || !REDIS_TOKEN) return json(503, { error: "not_configured" });
  const host = URL.parse(req.headers.get("origin") ?? "")?.host ?? "";
  if (!ALLOWED_HOSTS.has(host) && !PREVIEW_HOST.test(host)) return json(403, { error: "forbidden" });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (limited(ip)) return json(429, { error: "rate_limited" });

  let body: { date?: unknown; n?: unknown; kind?: unknown; undo?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "bad_request" });
  }
  const date = typeof body.date === "string" ? body.date : "";
  const n = typeof body.n === "number" ? body.n : 0;
  const kind = typeof body.kind === "string" ? body.kind : "";
  const max = stories.get(date) ?? 0;
  if (!max || !Number.isInteger(n) || n < 1 || n > max || !KINDS.has(kind)) return json(400, { error: "bad_request" });

  try {
    const field = `${n}:${kind}`;
    let count = Number(await redis(["HINCRBY", `react:${date}`, field, body.undo === true ? -1 : 1]));
    // An undo from a browser whose earlier tap never reached us mustn't push a count below zero.
    if (count < 0) count = Number(await redis(["HINCRBY", `react:${date}`, field, -count]));
    return json(200, { count });
  } catch {
    return json(502, { error: "unavailable" });
  }
}
