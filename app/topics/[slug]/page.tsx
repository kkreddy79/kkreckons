import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicView from "@/components/TopicView";
import { TOPICS, topicBySlug, topicStories } from "@/lib/topics";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = topicBySlug((await params).slug);
  if (!topic) return {};
  const n = topicStories(topic.name).length;
  return {
    title: `${topic.name} news, explained: ${n} stories`,
    description: `${topic.blurb} Every KKReckons ${topic.name} story, with why it matters and the other side.`,
    alternates: {
      canonical: `/topics/${topic.slug}`,
      types: { "application/rss+xml": [{ url: `/topics/${topic.slug}/feed.xml`, title: `KKReckons · ${topic.name}` }] },
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const topic = topicBySlug((await params).slug);
  if (!topic) notFound();
  return <TopicView topic={topic} page={1} />;
}
