import type { Metadata } from "next";
import Link from "next/link";
import Banner from "@/components/Banner";
import {
  BuildingIcon,
  BulbIcon,
  ChartIcon,
  ChipIcon,
  DocIcon,
  GlobeIcon,
  LinkIcon,
  MoonIcon,
  PeopleIcon,
  ScalesIcon,
  SunIcon,
} from "@/components/AboutIcons";
import { SUBSCRIBE_URL } from "@/lib/site";

const TITLE = "About KKReckons | Signal & Spice from Two Worlds";
const DESCRIPTION =
  "Meet KK Reddy and discover KKReckons: thoughtful briefings on AI, markets, business and global affairs, with context, evidence and perspectives beyond the headlines.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/about",
    images: [{ url: "/about/two-worlds.jpg", width: 2000, height: 816, alt: "KKReckons: India and Southern California at sunset" }],
  },
};

const BEATS = [
  { Icon: ChipIcon, title: "AI & Technology", body: "Breakthroughs, business and real-world impact." },
  { Icon: ChartIcon, title: "Markets & Economy", body: "Trends, data and what they mean." },
  { Icon: BuildingIcon, title: "Business & Companies", body: "Strategy, earnings and big moves." },
  { Icon: GlobeIcon, title: "U.S. & Global Affairs", body: "Key developments and their connections." },
  { Icon: BulbIcon, title: "Science & More", body: "Ideas and innovations shaping what’s next." },
];

const RULES = [
  { Icon: LinkIcon, text: "Every story links to its source." },
  { Icon: ScalesIcon, text: "Every story has an “other side.”" },
  { Icon: DocIcon, text: "Reporting and opinion stay separate." },
  { Icon: PeopleIcon, text: "I respect your intelligence." },
];

function Pic({ name, alt, w, h, png }: { name: string; alt: string; w: number; h: number; png?: boolean }) {
  return (
    <picture>
      <source srcSet={`/about/${name}.webp`} type="image/webp" />
      <img src={`/about/${name}.${png ? "png" : "jpg"}`} width={w} height={h} alt={alt} loading="lazy" />
    </picture>
  );
}

export default function About() {
  const today = "/";

  return (
    <main className="about">
      <Banner />

      <div className="ab-wrap">
        <section className="ab-hero" aria-labelledby="about-title">
          <p className="ab-kicker">About KKReckons</p>
          <h1 id="about-title">
            One foot in each world, <br className="ab-br" />
            and a news tab open in both.
          </h1>
          <p className="ab-lede">
            Born and raised in Southern India, now in Southern California. One of them is usually still awake.
          </p>
        </section>

        <section className="ab-dn" aria-label="By day and by night">
          <article className="ab-dn-card">
            <Pic name="day" w={880} h={372} alt="A laptop with a market chart on a desk by a window overlooking a city" />
            <div className="ab-dn-body">
              <SunIcon className="ab-dn-ic ab-sun" />
              <div>
                <p className="ab-label ab-orange">By day</p>
                <h2>Capital markets meet technology.</h2>
                <p>Where markets, companies and innovation converge.</p>
              </div>
            </div>
          </article>
          <article className="ab-dn-card">
            <Pic name="night" w={880} h={370} alt="A stack of newspapers and a mug under a desk lamp, city lights beyond" />
            <div className="ab-dn-body">
              <MoonIcon className="ab-dn-ic ab-moon" />
              <div>
                <p className="ab-label ab-purple">By night</p>
                <h2>Way too much news, so you don’t have to.</h2>
                <p>I cut through the noise and keep what matters.</p>
              </div>
            </div>
          </article>
        </section>

        <section className="ab-ways" aria-labelledby="ways-title">
          <div className="ab-ways-two">
            <p className="ab-kicker" id="ways-title">
              The internet serves news two ways
            </p>
            <div className="ab-ways-grid">
              <div className="ab-way">
                <Pic name="noodles" png w={388} h={260} alt="" />
                <h3>Instant noodles.</h3>
                <p>Fast, salty, forgotten by tomorrow.</p>
              </div>
              <div className="ab-way">
                <Pic name="books" png w={340} h={260} alt="" />
                <h3>A 40-page tasting menu.</h3>
                <p>Impressive. Nobody has the time.</p>
              </div>
            </div>
          </div>
          <div className="ab-third">
            <Pic name="cake" png w={496} h={260} alt="" />
            <h3>The third option.</h3>
            <p>
              The right slice of the world.
              <br />
              Served daily.
            </p>
          </div>
        </section>

        <section className="ab-beats" aria-labelledby="beats-title">
          <p className="ab-kicker" id="beats-title">
            What you’ll find in each edition
          </p>
          <ul>
            {BEATS.map(({ Icon, title, body }) => (
              <li key={title}>
                <span className="ab-ic-circle">
                  <Icon className="ab-ic" />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="ab-rules" aria-labelledby="rules-title">
          <p className="ab-kicker" id="rules-title">
            House rules
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
        </section>

        <section className="ab-join" aria-labelledby="join-title">
          <span className="ab-join-ic" aria-hidden>
            <SunIcon className="ab-ic" />
          </span>
          <div className="ab-join-text">
            <p className="ab-join-kicker">Today’s edition is ready</p>
            <h2 id="join-title">Read deep. Think clearly. Leave in five.</h2>
            <p>A daily visual briefing on the stories that matter: India, the world, and what’s next.</p>
          </div>
          <div className="ab-join-cta">
            <Link className="ab-btn" href={today}>
              Read Today’s Edition →
            </Link>
            <a className="ab-btn-ghost" href={SUBSCRIBE_URL} target="_blank" rel="noreferrer">
              Get it by email ↗
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
