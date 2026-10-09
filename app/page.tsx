import Link from "next/link";
import Banner from "@/components/Banner";
import EditionView from "@/components/EditionView";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { latest, slugFor } from "@/lib/editions";

export default function Home() {
  const today = getContent(latest.date);

  return (
    <main>
      <Banner />
      <div className="ev-wrap">
        <EditionView e={today} />

        <p className="ev-permalink">
          <Link href={`/daily/${slugFor(latest.date)}`}>Permanent link to this edition</Link>
          <span aria-hidden> · </span>
          <a href={`/editions/${latest.date}.html`} target="_blank" rel="noreferrer">
            Original newsletter design ↗
          </a>
        </p>

        <SubscribeBox />
      </div>
    </main>
  );
}
