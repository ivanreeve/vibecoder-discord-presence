/**
 * Bridge state: the contract between hooks and the daemon.
 *
 * Hooks write per-session marker files (each with a heartbeat timestamp) and
 * update the aggregated state file. The daemon reads them, treats markers with
 * a stale heartbeat as dead sessions, and merges the live ones into a single
 * view (current activity, model, counts, earliest start time, session count).
 *
 * Writes must be atomic (write-temp-then-rename) so the daemon never reads a
 * half-written file.
 *
 * TODO: implement read/write/aggregate + staleness.
 */
import type { AggregatedState, SessionMarker } from '../types';

/** A session is considered dead if its heartbeat is older than this. */
export const STALE_AFTER_MS = 5 * 60 * 1000;

export function readState(): AggregatedState {
  throw new Error('readState: not implemented yet');
}

export function writeSessionMarker(_session: SessionMarker): void {
  throw new Error('writeSessionMarker: not implemented yet');
}
