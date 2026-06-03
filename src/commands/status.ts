/**
 * `vdp status`
 *
 * The primary troubleshooting command. Reports, with no side effects:
 *   - whether our hooks are installed in settings.json,
 *   - whether a Discord application id is configured,
 *   - whether the daemon is running (live lock pid),
 *   - the Discord connection state (from the daemon's status file),
 *   - how many Claude Code sessions are currently live.
 */
import { configPath } from '../core/paths';
import { readUserConfig, resolveClientId } from '../core/config';
import { HOOK_EVENTS, isOurEntry, readSettings } from '../core/settings';
import {
  DAEMON_STATUS_STALE_MS,
  isProcessAlive,
  readDaemonStatus,
  readLock,
} from '../core/daemon-state';
import { aggregate, readMarkers } from '../core/state';

const yes = (b: boolean): string => (b ? '✓' : '✗');

export async function status(_args: string[] = []): Promise<void> {
  // Hooks installed?
  const settings = await readSettings();
  const installed = HOOK_EVENTS.filter((e) => (settings.hooks?.[e.name] ?? []).some(isOurEntry));
  const hooksOk = installed.length === HOOK_EVENTS.length;

  // Discord application id configured?
  const clientId = resolveClientId(readUserConfig(configPath()));
  const clientIdOk = clientId.length > 0;

  // Daemon running?
  const lock = readLock();
  const daemonRunning = lock !== null && isProcessAlive(lock.pid);

  // Discord connection + reported sessions (from the daemon's status file).
  const now = Date.now();
  const ds = readDaemonStatus();
  const dsFresh = ds !== null && now - ds.updatedAt <= DAEMON_STATUS_STALE_MS;
  const discordConnected = dsFresh && ds.connected;

  // Live sessions (independent of the daemon — read straight from markers).
  const live = aggregate(readMarkers(), now);
  const sessionCount = live?.sessionCount ?? 0;

  console.log('vibecoder-discord-presence — status\n');
  console.log(
    `  ${yes(hooksOk)} hooks installed   ${
      hooksOk
        ? `(${installed.length}/${HOOK_EVENTS.length})`
        : `(${installed.length}/${HOOK_EVENTS.length} — run \`vdp install\`)`
    }`,
  );
  console.log(
    `  ${yes(clientIdOk)} Discord app id    ${
      clientIdOk
        ? '(configured)'
        : '(not set — set VDP_DISCORD_CLIENT_ID or clientId in config.json)'
    }`,
  );
  console.log(
    `  ${yes(daemonRunning)} daemon running    ${daemonRunning ? `(pid ${lock?.pid})` : '(not running)'}`,
  );
  console.log(
    `  ${yes(discordConnected)} Discord connected ${discordConnected ? '' : dsFresh ? '(Discord not reachable)' : '(unknown — daemon idle)'}`,
  );
  console.log(`  • live sessions     ${sessionCount}`);
  if (live?.activity) console.log(`  • current activity  ${live.activity}`);
}
