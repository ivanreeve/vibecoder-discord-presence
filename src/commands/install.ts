/**
 * `vdp install`
 *
 * Writes a default config (if absent), ensures our working dirs exist, backs up
 * the current ~/.claude/settings.json, then merges our hook entries in
 * non-destructively. Hook commands use the resolved absolute path to this
 * bundle, so they never pay npx resolution cost on every Claude Code event.
 */
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { configPath, entryPath, presenceDir, sessionsDir } from '../core/paths';
import { DEFAULT_CONFIG } from '../core/config';
import {
  HOOK_EVENTS,
  backupSettings,
  mergeHooks,
  readSettings,
  writeSettings,
} from '../core/settings';

export async function install(_args: string[] = []): Promise<void> {
  await mkdir(sessionsDir(), { recursive: true });

  // Default config — only if the user doesn't already have one.
  if (!existsSync(configPath())) {
    await mkdir(presenceDir(), { recursive: true });
    await writeFile(configPath(), `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`);
  }

  const existing = await readSettings();
  const backupPath = await backupSettings(existing);
  await writeSettings(mergeHooks(existing, entryPath()));

  console.log('✓ vibecoder-discord-presence installed');
  console.log(`  hooks: ${HOOK_EVENTS.map((e) => e.name).join(', ')}`);
  console.log(`  config: ${configPath()}`);
  if (backupPath) console.log(`  settings backed up to: ${backupPath}`);
  console.log('\nOpen Claude Code with Discord running and your presence will appear.');
}
