"""AI Implosion engine: fetch market data and compute the stress score, levels and bet.

Same rules as the Excel workbook (see update_dashboard.py); this version writes the
JSON that powers kkreckons.com/ai-implosion.
"""
import csv, datetime as dt, io, json, math, os, random, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
YAHOO = {"NDX": "%5ENDX", "SOX": "%5ESOX", "AIQ": "AIQ", "ORCL": "ORCL", "CRWV": "CRWV", "BIZD": "BIZD", "BKLN": "BKLN"}
LEVEL_NAMES = ["Warning", "Financing Stress", "Bubble Unwind", "AI Implosion"]


def load_config():
    with open(os.path.join(HERE, "config.json")) as f:
        return json.load(f)


# ---------------------------------------------------------------- data
BROWSER = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                         "Chrome/130.0 Safari/537.36", "Accept": "text/csv,application/json,text/plain,*/*"}
HY_CACHE = os.path.join(os.path.dirname(HERE), "data", "ai-implosion-hy.json")


def _get(url, tries=4, timeout=60):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=BROWSER)
            return urllib.request.urlopen(req, timeout=timeout).read().decode()
        except Exception as e:  # rate limits / transient errors
            last = e
            time.sleep(5 * (i + 1))
    raise RuntimeError(f"Could not fetch {url}: {last}")


FETCH_NOTES = []


def fetch_hy(start):
    """HY OAS in bp. FRED API if FRED_API_KEY is set, else the public CSV; merged into a cached
    history so a FRED outage only means the newest days carry the last value."""
    try:
        with open(HY_CACHE) as f:
            cache = {dt.date.fromisoformat(k): v for k, v in json.load(f).items()}
    except (OSError, ValueError):
        cache = {}
    fresh, err = {}, None
    key = os.environ.get("FRED_API_KEY", "").strip()
    try:
        if key:
            j = json.loads(_get("https://api.stlouisfed.org/fred/series/observations?series_id=BAMLH0A0HYM2"
                                f"&api_key={key}&file_type=json&observation_start={start}", tries=3))
            rows = [(o["date"], o["value"]) for o in j["observations"]]
        else:
            rows = list(csv.reader(io.StringIO(_get(
                f"https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2&cosd={start}", tries=3, timeout=90))))
        for d_, v in rows:
            try:
                fresh[dt.date.fromisoformat(d_)] = round(float(v) * 100)
            except (ValueError, TypeError):
                pass  # header row or "." for missing days
    except Exception as e:
        err = e
    if not fresh and not cache:
        raise RuntimeError(f"FRED HY spread unavailable and no cached history: {err}")
    if err or not fresh:
        FETCH_NOTES.append(f"FRED unavailable this run; HY spread carried from {max(cache)}")
    cache.update(fresh)
    os.makedirs(os.path.dirname(HY_CACHE), exist_ok=True)
    with open(HY_CACHE, "w") as f:
        json.dump({k.isoformat(): cache[k] for k in sorted(cache) if k >= start}, f, indent=0)
    return cache


def fetch_live(cols):
    px = {}
    for c in cols:
        if c == "HY":
            continue
        txt = None
        for host in ("query1", "query2"):
            try:
                txt = _get(f"https://{host}.finance.yahoo.com/v8/finance/chart/{YAHOO[c]}?range=2y&interval=1d")
                break
            except RuntimeError:
                continue
        if txt is None:
            raise RuntimeError(f"Yahoo Finance unavailable for {c}")
        j = json.loads(txt)["chart"]["result"][0]
        closes = j["indicators"]["quote"][0]["close"]
        px[c] = {dt.datetime.fromtimestamp(t, dt.timezone.utc).date(): (round(v, 2) if v is not None else None)
                 for t, v in zip(j["timestamp"], closes)}
    cutoff = max(px["NDX"]) - dt.timedelta(days=730)
    px["HY"] = fetch_hy(cutoff - dt.timedelta(days=10))
    dates = sorted(d for d, v in px["NDX"].items() if d >= cutoff and v is not None)
    return dates, {c: [px[c].get(d) for d in dates] for c in cols}


