/**
 * CLI entry point. Parses argv and routes to a command handler.
 * Contains no business logic itself — just dispatch.
 */
import { install } from './commands/install';
import { uninstall } from './commands/uninstall';
import { status } from './commands/status';
import { runHook } from './provider/claude-code';
import { startDaemon } from './daemon/index';

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
      return install(rest);
    case 'uninstall':
      return uninstall(rest);
    case 'status':
      return status(rest);
    case 'hook':
      return runHook(rest);
    case 'daemon':
      return startDaemon(rest);
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
