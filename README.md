<div align="center">
  <img src="assets/logo.jpg" alt="" width="160" height="160" align="middle" />
  <h1>
    Vibecoder Discord Presence
  </h1>
  <p><strong>Your AI coding sessions, live on Discord.</strong></p>

<img src="assets/demo.gif" alt="demo" width="480" />

</div>

A live Discord status for your AI coding sessions — thinking, editing, running
tests, as it happens. Theme it however you like (or build your own from scratch),
and it stays private unless you choose to share more.

## Supported tools

| Tool        | Status       |
| ----------- | ------------ |
| Claude Code | ✅ supported |
| Gemini CLI  | 🔜 planned   |
| Codex       | 🔜 planned   |
| OpenCode    | 🔜 planned   |

> Built on a provider model — adding a tool only changes how events are read, not
> the rest. PRs welcome.

## Install

**One-line setup** — clones this fork, builds it, registers the Claude Code
hooks, and installs the dynamic `developer` preset (a live readout of the model
and reasoning effort you're actually running):

**macOS / Linux**

```sh
curl -fsSL https://raw.githubusercontent.com/ivanreeve/vibecoder-discord-presence/master/setup.sh | bash
```

**Windows (PowerShell)**

```powershell
irm https://raw.githubusercontent.com/ivanreeve/vibecoder-discord-presence/master/setup.ps1 | iex
```

Open Claude Code with the Discord **desktop** app running — your status shows up
on its own. That's the whole setup. Safe to re-run; it backs up any existing
config first.

> Needs Node 18+, git, and the Discord desktop app.

<details>
<summary>Prefer to install the published package by hand?</summary>

```sh
npm i -g vibecoder-discord-presence
vdp install
```

</details>

## Themes

Seven built-ins, from privacy-safe to maximum vibes.

<p align="center">
  <img src="assets/profile.png" alt="Discord rich presence" width="320"/>
</p>

| Theme       | Vibe                                                  |
| ----------- | ----------------------------------------------------- |
| `minimal`   | Privacy-safe — nothing about your work (default)       |
| `developer` | Project, branch, file, model                          |
| `focus`     | Deep-work timer                                        |
| `playful`   | Vibey and casual                                       |
| `chaos`     | 🚀 Every stat, all the emojis, peak vibes              |
| `terminal`  | `>` Retro hacker prompt — privacy-safe, never leaks your project |
| `shipper`   | 🚢 Momentum & ship-it energy                           |

## Customize

```sh
vdp config
```

Pick a theme or build your own — every line, image, and button — with a live
preview as you go.

Available placeholders:
`{project}` `{branch}` `{model}` `{effort}` `{activity}` `{file}` `{tokens}`
`{cost}` `{elapsed}` `{sessionCount}` `{state}`. `{model}` and `{effort}` track
the live Claude Code model (e.g. `Opus 4.8`) and reasoning effort (e.g. `Max`);
each collapses to nothing when it isn't available.

## Commands

| Command                    | What it does                                   |
| -------------------------- | ---------------------------------------------- |
| `vdp install`              | Set it up                                      |
| `vdp config`               | Customize the card                             |
| `vdp status`               | See what's running                             |
| `vdp stop` / `vdp restart` | Control the background process                 |
| `vdp uninstall [--purge]`  | Remove it (`--purge` also deletes your config) |

## Privacy

The default `minimal` theme shares nothing about your work — no project names,
paths, or filenames. Anything more is opt-in, and there's no telemetry.

## How it works

A small hook fires on each event and writes a marker file. A lightweight
background process reads it, updates Discord, and exits once you're idle — no
always-on daemon, no manual start/stop.

## License

[MIT](LICENSE) © [younesfdj](https://github.com/younesfdj)
