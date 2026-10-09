import Banner from "@/components/Banner";
import EditionView from "@/components/EditionView";
import SubscribeBox from "@/components/SubscribeBox";
import { getContent } from "@/lib/content";
import { latest } from "@/lib/editions";

export default function Home() {
  const today = getContent(latest.date);

  return (
    <main>
      <Banner />
      <div className="ev-wrap">
        <EditionView e={today} />
        <SubscribeBox variant="home" />
      </div>
    </main>
  );
}
