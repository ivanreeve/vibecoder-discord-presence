/**
 * CLI entry point. Parses argv and routes to a command handler.
 * Contains no business logic itself — just dispatch.
 *
 * Handlers are loaded with dynamic import() on purpose: the hot `hook` path
 * must not pull in the Discord library (only `daemon` does). esbuild defers a
 * bundled module's evaluation until it's actually imported, so `vdp hook` stays
 * lean.
 */
const VERSION = '0.1.0';

const HELP = `vdp — vibecoder-discord-presence

Usage:
  vdp install      Add Claude Code hooks (~/.claude/settings.json)
  vdp uninstall    Remove hooks and restore settings
  vdp status       Show install, daemon, and Discord connection state
  vdp --version    Print version
  vdp --help       Show this help
`;

export async function run(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case 'install':
      return (await import('./commands/install')).install(rest);
    case 'uninstall':
      return (await import('./commands/uninstall')).uninstall(rest);
    case 'status':
      return (await import('./commands/status')).status(rest);
    case 'hook':
      return (await import('./provider/claude-code')).runHook(rest);
    case 'daemon':
      return (await import('./daemon/index')).startDaemon(rest);
    case '--version':
    case '-v':
      console.log(VERSION);
      return;
    case undefined:
    case '--help':
    case '-h':
      console.log(HELP);
      return;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}
