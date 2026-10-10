import { SITE_URL } from "@/lib/site";

/** Structured data for search engines (schema.org JSON-LD). */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const AUTHOR = { "@type": "Person", name: "Krishnakanth Reddy", url: `${SITE_URL}/about` };
export const PUBLISHER = {
  "@type": "Organization",
  name: "KKReckons",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/about/two-worlds.jpg` },
};
