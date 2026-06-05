/**
 * The four built-in themes.
 *
 * A theme is a bundle of slot templates plus which image asset keys to use.
 * Every string is a template; available placeholders are filled from the
 * aggregated session state:
 *
 *   {project} {branch} {model} {activity} {file} {tokens} {cost}
 *   {elapsed} {sessionCount}
 *
 * Empty placeholders collapse gracefully (no "Coding " with a trailing blank).
 * Privacy is simply a function of which placeholders a theme uses — the safe
 * default (`minimal`) reveals nothing about the user's work.
 *
 * NOTE: the GitHub URLs use OWNER as a placeholder until the repo org is fixed.
 */
import type { Theme } from '../types';

const REPO_URL = 'https://github.com/younesfdj/vibecoder-discord-presence';

export const THEMES: Record<string, Theme> = {
  minimal: {
    details: 'Coding with Claude Code',
    state: '',
    largeImage: { key: 'logo', text: 'Claude Code' },
    smallImage: { key: 'status-{state}', text: '{activity}' },
    timer: true,
    buttons: [],
    // No state line; let the compact status show the activity from details.
    statusDisplay: 'details',
  },

  developer: {
    details: 'Coding {project} ({branch})',
    state: '{activity} {file} · {model}',
    largeImage: { key: 'logo', text: 'Claude Code · {model}' },
    smallImage: { key: 'status-{state}', text: '{activity}' },
    timer: true,
    buttons: [{ label: '⭐ Star on GitHub', url: REPO_URL }],
    statusDisplay: 'state',
  },

  focus: {
    details: 'In a deep work session 🎯',
    state: 'Focused for {elapsed}',
    largeImage: { key: 'focus', text: 'Deep work' },
    smallImage: { key: 'status-focus', text: 'Focusing' },
    timer: true,
    buttons: [],
    statusDisplay: 'state',
  },

  playful: {
    details: '🤖 vibecoding with Claude',
    state: 'shipping {project} · {model}',
    largeImage: { key: 'logo', text: 'vibecoder' },
    smallImage: { key: 'status-{state}', text: '{activity}' },
    timer: true,
    buttons: [{ label: 'get vibecoder', url: REPO_URL }],
    statusDisplay: 'state',
  },

  chaos: {
    details: '🚀 {activity} — 📂 {project} {branch} 💻🔥',
    state:
      'cooking with {model} · {tokens} tokens burned· {cost} · 👥 {sessionCount} · ⌛ {elapsed}',
    largeImage: { key: 'logo', text: '✨ locked in · {model} · no thoughts only vibes 🔥' },
    smallImage: { key: 'status-{state}', text: '{activity} fr fr 💯' },
    timer: true,
    buttons: [
      { label: '🔥 join the vibe', url: REPO_URL },
      { label: '✨ star (real)', url: REPO_URL },
    ],
    statusDisplay: 'details',
  },
};

export const DEFAULT_THEME = 'minimal';
