/**
 * Central place for every filesystem path the tool uses.
 * Honors CLAUDE_CONFIG_DIR so it tracks Claude Code's own config location.
 */
import os from 'node:os';
import path from 'node:path';

/** Claude Code's config directory (~/.claude unless overridden). */
export function claudeDir(): string {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

/** Claude Code's settings file we add hooks to. */
export function settingsPath(): string {
  return path.join(claudeDir(), 'settings.json');
}

/** Our own working directory under the Claude config dir. */
export function presenceDir(): string {
  return path.join(claudeDir(), 'discord-presence');
}

/** User config file (theme + overrides). */
export function configPath(): string {
  return path.join(presenceDir(), 'config.json');
}

/** Aggregated activity the daemon reads. */
export function statePath(): string {
  return path.join(presenceDir(), 'state.json');
}

/** Singleton lock so only one daemon runs. */
export function lockPath(): string {
  return path.join(presenceDir(), 'daemon.lock');
}

/** Per-session marker files (one per live Claude Code session). */
export function sessionsDir(): string {
  return path.join(presenceDir(), 'sessions');
}
