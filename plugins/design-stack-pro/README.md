# design-stack-pro

A Claude Code plugin for web, Android and iOS design work that doesn't depend on any one repo. Claude reads `skills/design-stack-pro/SKILL.md`
when a design task starts and opens the files in `references/` only when it needs them. This README is for people; Claude doesn't load it.

## Install

    /plugin install design-stack-pro --marketplace kkreddy79/kkreckons

To turn it on for everyone who works in a repo, including cloud sessions, add this to the repo's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "kk-plugins": { "source": { "source": "github", "repo": "kkreddy79/kkreckons" } }
  },
  "enabledPlugins": { "design-stack-pro@kk-plugins": true }
}
```

**Cloud sessions (claude.ai/code) don't install plugins that a repo turns on**, so for those add these lines to the cloud environment's
setup script (the environment menu in the session's title bar, then Edit, then Setup script). Every repo in that environment then gets the plugin:

```bash
claude plugin marketplace add kkreddy79/kkreckons || true
claude plugin install design-stack-pro@kk-plugins --scope user || true
```

## Update

Edit the files here, bump `version` in `.claude-plugin/plugin.json` and in the marketplace entry, and merge. Every repo picks up the change
on its next session (or `/plugin marketplace update kk-plugins`).

Each project keeps its own tokens in `docs/design-tokens.md`, created from `skills/design-stack-pro/references/design-tokens-template.md`
the first time the skill runs there.
