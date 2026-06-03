/**
 * Thin wrapper around @xhayper/discord-rpc.
 *
 * Connects to the local Discord client over IPC, pushes activity, and stays a
 * graceful no-op whenever Discord isn't running. The rest of the daemon just
 * calls setActivity/clearActivity on a fixed cadence and never has to know
 * whether Discord is up — this class swallows connection failures and quietly
 * reconnects on the next call once Discord is back.
 */
import { Client, type SetActivity } from '@xhayper/discord-rpc';
import type { PresencePayload } from '../types';

function toSetActivity(p: PresencePayload): SetActivity {
  return {
    details: p.details,
    state: p.state,
    largeImageKey: p.largeImageKey,
    largeImageText: p.largeImageText,
    smallImageKey: p.smallImageKey,
    smallImageText: p.smallImageText,
    startTimestamp: p.startTimestamp,
    buttons: p.buttons,
    statusDisplayType: p.statusDisplayType,
  };
}

export class DiscordPresence {
  private client?: Client;
  private connected = false;
  private connecting = false;

  constructor(private readonly clientId: string) {}

  get isConnected(): boolean {
    return this.connected;
  }

  /** Ensure we have a live connection. Returns false (no-op) if Discord is down. */
  private async ensureClient(): Promise<boolean> {
    if (this.connected && this.client) return true;
    if (this.connecting) return false;
    if (!this.clientId) return false; // no application id configured yet
    this.connecting = true;

    // Tear down any stale client before reconnecting.
    if (this.client) {
      try {
        await this.client.destroy();
      } catch {
        // ignore
      }
      this.client = undefined;
    }

    try {
      const client = new Client({ clientId: this.clientId, transport: { type: 'ipc' } });
      client.on('disconnected', () => {
        this.connected = false;
      });
      await client.connect();
      this.client = client;
      this.connected = true;
      return true;
    } catch {
      this.connected = false; // Discord not running — try again next tick
      return false;
    } finally {
      this.connecting = false;
    }
  }

  async setActivity(payload: PresencePayload): Promise<void> {
    if (Object.keys(payload).length === 0) {
      await this.clearActivity();
      return;
    }
    if (!(await this.ensureClient())) return;
    try {
      await this.client?.user?.setActivity(toSetActivity(payload));
    } catch {
      this.connected = false; // force a reconnect on the next tick
    }
  }

  async clearActivity(): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.user?.clearActivity();
    } catch {
      this.connected = false;
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.client?.destroy();
    } catch {
      // ignore
    }
    this.client = undefined;
    this.connected = false;
  }
}
