# AI Implosion Dashboard

Daily AI-bubble stress score (0–100) and the rule-based "AI Implosion" date that settles the KK vs SJ bet.

- **Live page:** [kkreckons.com/ai-implosion](https://www.kkreckons.com/ai-implosion) (unlinked from the nav, not indexed)
- **Excel workbook:** [/ai-implosion/AI_Implosion_Dashboard.xlsx](https://www.kkreckons.com/ai-implosion/AI_Implosion_Dashboard.xlsx)

## How it updates
`.github/workflows/ai-implosion.yml` runs every weekday at 22:17 UTC (after the US close). It runs
`update_dashboard.py`, which pulls ~2 years of daily closes from Yahoo Finance (^NDX, ^SOX, AIQ, ORCL,
CRWV, BIZD, BKLN) and the ICE BofA US High Yield OAS from FRED (BAMLH0A0HYM2, ×100 for bp), then writes:

- `data/ai-implosion.json` — read by `app/ai-implosion/page.tsx` at build time
- `public/ai-implosion/AI_Implosion_Dashboard.xlsx` — the full Excel 365 workbook (live formulas, 4 charts)

The commit triggers a Vercel redeploy. To refresh now: GitHub → Actions → *AI Implosion data* → **Run workflow**.

## Files
| File | What it is |
|---|---|
| `config.json` | Weights, Calm/Trigger thresholds and bet picks. Edit here; the next run applies them to both the page and the workbook. |
| `engine.py` | Data fetch + the scoring rules (used for the web page) |
| `update_dashboard.py` | Runs the engine and builds the Excel workbook |

## Rules
- Drawdown x = close ÷ trailing-365-day high − 1; HY uses the spread level in bp (blank days carry the last value).
- Stress = clamp((x − Calm) ÷ (Trigger − Calm), 0, 1). Status: 1 TRIGGERED, ≥0.5 WARNING, >0 WATCH, else CALM.
- Score = round(weighted stress × 100). First year of history is warm-up (no score).
- Levels must hold for 5 straight trading days:
  L1 Score ≥ 50 · L2 Score ≥ 60, BIZD ≥ 0.8, BKLN ≥ 0.5 · L3 Score ≥ 70, SOX ≥ 0.83, AIQ ≥ 0.8 ·
  L4 Score ≥ 75, NDX = 1, (HY ≥ 500bp or BIZD = 1).
- Implosion date = first day of the first L4 streak. Winner = pick closest to it (TBD until then).

## Run locally
```
pip install openpyxl
python ai-implosion/update_dashboard.py            # live data
python ai-implosion/update_dashboard.py --sample   # offline demo data
```