def sample_data(cols, end=dt.date(2026, 10, 15)):
    """Illustrative random walks with a late selloff. NOT real market data."""
    rnd = random.Random(7)
    start = end - dt.timedelta(days=730)
    dates, d = [], start
    while d <= end:
        if d.weekday() < 5:
            dates.append(d)
        d += dt.timedelta(days=1)
    n = len(dates)
    lv = {"NDX": 20200, "SOX": 5100, "AIQ": 37.5, "ORCL": 168, "CRWV": 40, "BIZD": 16.9, "BKLN": 21.1}
    vol = {"NDX": .012, "SOX": .019, "AIQ": .013, "ORCL": .02, "CRWV": .045, "BIZD": .007, "BKLN": .0018}
    drift = {"NDX": .0006, "SOX": .0007, "AIQ": .0006, "ORCL": .0008, "CRWV": .002, "BIZD": .0001, "BKLN": .00005}
    shock = {"NDX": -.12, "SOX": -.22, "AIQ": -.16, "ORCL": -.32, "CRWV": -.48, "BIZD": -.10, "BKLN": -.03}
    SH = 40
    series = {}
    for c in lv:
        v, out = lv[c], []
        for i, day in enumerate(dates):
            if c == "CRWV" and day < dt.date(2025, 3, 28):
                out.append(None)
                continue
            mu = math.log(1 + shock[c]) / SH if i >= n - SH else drift[c]
            v *= math.exp(mu + rnd.gauss(0, vol[c]))
            out.append(round(v, 2))
        series[c] = out
    hy, v = [], 310.0
    for i in range(n):
        tgt = 300 if i < n - SH else 300 + 125 * (i - (n - SH)) / SH
        v += 0.15 * (tgt - v) + rnd.gauss(0, 6)
        hy.append(None if rnd.random() < 0.03 else round(v))
    series["HY"] = hy
    return dates, {c: series[c] for c in cols}


def get_data(cfg, sample=False):
    cols = [f["col"] for f in cfg["factors"]]
    return sample_data(cols) if sample else fetch_live(cols)


# ---------------------------------------------------------------- rules
def _xround(v):  # Excel ROUND (half away from zero) for non-negative values
    return int(math.floor(v + 0.5))


def _clamp(x, calm, trig):
    return min(1.0, max(0.0, (x - calm) / (trig - calm)))


