/**
 * Background daemon.
 *
 * Singleton (guarded by a lockfile). Owns the Discord connection. On a loop it:
 *   - reads session markers, drops ones whose heartbeat is stale (crash-safe),
 *   - aggregates live sessions into one state,
 *   - renders the active theme into a presence payload,
 *   - pushes it to Discord (reconnecting if Discord restarts),
 *   - clears presence and self-exits once no sessions remain for a grace period.
 *
 * TODO: implement.
 */
export async function startDaemon(_args: string[] = []): Promise<void> {
  throw new Error('daemon: not implemented yet');
}
