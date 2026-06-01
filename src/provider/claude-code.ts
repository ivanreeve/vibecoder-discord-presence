/**
 * Claude Code event provider.
 *
 * Hook entries call `vdp hook <event>`. Each call is a short-lived process that
 * reads the hook payload from stdin, updates this session's marker (with a
 * fresh heartbeat) and the aggregated state bridge file, then exits fast.
 *
 * Hard rule: this path must NEVER throw or hang — it runs inside Claude Code's
 * hook execution and must not slow it down or break it. Errors are swallowed.
 *
 * On SessionStart it also lazily spawns the daemon if one isn't running.
 *
 * Events handled: session-start, post-tool-use, stop, session-end.
 *
 * This module is the only Claude-Code-specific part of the system. Other tools
 * would get their own provider that writes the same bridge format.
 *
 * TODO: implement.
 */
export async function runHook(_args: string[] = []): Promise<void> {
  throw new Error('hook: not implemented yet');
}
