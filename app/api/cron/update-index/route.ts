import { timingSafeEqual } from "node:crypto";

// Starts the AI Stress Index's daily data update (the "Update dashboard data" workflow in
// github.com/kkreddy79/ai-implosion) on a Vercel Cron schedule (vercel.json). GitHub's own scheduled runs often
// start hours late or not at all; a workflow_dispatch from here is queued at once. Vercel calls this with
// `Authorization: Bearer <CRON_SECRET>`. GH_DISPATCH_TOKEN is a fine-grained GitHub token limited to that
// repository with Actions read and write, and nothing else.

const WORKFLOW = "https://api.github.com/repos/kkreddy79/ai-implosion/actions/workflows/update.yml/dispatches";

const json = (status: number, body: object) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function authorized(req: Request, secret: string) {
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const token = process.env.GH_DISPATCH_TOKEN;
  if (!secret || !token) return json(503, { error: "not_configured" });
  if (!authorized(req, secret)) return json(401, { error: "unauthorized" });
  const r = await fetch(WORKFLOW, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "kkreckons-cron" },
    body: JSON.stringify({ ref: "main" }),
    cache: "no-store",
  });
  // 204 means queued. Anything else is logged by Vercel with the status, and the workflow's own schedule remains.
  if (r.status !== 204) return json(502, { error: "dispatch_failed", status: r.status, detail: (await r.text()).slice(0, 300) });
  return json(200, { dispatched: "update.yml" });
}
