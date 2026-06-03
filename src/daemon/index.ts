/**
 * Background daemon.
 *
 * Singleton (guarded by the lockfile). Owns the Discord connection. On a fixed
 * tick it:
 *   - reads session markers, drops ones whose heartbeat is stale (crash-safe),
 *   - aggregates the live sessions into one state,
 *   - renders the active theme into a presence payload,
 *   - pushes it to Discord (the Discord layer reconnects transparently),
 *   - clears presence and self-exits once no sessions remain for a grace period.
 *
 * It's spawned detached by the SessionStart hook, so there's no console to talk
 * to; health is surfaced through the status file (see core/daemon-state) which
 * `vdp status` reads.
 *
 * Note: model/branch/tokens enrichment from the transcript isn't wired up yet —
 * those tokens simply collapse in rendering until a later step adds it.
 */
import {
  acquireLock,
  clearDaemonStatus,
  releaseLock,
  writeDaemonStatus,
} from '../core/daemon-state';
import { configPath } from '../core/paths';
import { readUserConfig, resolveClientId, resolveTheme } from '../core/config';
import { aggregate, readMarkers } from '../core/state';
import { renderPresence } from '../core/presence';
import { DiscordPresence } from './discord';

/** How often we reconcile markers -> Discord. */
const TICK_MS = 15 * 1000;
/** How long with zero live sessions before the daemon clears presence and exits. */
const IDLE_GRACE_MS = 60 * 1000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function startDaemon(_args: string[] = []): Promise<void> {
  if (!acquireLock(Date.now())) return; // another daemon already owns the lock

  const config = readUserConfig(configPath());
  const theme = resolveTheme(config);
  const discord = new DiscordPresence(resolveClientId(config));

  let running = true;
  const shutdown = async (): Promise<void> => {
    running = false;
    await discord.clearActivity();
    await discord.destroy();
    clearDaemonStatus();
    releaseLock();
  };

  process.once('SIGINT', () => void shutdown().then(() => process.exit(0)));
  process.once('SIGTERM', () => void shutdown().then(() => process.exit(0)));
  process.on('exit', () => releaseLock()); // last-ditch synchronous cleanup

  let idleSince: number | null = null;
  while (running) {
    const now = Date.now();
    const state = aggregate(readMarkers(), now);

    if (state) {
      idleSince = null;
      await discord.setActivity(renderPresence(theme, state, now));
      writeDaemonStatus({
        pid: process.pid,
        connected: discord.isConnected,
        sessionCount: state.sessionCount,
        activity: state.activity,
        updatedAt: now,
      });
    } else {
      if (idleSince === null) idleSince = now;
      await discord.clearActivity();
      writeDaemonStatus({
        pid: process.pid,
        connected: discord.isConnected,
        sessionCount: 0,
        updatedAt: now,
      });
      if (now - idleSince >= IDLE_GRACE_MS) break;
    }

    await sleep(TICK_MS);
  }

  await shutdown();
}
