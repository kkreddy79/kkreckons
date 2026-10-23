import { DocIcon, LinkIcon, PeopleIcon, ScalesIcon } from "@/components/AboutIcons";
import { CORRECTIONS_EMAIL, correctionsHref } from "@/lib/site";

const RULES = [
  { Icon: LinkIcon, text: "Every story links to its source." },
  { Icon: ScalesIcon, text: "Every story has an “other side.”" },
  { Icon: DocIcon, text: "Reporting and opinion stay separate." },
  { Icon: PeopleIcon, text: "I respect your intelligence." },
];

const STANDARDS = [
  "Opinion and explainer pieces are labelled as such; everything else is reporting from the linked source.",
  "Sources that may need a subscription carry a small lock, so you know before you click.",
  "Summaries stay short and quotes brief, so the original is still worth reading.",
  "Graphics are original to KKReckons or used under licence, and each one is credited.",
  "KKReckons graphics are © KKReckons. Share them freely with credit and a link to kkreckons.com; please don't edit, rebrand or resell them.",
  "The AI Stress Index publishes its method, thresholds, sources and model changes on its page.",
  "Nothing here is financial, legal or career advice.",
];

/** House rules, editorial standards and the corrections note: on About and on /standards. */
export default function EditorialStandards() {
  return (
    <section className="ab-rules" id="standards" aria-labelledby="rules-title">
      <p className="ab-kicker" id="rules-title">
        Editorial standards &amp; corrections
      </p>
      <ul>
        {RULES.map(({ Icon, text }) => (
          <li key={text}>
            <span className="ab-ic-circle">
              <Icon className="ab-ic" />
            </span>
            <p>{text}</p>
          </li>
        ))}
      </ul>
      <ul className="ab-std">
        {STANDARDS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {CORRECTIONS_EMAIL && (
        <p className="ab-fix">
          Mistakes happen. If you spot one, <a href={correctionsHref("KKReckons")}>email us</a>; we fix it on the
          site and note material corrections in that edition.
        </p>
      )}
    </section>
  );
}
