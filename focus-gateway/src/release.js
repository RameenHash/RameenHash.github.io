import { queries } from './db.js';
import { isDndActive } from './policy.js';
import * as provider from './providers/twilio.js';

// Deliver the vaulted messages for a device as a digest. Exposed so the admin API
// can force a release, and called automatically on the DND active->inactive edge.
export async function releaseHeldMessages(device) {
  const held = queries.heldMessages.all(device.id);
  if (held.length === 0) return 0;

  const digestHeader = `Study mode ended — ${held.length} message${held.length === 1 ? '' : 's'} while you were studying:`;
  const lines = held.map((m) => `• ${m.from_number} (${m.received_at} UTC): ${m.body}`);

  // SMS segments are small; send header + each message separately to avoid
  // truncation and keep sender/timestamp attached to its body.
  await provider.sendSms({ to: device.shadow_number, from: device.real_number, body: digestHeader });
  for (const m of held) {
    await provider.sendSms({
      to: device.shadow_number,
      from: device.real_number,
      body: `From ${m.from_number}:\n${m.body}`,
    });
    queries.markReleased.run(m.id);
  }
  console.log(`released ${held.length} held messages for device ${device.id} (${device.name})`);
  return held.length;
}

// Poll for DND state edges. Schedule-driven transitions have no event, so a
// frequent tick is the authority; 30s keeps release latency well under a minute.
export function startReleaseJob(intervalMs = 30_000) {
  const tick = async () => {
    for (const device of queries.allDevices.all()) {
      const active = isDndActive(device);
      const prev = queries.getDndState.get(device.id);
      if (prev == null) {
        queries.upsertDndState.run(device.id, active ? 1 : 0);
        continue;
      }
      if (Boolean(prev.active) !== active) {
        queries.upsertDndState.run(device.id, active ? 1 : 0);
        if (!active) {
          try {
            await releaseHeldMessages(device);
          } catch (err) {
            // Leave messages 'held'; the next inactive tick will not re-fire the
            // edge, so retry explicitly here on the following interval.
            console.error(`release failed for device ${device.id}, will retry:`, err);
            queries.upsertDndState.run(device.id, 1);
          }
        }
      } else if (!active) {
        // Safety net: catch messages left 'held' by a failed release.
        const held = queries.heldMessages.all(device.id);
        if (held.length > 0) await releaseHeldMessages(device).catch((e) => console.error(e));
      }
    }
  };
  tick().catch((e) => console.error(e));
  return setInterval(() => tick().catch((e) => console.error(e)), intervalMs);
}
