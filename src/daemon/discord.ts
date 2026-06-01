/**
 * Thin wrapper around @xhayper/discord-rpc.
 *
 * Responsibilities: connect/handshake with the (shared or custom) client ID,
 * setActivity, transparently reconnect when Discord is closed/reopened, and be
 * a graceful no-op while Discord isn't running. Keeps the rest of the daemon
 * unaware of the RPC library's specifics.
 *
 * TODO: implement.
 */
import type { PresencePayload } from '../types';

export class DiscordPresence {
  constructor(private readonly clientId: string) {
    void this.clientId;
    throw new Error('DiscordPresence: not implemented yet');
  }

  async setActivity(_payload: PresencePayload): Promise<void> {
    throw new Error('setActivity: not implemented yet');
  }
}
