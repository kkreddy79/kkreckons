import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import Banner from "@/components/Banner";
import SubscribeBox from "@/components/SubscribeBox";
import { CORRECTIONS_EMAIL } from "@/lib/site";
import { editions, getEdition, longDate, slugFor } from "@/lib/editions";

/**
 * "Was today's briefing useful?" answers (from the email and the end of each edition). Each answer is its
 * own static page, so Vercel page views and beehiiv's link clicks count the votes: /feedback/<edition>/<vote>.
 */
const VOTES = {
  yes: { title: "Glad it helped.", line: "Thanks for telling me. Know someone who’d like it too? Send them today’s edition." },
  somewhat: { title: "Thanks, noted.", line: "What would have made it more useful? A one-line reply helps me pick better stories." },
  no: { title: "Thanks for being straight with me.", line: "What missed the mark: the stories, the length, or the graphics? A one-line reply helps me fix it." },
} as const;
type Vote = keyof typeof VOTES;

export const dynamicParams = false;
export const generateStaticParams = () => editions.flatMap((e) => Object.keys(VOTES).map((vote) => ({ slug: slugFor(e.date), vote })));
export const metadata: Metadata = { title: "Thanks for your feedback", robots: { index: false, follow: false } };

export default async function Feedback({ params }: { params: Promise<{ slug: string; vote: string }> }) {
  const { slug, vote } = await params;
  const found = getEdition(slug);
  if (!found || !(vote in VOTES)) notFound();
  const v = VOTES[vote as Vote];
  const date = longDate(found.edition.date);
  return (
    <main className="cu">
      <Banner />
      <div className="cu-wrap">
        <section className="cu-hero" aria-labelledby="fb-title">
          <p className="ab-kicker">Your feedback · {date}</p>
          <h1 id="fb-title">{v.title}</h1>
          <p className="cu-lede">{v.line}</p>
          <p className="tp-more">
            <Link href={`/daily/${slug}`}>Back to the {date} edition →</Link>
            {vote !== "yes" && CORRECTIONS_EMAIL && (
              <>
                {" "}· Reply to the email, or write to <span className="fb-mail">{CORRECTIONS_EMAIL}</span>
              </>
            )}
          </p>
        </section>
        <SubscribeBox />
      </div>
    </main>
  );
}
