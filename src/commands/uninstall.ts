/**
 * `vdp uninstall`
 *
 * Removes exactly the hook entries we added, restores the prior settings, and
 * stops the daemon. Must be a clean round-trip with `install`.
 *
 * TODO: implement.
 */
export async function uninstall(_args: string[] = []): Promise<void> {
  throw new Error('uninstall: not implemented yet');
}
