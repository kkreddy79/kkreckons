import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicView from "@/components/TopicView";
import { TOPICS, topicBySlug, topicHref, topicPageCount } from "@/lib/topics";

// Page 2 onwards of a topic (page 1 is /topics/<slug>); built for every page that has stories.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.flatMap((t) => Array.from({ length: topicPageCount(t.name) - 1 }, (_, i) => ({ slug: t.slug, n: String(i + 2) })));
}

type Props = { params: Promise<{ slug: string; n: string }> };

async function resolve(params: Props["params"]) {
  const { slug, n } = await params;
  const topic = topicBySlug(slug);
  const page = Number(n);
  if (!topic || !Number.isInteger(page) || page < 2 || page > topicPageCount(topic.name)) return null;
  return { topic, page };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  return {
    title: `${r.topic.name} news, explained: page ${r.page}`,
    description: `${r.topic.blurb} Older KKReckons ${r.topic.name} stories, page ${r.page} of ${topicPageCount(r.topic.name)}.`,
    alternates: { canonical: topicHref(r.topic.slug, r.page) },
  };
}

export default async function TopicPageN({ params }: Props) {
  const r = await resolve(params);
  if (!r) notFound();
  return <TopicView topic={r.topic} page={r.page} />;
}
