import { Router } from 'express';
import { db, queries } from '../db.js';
import { isDndActive, normalizeNumber } from '../policy.js';
import { releaseHeldMessages } from '../release.js';
import { config } from '../config.js';

export const adminRouter = Router();

adminRouter.use((req, res, next) => {
  const auth = req.headers.authorization ?? '';
  if (auth !== `Bearer ${config.adminToken}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

function deviceView(device) {
  return {
    ...device,
    schedule: JSON.parse(device.schedule_json),
    schedule_json: undefined,
    dnd_active: isDndActive(device),
    whitelist: queries.whitelistForDevice.all(device.id),
  };
}

adminRouter.get('/devices', (req, res) => {
  res.json(queries.allDevices.all().map(deviceView));
});

adminRouter.post('/devices', (req, res) => {
  const { name, real_number, shadow_number, timezone, schedule } = req.body ?? {};
  if (!name || !real_number || !shadow_number) {
    return res.status(400).json({ error: 'name, real_number, shadow_number are required' });
  }
  const info = queries.insertDevice.run({
    name,
    real_number: normalizeNumber(real_number),
    shadow_number: normalizeNumber(shadow_number),
    timezone: timezone ?? 'America/Los_Angeles',
    schedule_json: JSON.stringify(schedule ?? []),
  });
  res.status(201).json(deviceView(queries.deviceById.get(info.lastInsertRowid)));
});

adminRouter.get('/devices/:id', (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  res.json(deviceView(device));
});

// Manual DND control: {"override": "on" | "off" | null}
// null returns the device to schedule-driven behavior. Turning DND off (or
// clearing an override while the schedule is inactive) triggers digest release
// on the next job tick (<=30s); use POST /devices/:id/release for immediate.
adminRouter.post('/devices/:id/dnd', (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  const { override } = req.body ?? {};
  if (override !== 'on' && override !== 'off' && override !== null) {
    return res.status(400).json({ error: 'override must be "on", "off", or null' });
  }
  queries.setDndOverride.run(override, device.id);
  res.json(deviceView(queries.deviceById.get(device.id)));
});

adminRouter.put('/devices/:id/schedule', (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  const { schedule } = req.body ?? {};
  if (!Array.isArray(schedule)) return res.status(400).json({ error: 'schedule must be an array' });
  queries.setSchedule.run(JSON.stringify(schedule), device.id);
  res.json(deviceView(queries.deviceById.get(device.id)));
});

adminRouter.post('/devices/:id/whitelist', (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  const { number, label } = req.body ?? {};
  if (!number) return res.status(400).json({ error: 'number is required' });
  queries.addWhitelist.run(device.id, normalizeNumber(number), label ?? null);
  res.status(201).json(queries.whitelistForDevice.all(device.id));
});

adminRouter.delete('/devices/:id/whitelist/:number', (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  queries.removeWhitelist.run(device.id, normalizeNumber(req.params.number));
  res.json(queries.whitelistForDevice.all(device.id));
});

adminRouter.get('/devices/:id/messages', (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  res.json(queries.messagesForDevice.all(device.id));
});

adminRouter.get('/devices/:id/calls', (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  res.json(queries.callEventsForDevice.all(device.id));
});

// Force immediate digest delivery regardless of DND state.
adminRouter.post('/devices/:id/release', async (req, res) => {
  const device = queries.deviceById.get(req.params.id);
  if (!device) return res.status(404).json({ error: 'not found' });
  const count = await releaseHeldMessages(device);
  res.json({ released: count });
});
