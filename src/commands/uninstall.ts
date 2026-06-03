/**
 * `vdp uninstall`
 *
 * Removes exactly the hook entries we added (other hooks are preserved) and
 * restores a clean settings.json. The config and any markers are left in place;
 * they're harmless and let a reinstall keep the user's theme.
 */
import { readSettings, stripOurHooks, writeSettings } from '../core/settings';

export async function uninstall(_args: string[] = []): Promise<void> {
  const settings = await readSettings();
  const { cleaned, removed } = stripOurHooks(settings);
  await writeSettings(cleaned);

  console.log('✓ vibecoder-discord-presence uninstalled');
  console.log(
    `  removed ${removed} hook ${removed === 1 ? 'entry' : 'entries'} from settings.json`,
  );
}
