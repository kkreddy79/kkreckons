import Link from "@/components/Link";
import { longDate } from "@/lib/editions";
import { specialHref, type SpecialReport } from "@/lib/special";

/** Date, reading time and themes under a report's title. */
export function SpecialMeta({ r }: { r: SpecialReport }) {
  return (
    <ul className="sp-meta" aria-label="About this report">
      <li>
        <time dateTime={r.date}>{longDate(r.date).replace(/^\w+, /, "")}</time>
      </li>
      <li>{r.reading_minutes} min read</li>
      {r.themes.map((t) => (
        <li key={t}>
          <span className="sp-theme">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** One report on the hub or in the "More special reports" strip. The whole card is the link. */
export function SpecialCard({ r, as: H = "h3" }: { r: SpecialReport; as?: "h2" | "h3" }) {
  return (
    <li>
      <Link href={specialHref(r)} className="sp-card">
        {r.cover && <img src={r.cover} alt={r.cover_alt || ""} width={1600} height={900} loading="lazy" decoding="async" />}
        <span className="sp-card-body">
          <span className="sp-lab sp-kicker">{r.kicker}</span>
          <H>{r.title}</H>
          <p>{r.dek}</p>
          <SpecialMeta r={r} />
          <span className="sp-go">Read the report →</span>
        </span>
      </Link>
    </li>
  );
}

/** The city skyline at the foot of a navy band (the same drawing as the reports' heroes). */
export function Skyline() {
  return (
    <svg className="sp-sky" viewBox="0 0 1200 150" preserveAspectRatio="none" aria-hidden="true">
      <path fill="#0F1924" opacity=".55" d="M0 150V96h60V70h36v26h40V58h28v38h52V80h34v16h70V48h22l8-18 8 18h20v48h56V76h44v20h60V62h30v34h48V84h56V54h26v42h66V72h40v24h58V60h34v36h50V82h70v14h64V66h28v30h60V88h42v62z" />
      <path fill="#0B131C" d="M0 150v-30h80v-18h50v18h66v-26h30v26h90v-14h48v14h72v-32h36v32h84v-20h56v20h90v-28h40v28h70v-16h62v16h88v-24h34v24h70v-12h54v12h80v30z" />
      <circle cx="1040" cy="40" r="22" fill="#F0B840" opacity=".5" />
    </svg>
  );
}