def compute(dates, series, cfg):
    F = cfg["factors"]
    n = len(dates)
    d0 = dates[0]
    # HY carry-forward (blank -> last earlier value)
    hy_eff, last = [], None
    for v in series["HY"]:
        last = v if v is not None else last
        hy_eff.append(last)

    def high52(c, i):
        lo = dates[i] - dt.timedelta(days=365)
        vals = [series[c][k] for k in range(i, -1, -1) if dates[k] >= lo and series[c][k] is not None]
        return max(vals) if vals else None

    rows = []
    for i, d in enumerate(dates):
        warm = (d - d0).days < 364
        s = {}
        for f in F:
            c = f["col"]
            if warm:
                s[c] = None
            elif f["type"] == "LVL":
                s[c] = _clamp(hy_eff[i], f["calm"], f["trigger"]) if hy_eff[i] is not None else 0.0
            else:
                v = series[c][i]
                s[c] = _clamp(v / high52(c, i) - 1, f["calm"], f["trigger"]) if v is not None else 0.0

        def pillar(p):
            fs = [f for f in F if f["pillar"] == p]
            return sum(f["weight"] * s[f["col"]] for f in fs) / sum(f["weight"] for f in fs) * 100

        if warm:
            eq = fin = cr = score = None
            L = [0, 0, 0, 0]
        else:
            eq, fin, cr = pillar("Equity"), pillar("Financing"), pillar("Credit")
            score = _xround(sum(f["weight"] * s[f["col"]] for f in F) / sum(f["weight"] for f in F) * 100)
            L = [int(score >= 50),
                 int(score >= 60 and s["BIZD"] >= 0.8 and s["BKLN"] >= 0.5),
                 int(score >= 70 and s["SOX"] >= 0.83 and s["AIQ"] >= 0.8),
                 int(score >= 75 and s["NDX"] == 1 and ((hy_eff[i] or 0) >= 500 or s["BIZD"] == 1))]
        rows.append({"date": d, "s": s, "eq": eq, "fin": fin, "cr": cr, "score": score, "L": L})

    # 5-straight-trading-day starts
    for i in range(n):
        win = rows[i:i + 5]
        rows[i]["LS"] = [int(len(win) == 5 and all(r["L"][k] for r in win)) for k in range(4)]

    latest = rows[-1]
    maxd = dates[-1]
    levels = []
    for k in range(4):
        starts = [r["date"] for r in rows if r["LS"][k]]
        levels.append({"level": f"L{k+1}", "name": LEVEL_NAMES[k],
                       "firstDate": starts[0].isoformat() if starts else None,
                       "active": n >= 5 and all(r["L"][k] for r in rows[-5:])})
    current = next((f"{lv['level']} {lv['name']}" for lv in reversed(levels) if lv["active"]), "None")
    implosion = levels[3]["firstDate"]

    def status(st):
        return "TRIGGERED" if st == 1 else "WARNING" if st >= 0.5 else "WATCH" if st > 0 else "CALM"

    def hy_band(bp):
        for lim, lab in [(300, "Very Healthy"), (400, "Normal"), (500, "Watch"), (600, "Warning"), (800, "Severe Stress")]:
            if bp < lim:
                return lab
        return "Crisis"

    factors = []
    for f in F:
        c = f["col"]
        idx = max(i for i in range(n) if series[c][i] is not None)
        cur = series[c][idx]
        window = [series[c][i] for i in range(n) if dates[i] >= maxd - dt.timedelta(days=365) and series[c][i] is not None]
        if f["type"] == "DD":
            ref = max(window); x = cur / ref - 1
            trig_px = ref * (1 + f["trigger"]); band = None
        else:
            ref = min(window); x = cur - ref
            trig_px = None; band = hy_band(cur)
        st = _clamp(x if f["type"] == "DD" else cur, f["calm"], f["trigger"])
        factors.append({"name": f["name"], "col": c, "pillar": f["pillar"], "weight": f["weight"], "type": f["type"],
                        "ref": ref, "current": cur, "move": x, "calm": f["calm"], "trigger": f["trigger"],
                        "triggerPrice": trig_px, "band": band, "stress": st, "status": status(st)})
    trig_count = sum(1 for f in factors if f["status"] == "TRIGGERED")

    score = latest["score"]
    if implosion:
        band = "IMPLOSION CONFIRMED"
    elif score is None:
        band = "WARM-UP"
    else:
        band = "NORMAL" if score < 25 else "ELEVATED" if score < 50 else "SEVERE" if score < 75 else "CRITICAL"

    today = dt.date.today()
    picks = {k: dt.date.fromisoformat(v) for k, v in cfg["bet"].items()}
    bet = []
    for who, p in picks.items():
        off = abs((dt.date.fromisoformat(implosion) - p).days) if implosion else None
        bet.append({"who": who, "pick": p.isoformat(), "daysLeft": max(0, (p - today).days), "daysOff": off})
    if not implosion:
        winner = "TBD"
    else:
        a, b = bet[0]["daysOff"], bet[1]["daysOff"]
        winner = bet[0]["who"] if a < b else bet[1]["who"] if b < a else "TIE"

    history = [{"date": r["date"].isoformat(), "equity": r["eq"], "financing": r["fin"], "credit": r["cr"], "score": r["score"]}
               for r in rows if r["date"] > maxd - dt.timedelta(days=364)]
    weekly = []
    fri = maxd - dt.timedelta(days=maxd.weekday()) + dt.timedelta(days=4)
    for w in range(26):
        end = fri - dt.timedelta(days=7 * w)
        vals = [r["score"] for r in rows if end - dt.timedelta(days=6) <= r["date"] <= end]
        sc = [v for v in vals if v is not None]
        weekly.append({"weekEnding": end.isoformat(), "high": max(sc) if sc else None})
    weekly.reverse()

    return {"asOf": maxd.isoformat(), "score": score, "band": band, "triggers": f"{trig_count} of 8",
            "currentLevel": current, "implosionDate": implosion, "levels": levels,
            "bet": bet, "winner": winner, "factors": factors, "history": history, "weekly": weekly}


def write_json(dates, series, cfg, path, sample=False):
    out = compute(dates, series, cfg)
    out["sample"] = sample
    out["notes"] = FETCH_NOTES
    out["generatedAt"] = dt.datetime.now(dt.timezone.utc).isoformat(timespec="minutes")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(out, f, indent=1)
    return out
