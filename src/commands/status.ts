/**
 * `vdp status`
 *
 * Reports install state (are our hooks present), whether the daemon is running,
 * the Discord connection state, and how many sessions are currently live.
 * This is the primary troubleshooting command.
 *
 * TODO: implement.
 */
export async function status(_args: string[] = []): Promise<void> {
  throw new Error('status: not implemented yet');
}
