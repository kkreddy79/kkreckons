import type { MetadataRoute } from "next";

/** Web app manifest: lets phones add KKReckons to the home screen with its own icon and name (a one-tap daily habit). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KKReckons",
    short_name: "KKReckons",
    description: "A free daily visual briefing on AI, markets, business, India and the world.",
    start_url: "/?utm_source=homescreen",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#fbf8f1",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
