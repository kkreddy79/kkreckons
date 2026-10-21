/* Where the AI Stress Index data lives: GitHub Pages first, then the raw file on GitHub when github.io
   can't be reached (Pages outage, or a network that blocks github.io). Both serve the same docs/ files.
   Shared by the server render and the browser fallback, so it must stay free of "use client". */
export const STRESS_BASES = ["https://kkreddy79.github.io/ai-implosion", "https://raw.githubusercontent.com/kkreddy79/ai-implosion/main/docs"];
