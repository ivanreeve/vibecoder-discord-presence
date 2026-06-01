# vibecoder-discord-presence

Show your Claude Code activity on your Discord profile as Rich Presence — the
way Discord shows what you're playing or listening to. Privacy-first by default,
fully themeable, and it gets out of your way.

> Command: `vdp` · Package: `vibecoder-discord-presence`

## Status

Early development. The architecture and design are settled (see
[`docs/superpowers/specs`](docs/superpowers/specs)); modules are being filled in.

## Quick start

```bash
npx vibecoder-discord-presence install
```

That's it. Open Claude Code with the Discord desktop app running and your
presence appears. Remove it any time with:

```bash
vdp uninstall
```

## How it works

Claude Code hooks write your current activity to a small bridge file. A
lightweight background daemon holds the Discord connection open, reads that
file, and updates your presence — appearing only when both Claude Code and
Discord are running, and disappearing on its own when you're done. No manual
start/stop.

## Themes

Pick a vibe in one line, or tweak/replace it. Default is `minimal`, which leaks
nothing.

| Theme       | Shows                                              |
| ----------- | -------------------------------------------------- |
| `minimal`   | Brand + session timer only (default, privacy-safe) |
| `developer` | Project, branch, activity, model, token count      |
| `focus`     | Deep-work timer, hides what you're building        |
| `playful`   | Personality-forward, emoji copy                    |

Config lives at `~/.claude/discord-presence/config.json`:

```jsonc
{
  "theme": "minimal",
  "overrides": {
    // only the fields you want to change
  },
}
```

Privacy is simply which placeholders a theme uses — nothing about your work is
shown unless you opt into it.

## Requirements

- Node.js >= 18 (already required by Claude Code)
- The Discord **desktop** app (the browser client can't do Rich Presence)
- Discord setting **"Display current activity as a status message"** enabled

## Commands

| Command         | Does                                                 |
| --------------- | ---------------------------------------------------- |
| `vdp install`   | Add the hooks to `~/.claude/settings.json`           |
| `vdp uninstall` | Remove everything and restore your settings          |
| `vdp status`    | Show install state, daemon, Discord, active sessions |

## License

MIT
