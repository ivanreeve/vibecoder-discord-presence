/**
 * Config loading and resolution.
 *
 * Reads config.json, resolves the active theme from THEMES, applies the user's
 * `overrides` on top, and validates the result. Falls back to DEFAULT_CONFIG
 * (the privacy-safe `minimal` theme) when no config exists or it's invalid.
 *
 * TODO: implement loadConfig / validate / merge.
 */
import { DEFAULT_THEME } from '../themes/index';
import type { Theme, UserConfig } from '../types';

/** What a brand-new install runs with until the user changes anything. */
export const DEFAULT_CONFIG: UserConfig = {
  theme: DEFAULT_THEME as UserConfig['theme'],
  overrides: {},
};

/** Resolve the effective theme (theme + overrides) from a config file. */
export function loadConfig(_configPath: string): Theme {
  throw new Error('loadConfig: not implemented yet');
}
