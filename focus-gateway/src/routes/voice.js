import { Router } from 'express';
import { queries } from '../db.js';
import { decide, normalizeNumber } from '../policy.js';
import * as provider from '../providers/twilio.js';
import { config } from '../config.js';

export const voiceRouter = Router();

// Inbound call to a hosted real number.
// Fail-open by design: any error returns a bridge to the shadow number when we can
// resolve the device — an outage must degrade to "normal phone", never "unreachable".
voiceRouter.post('/webhooks/voice', (req, res) => {
  res.type(provider.contentType);

  if (!provider.verifyWebhook(req)) {
    return res.status(403).send('invalid signature');
  }

  const from = normalizeNumber(req.body.From);
  const to = normalizeNumber(req.body.To);
  const device = queries.deviceByRealNumber.get(to);
  if (!device) {
    console.warn(`voice: no device for hosted number ${to}`);
    return res.status(404).send('unknown number');
  }

  try {
    const whitelisted = Boolean(queries.isWhitelisted.get(device.id, from));
    const action = decide(device, { whitelisted });
    if (action === 'pass') {
      queries.insertCallEvent.run({
        device_id: device.id, from_number: from, action: 'bridged',
        recording_url: null, call_sid: req.body.CallSid ?? null,
      });
      return res.send(provider.bridgeCallResponse({
        toShadowNumber: device.shadow_number,
        callerId: from,
      }));
    }

    queries.insertCallEvent.run({
      device_id: device.id, from_number: from, action: 'voicemail',
      recording_url: null, call_sid: req.body.CallSid ?? null,
    });
    return res.send(provider.voicemailResponse({
      greeting: device.voicemail_greeting,
      recordingCallbackUrl: `${config.publicBaseUrl}/webhooks/voice/recording`,
    }));
  } catch (err) {
    console.error('voice webhook error, failing open to bridge:', err);
    queries.insertCallEvent.run({
      device_id: device.id, from_number: from, action: 'error',
      recording_url: null, call_sid: req.body.CallSid ?? null,
    });
    return res.send(provider.bridgeCallResponse({
      toShadowNumber: device.shadow_number,
      callerId: from,
    }));
  }
});

// Recording status callback: attach the voicemail URL to the call event.
voiceRouter.post('/webhooks/voice/recording', (req, res) => {
  if (!provider.verifyWebhook(req)) return res.status(403).send('invalid signature');
  const { CallSid, RecordingUrl } = req.body;
  if (CallSid && RecordingUrl) queries.attachRecording.run(RecordingUrl, CallSid);
  res.sendStatus(204);
});
