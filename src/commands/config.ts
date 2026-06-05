/**
 * `vdp config`
 *
 * Interactive presence customizer. Pick a theme and (optionally) edit every
 * slot — details, state, images, timer, buttons, compact-status mode — with a
 * live ASCII preview of the resulting Discord card. Saves to config.json, which
 * the daemon hot-reads, so changes hit your live card within a tick.
 *
 * Flags:
 *   --show    print the current config + preview and exit
 *   --reset   restore the default (privacy-safe `minimal`) theme
 *
 * The prompt library is imported lazily (this file is only loaded for the
 * `config` command) so it never weighs on the hook or daemon paths.
 */
import { confirm, input, select } from '@inquirer/prompts';
import { configPath } from '../core/paths';
import { DEFAULT_CONFIG, readUserConfig, resolveTheme, saveUserConfig } from '../core/config';
import { renderPresence } from '../core/presence';
import { THEMES } from '../themes/index';
import { isProcessAlive, readLock } from '../core/daemon-state';
import { ui } from '../ui';
import type { AggregatedState, PresenceButton, StatusDisplay, Theme, UserConfig } from '../types';

const APP_NAME = 'ClaudeCode'; // the registered Discord application name (the bold headline)

/** Sample state used to render the preview so users see realistic text. */
function sampleState(now: number): AggregatedState {
  return {
    sessionCount: 1,
    startedAt: now - 83_000, // ~1m 23s ago
    project: 'my-app',
    branch: 'main',
    model: 'Opus 4.8',
    state: 'editing',
    activity: 'Editing index.ts',
    file: 'index.ts',
    tokens: 12_345,
    cost: 0.42,
  };
}

function box(lines: string[], title: string): string {
  // Width is computed from RAW (uncolored) lengths; color is applied only to the
  // border/title afterwards so the alignment math is never thrown off by the
  // invisible ANSI escape codes.
  const width = Math.max(title.length + 2, ...lines.map((l) => l.length)) + 2;
  const top =
    ui.dim('┌─ ') +
    ui.title(title) +
    ui.dim(` ${'─'.repeat(Math.max(0, width - title.length - 3))}┐`);
  const body = lines.map((l) => `${ui.dim('│')} ${l.padEnd(width - 1)}${ui.dim('│')}`);
  const bottom = ui.dim(`└${'─'.repeat(width + 1)}┘`);
  return [top, ...body, bottom].join('\n');
}

/** Render an ASCII mock of the Discord card for a theme. */
function previewCard(theme: Theme): string {
  const now = Date.now();
  const p = renderPresence(theme, sampleState(now), now);

  const lines: string[] = [];
  lines.push(`icon:  ${p.largeImageKey ?? '(none)'}`);
  lines.push('');
  lines.push(APP_NAME);
  if (p.details) lines.push(p.details);
  if (p.state) lines.push(p.state);
  if (p.startTimestamp) lines.push('elapsed 01:23');
  if (p.smallImageKey)
    lines.push(`badge: ${p.smallImageKey}${p.smallImageText ? ` (${p.smallImageText})` : ''}`);
  if (p.buttons?.length) lines.push(p.buttons.map((b) => `[ ${b.label} ]`).join(' '));

  // Compact (member-list) line: 'name' keeps the "Playing <app>" form; the other
  // modes replace it with the chosen line's text (no "Playing" prefix).
  const compact =
    p.statusDisplayType === 1
      ? p.state || `Playing ${APP_NAME}`
      : p.statusDisplayType === 2
        ? p.details || `Playing ${APP_NAME}`
        : `Playing ${APP_NAME}`;

  return `${box(lines, 'Discord card preview')}\n  ${ui.dim('member list shows:')} ${ui.accent(compact)}`;
}

