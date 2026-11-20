import Link from "@/components/Link";
import s from "@/components/Drawdowns.module.css";
import { ddBand, type Drawdowns } from "@/lib/drawdowns";

const pct = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v * 100).toFixed(1)}%`;
const BAND_CLS = [s.b0, s.b1, s.b2, s.b3];

/** On /ai-stress-index: the drawdown monitor's headline numbers and severity mix, linking to the full list. */
export default function DrawdownCard({ data }: { data: Drawdowns }) {
  const k = data.summary;
  const counts = [0, 0, 0, 0];
  data.stocks.forEach((r) => counts[ddBand(r.dd)]++);
  return (
    <div className={s.wrap}>
      <Link href="/ai-stress-index/drawdowns" className={s.card}>
        <div className={s.cardTop}>
          <h2>How far AI stocks have fallen from their peak</h2>
          <span>See all {k.count} →</span>
        </div>
        <div className={s.cardNums}>
          <div className={BAND_CLS[ddBand(k.medianDrawdown)]}><b>{pct(k.medianDrawdown)}</b><span>Median distance from peak</span></div>
          <div className={s.b1}><b>{k.down50}<small> / {k.count}</small></b><span>Down 50% or more</span></div>
          <div className={s.b3}><b>{k.down75}<small> / {k.count}</small></b><span>Down 75% or more</span></div>
          <div className={k.medianDay < 0 ? s.down : s.up}><b>{pct(k.medianDay)}</b><span>Median move on the day</span></div>
        </div>
        <div className={s.cardBar} aria-hidden="true">
          {counts.map((n, i) => n > 0 && <i key={i} className={BAND_CLS[i]} style={{ flexGrow: n }} />)}
        </div>
        <p className={s.cardNote}>A companion to the index, not part of its score: {k.count} AI-linked stocks, each measured from its own record close.</p>
      </Link>
    </div>
  );
}
