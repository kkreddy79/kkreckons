// Daily check that the live site works (run by .github/workflows/uptime.yml; a failure emails the repo owner).
// Usage: node scripts/uptime.mjs [https://www.kkreckons.com]
const SITE = process.argv[2] || "https://www.kkreckons.com";
const problems = [];
const get = async (path, opts = {}) => {
  try {
    return await fetch(SITE + path, { redirect: "follow", headers: { "user-agent": "KKReckons uptime check" }, ...opts });
  } catch (e) {
    problems.push(`${path}: request failed (${e.message})`);
    return null;
  }
};

// 1. Key pages load and look like themselves.
for (const [path, must] of [
  ["/", "Today in 30 seconds"],
  ["/daily/", "Catch up"],
  ["/week", "The week in"],
  ["/ai-stress-index", "AI"],
]) {
  const r = await get(path);
  if (!r) continue;
  if (!r.ok) problems.push(`${path}: HTTP ${r.status}`);
  else if (!(await r.text()).includes(must)) problems.push(`${path}: loaded but doesn't contain "${must}"`);
}

// 2. Sitemaps and feed are valid XML with entries.
for (const [path, tag] of [
  ["/sitemap.xml", "<url>"],
  ["/news-sitemap.xml", "<urlset"],
  ["/feed.xml", "<item>"],
]) {
  const r = await get(path);
  if (r && (!r.ok || !(await r.text()).includes(tag))) problems.push(`${path}: HTTP ${r.status} or missing ${tag}`);
}

// 3. The newest edition linked from Home opens.
const home = await (await get("/"))?.text();
const latest = home?.match(/href="(\/daily\/[a-z]+-\d+-\d{4})"/)?.[1];
if (latest) {
  const r = await get(latest);
  if (r && !r.ok) problems.push(`${latest} (newest edition): HTTP ${r.status}`);
}

// 4. AI Stress Index data is fresh (rebuilt every weekday; 4 days covers a long weekend).
const dr = await get("/ai-stress-index/data.json");
if (dr?.ok) {
  try {
    const d = await dr.json();
    const age = (Date.now() - new Date(d.generatedAt).getTime()) / 864e5;
    if (!(age < 4)) problems.push(`AI Stress Index data is ${age.toFixed(1)} days old (generatedAt ${d.generatedAt})`);
  } catch {
    problems.push("/ai-stress-index/data.json isn't valid JSON");
  }
} else if (dr) problems.push(`/ai-stress-index/data.json: HTTP ${dr.status}`);

// 5. The bare domain sends readers (and search engines) to www with a permanent redirect.
const apex = SITE.replace("://www.", "://");
if (apex !== SITE) {
  try {
    const r = await fetch(apex + "/", { redirect: "manual" });
    const to = r.headers.get("location") || "";
    if (![301, 308].includes(r.status) || !to.startsWith(SITE)) problems.push(`${apex} should permanently redirect (301/308) to ${SITE}; got ${r.status} → ${to || "nothing"}`);
  } catch (e) {
    problems.push(`${apex}: request failed (${e.message})`);
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) on ${SITE}:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`✓ ${SITE} is up: pages, sitemaps, feed, newest edition, Stress Index data and the www redirect all check out.`);
