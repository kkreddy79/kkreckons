# design-stack-pro

A Claude Code skill for web, Android and iOS design work that doesn't depend on any one repo. Claude reads `SKILL.md` when a design task starts
and opens the files in `references/` only when it needs them. This README is for people; Claude doesn't load it.

## Use it in another repo
- **One repo:** copy this folder to `<repo>/.claude/skills/design-stack-pro/` and commit it.
- **Every repo on your own computer:** copy it to `~/.claude/skills/design-stack-pro/`.
- **Cloud sessions:** these start from the repo, so commit the folder to each repo or package it as a plugin.

Each project keeps its own tokens in `docs/design-tokens.md`, created from `references/design-tokens-template.md` the first time the skill runs there.
