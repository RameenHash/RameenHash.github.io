import twilio from 'twilio';
import { config } from '../config.js';

const { twiml, validateRequest } = twilio;
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export const contentType = 'text/xml';

export function verifyWebhook(req) {
  if (!config.twilio.validateSignatures) return true;
  const signature = req.headers['x-twilio-signature'];
  const url = `${config.publicBaseUrl}${req.originalUrl}`;
  return validateRequest(config.twilio.authToken, signature, url, req.body);
}

// Twilio permits the inbound call's own caller ID as the <Dial> callerId, so the
// phone sees the friend's real number, not the gateway's.
export function bridgeCallResponse({ toShadowNumber, callerId }) {
  const response = new twiml.VoiceResponse();
  response.dial({ callerId, answerOnBridge: true, timeout: 25 }, toShadowNumber);
  return response.toString();
}

export function voicemailResponse({ greeting, recordingCallbackUrl }) {
  const response = new twiml.VoiceResponse();
  response.say({ voice: 'Polly.Joanna' }, greeting);
  response.record({
    maxLength: 120,
    playBeep: true,
    recordingStatusCallback: recordingCallbackUrl,
    recordingStatusCallbackEvent: ['completed'],
  });
  response.hangup();
  return response.toString();
}

export function emptySmsResponse() {
  return new twiml.MessagingResponse().toString();
}

export async function sendSms({ to, from, body }) {
  await client.messages.create({ to, from, body });
}
