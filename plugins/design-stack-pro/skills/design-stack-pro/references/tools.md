# Optional external tools

These are third-party tools. **Ask before installing any of them**, check the repo's README for the current command,
and pin a version. If one can't be installed, use the principles in SKILL.md and say which tool you went without.
Each installed skill or MCP server adds to every session's context, so install only what the current task needs.

| Need | Tool | Notes |
|---|---|---|
| Figma frame to code | Framelink Figma MCP (`figma-developer-mcp`), or Figma's own Dev Mode MCP server | Pass the token through the `FIGMA_API_KEY` environment variable, never on the command line. Prefer structured frame data to screenshots |
| Industry palettes and font pairings | UI UX Pro Max (`nextlevelbuilder/ui-ux-pro-max-skill`) | Use for new brands only. An existing brand's tokens take priority |
| AI-look detection and polish | Impeccable (`pbakaus/impeccable`) | Its detector can replace the manual critique pass |
| Animated React components | React Bits (`DavidHDev/react-bits`, via shadcn) | Copy in a single component; don't install the whole set |
| GSAP patterns | GSAP skills (`greensock/gsap-skills`), `npm i gsap` | Only when the project uses GSAP (see web.md) |
| Promo or launch video | HyperFrames (`heygen-com/hyperframes`) | HTML compositions rendered to MP4, using the brand tokens |
| 3D scenes and assets | Blender MCP (`ahujasid/blender-mcp`) | Needs Blender running on the user's own computer, so it won't work in a cloud session |
