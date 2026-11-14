/** The reactions a reader can leave on a story (components/Reactions.tsx, app/api/react/route.ts). */
export const REACTIONS = [
  { id: "useful", emoji: "👍", label: "Useful" },
  { id: "clap", emoji: "👏", label: "Great read" },
  { id: "wow", emoji: "😮", label: "Didn't know that" },
  { id: "doubt", emoji: "🤔", label: "Not convinced" },
] as const;

export type ReactionId = (typeof REACTIONS)[number]["id"];
