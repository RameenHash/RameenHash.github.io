import { Router } from 'express';
import { queries } from '../db.js';
import { decide, looksLikeOtp, normalizeNumber } from '../policy.js';
import * as provider from '../providers/twilio.js';

export const smsRouter = Router();

// Relayed texts are sent from the gateway's hosted number, so the true sender is
// carried in a body prefix. The Android agent replaces this path entirely (it
// receives messages over the API and renders true-sender threading natively).
function relayBody(from, body) {
  return `From ${from}:\n${body}`;
}

smsRouter.post('/webhooks/sms', async (req, res) => {
  res.type(provider.contentType);

  if (!provider.verifyWebhook(req)) {
    return res.status(403).send('invalid signature');
  }

  const from = normalizeNumber(req.body.From);
  const to = normalizeNumber(req.body.To);
  const body = req.body.Body ?? '';
  const device = queries.deviceByRealNumber.get(to);
  if (!device) {
    console.warn(`sms: no device for hosted number ${to}`);
    return res.status(404).send('unknown number');
  }

  const otp = looksLikeOtp(body);
  const whitelisted = Boolean(queries.isWhitelisted.get(device.id, from));
  const action = decide(device, { whitelisted });
  const passthrough = action === 'pass' || (otp && device.otp_passthrough);

  queries.insertMessage.run({
    device_id: device.id,
    from_number: from,
    body,
    status: passthrough ? 'relayed' : 'held',
    is_otp: otp ? 1 : 0,
  });

  if (passthrough) {
    try {
      await provider.sendSms({
        to: device.shadow_number,
        from: device.real_number,
        body: relayBody(from, body),
      });
    } catch (err) {
      // Message is stored either way; the release job will not retry relays, so log loudly.
      console.error('sms relay failed (message stored):', err);
    }
  }

  // Empty TwiML: never auto-reply to the sender.
  return res.send(provider.emptySmsResponse());
});