/** Walk the user through editing every slot, starting from `base`. */
async function editTheme(base: Theme): Promise<Theme> {
  const details = await input({ message: 'Details line (top):', default: base.details });
  const state = await input({ message: 'State line (bottom):', default: base.state });
  const timer = await confirm({ message: 'Show the elapsed timer?', default: base.timer });

  const largeKey = await input({ message: 'Large image asset key:', default: base.largeImage.key });
  const largeText = await input({ message: 'Large image tooltip:', default: base.largeImage.text });
  const smallKey = await input({ message: 'Small badge asset key:', default: base.smallImage.key });
  const smallText = await input({ message: 'Small badge tooltip:', default: base.smallImage.text });

  const statusDisplay = (await select({
    message: 'What should the compact member-list status show?',
    default: base.statusDisplay ?? 'name',
    choices: [
      { name: 'App name ("Playing ClaudeCode")', value: 'name' },
      { name: 'The state line (your activity)', value: 'state' },
      { name: 'The details line', value: 'details' },
    ],
  })) as StatusDisplay;

  const buttons: PresenceButton[] = [];
  let addMore = await confirm({
    message: 'Add a button? (max 2)',
    default: base.buttons.length > 0,
  });
  while (addMore && buttons.length < 2) {
    const i = buttons.length;
    const label = await input({
      message: `Button ${i + 1} label:`,
      default: base.buttons[i]?.label ?? '',
    });
    const url = await input({
      message: `Button ${i + 1} URL:`,
      default: base.buttons[i]?.url ?? '',
      validate: (v) =>
        v.trim() === '' || /^https?:\/\//.test(v.trim()) || 'Must start with http(s)://',
    });
    if (label.trim() && url.trim()) buttons.push({ label: label.trim(), url: url.trim() });
    addMore =
      buttons.length < 2 ? await confirm({ message: 'Add another?', default: false }) : false;
  }

  return {
    details,
    state,
    timer,
    largeImage: { key: largeKey, text: largeText },
    smallImage: { key: smallKey, text: smallText },
    statusDisplay,
    buttons,
  };
}

function applyNote(): string {
  const lock = readLock();
  if (lock && isProcessAlive(lock.pid)) {
    return 'Your live card will update within ~15s.';
  }
  return 'It will apply next time you start Claude Code with Discord open.';
}

export async function config(args: string[] = []): Promise<void> {
  const current = readUserConfig(configPath());

  if (args.includes('--show')) {
    console.log(`${ui.dim('theme:')} ${ui.accent(current.theme)}\n`);
    console.log(previewCard(resolveTheme(current)));
    return;
  }

  if (args.includes('--reset')) {
    saveUserConfig(DEFAULT_CONFIG);
    console.log(`${ui.check} reset to the default ${ui.accent('"minimal"')} theme.`);
    console.log(`  ${ui.dim(applyNote())}`);
    return;
  }

  try {
    console.log(
      `\n${ui.title('Customize your Discord presence')} ${ui.dim('— Ctrl+C to cancel')}\n`,
    );
    console.log(
      ui.dim(
        'Tip: text fields accept placeholders like {project} {branch} {model} {file} {activity} {elapsed}.\n',
      ),
    );

    const theme = await select({
      message: 'Pick a theme:',
      default: current.theme,
      choices: [
        { name: 'minimal   — privacy-safe, nothing about your work', value: 'minimal' },
        { name: 'developer — project, branch, file, model', value: 'developer' },
        { name: 'focus     — deep-work timer', value: 'focus' },
        { name: 'playful   — vibey', value: 'playful' },
        { name: 'custom    — start from a base and edit everything', value: 'custom' },
      ],
    });

    // Show what the chosen base looks like before deciding whether to edit it.
    const base: Theme =
      theme === 'custom' ? resolveTheme(current) : structuredClone(THEMES[theme]!);
    console.log(`\n${previewCard(base)}\n`);

    const customize =
      theme === 'custom' || (await confirm({ message: 'Customize this theme?', default: false }));

    let next: UserConfig;
    if (customize) {
      const edited = await editTheme(base);
      console.log(`\n${previewCard(edited)}\n`);
      next = { theme: 'custom', overrides: edited, clientId: current.clientId };
    } else {
      next = { theme: theme as UserConfig['theme'], overrides: {}, clientId: current.clientId };
    }

    if (!(await confirm({ message: 'Save this configuration?', default: true }))) {
      console.log(ui.warn('Cancelled — no changes saved.'));
      return;
    }

    saveUserConfig(next);
    console.log(`\n${ui.check} ${ui.bold('Saved')} ${ui.dim(`to ${configPath()}`)}`);
    console.log(`  ${ui.dim(applyNote())}`);
  } catch (err) {
    // @inquirer throws ExitPromptError on Ctrl+C — treat as a clean cancel.
    if (err instanceof Error && err.name === 'ExitPromptError') {
      console.log(ui.warn('\nCancelled — no changes saved.'));
      return;
    }
    throw err;
  }
}
