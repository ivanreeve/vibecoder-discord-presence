/**
 * Presence rendering: turn (resolved theme + aggregated state) into the
 * payload the Discord layer sends.
 *
 * Fills template placeholders from state, collapses empty ones gracefully,
 * resolves image asset keys (e.g. status-{state} -> status-editing), and maps
 * everything onto Discord's fixed slots (details, state, images, timer,
 * buttons). Pure and deterministic — easy to unit test.
 *
 * TODO: implement renderPresence + template interpolation.
 */
import type { AggregatedState, PresencePayload, Theme } from '../types';

export function renderPresence(_theme: Theme, _state: AggregatedState): PresencePayload {
  throw new Error('renderPresence: not implemented yet');
}
