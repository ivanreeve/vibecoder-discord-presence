/**
 * `vdp install`
 *
 * Adds our hook entries to ~/.claude/settings.json non-destructively (chains
 * with any existing hooks, never clobbers them) and writes a default config if
 * none exists. Hook commands are written with the resolved absolute path so
 * they never pay npx resolution cost on every Claude Code event.
 *
 * TODO: implement (see spec — Architecture / CLI).
 */
export async function install(_args: string[] = []): Promise<void> {
  throw new Error('install: not implemented yet');
}
