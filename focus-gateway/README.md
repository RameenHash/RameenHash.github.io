# focus-gateway

Telephony gateway for the Study Lockdown MDM platform. The student's **real phone
number is hosted at the telephony provider** (Twilio for now); the SIM in the phone
carries a secret **shadow number**. Every call and text to the real number hits this
server first, and DND policy is applied here — bridge/relay when allowed, hold when
studying, digest release when the session ends.

Design doc: [`docs/mdm-focus-platform/telephony-gateway.md`](../docs/mdm-focus-platform/telephony-gateway.md)
(architecture, emergency-safety analysis, threat model, webhook-vs-SIP decision).

## What's implemented (Phase 1 scaffold)

- **Voice webhook** — whitelisted callers (or DND off) bridge to the shadow number
  with the caller's real number as caller ID; everyone else gets the configurable
  voicemail greeting, recorded and logged. **Fails open**: an internal error bridges
  the call rather than dropping it.
- **SMS webhook** — texts are stored in the vault; relayed immediately when DND is
  off / sender whitelisted / OTP detected (configurable), held otherwise.
- **Release job** — watches for the DND active→inactive edge (manual or
  schedule-driven) and delivers the held-message digest to the phone; retries on
  failure.
- **Policy engine** — per-device weekly schedule windows evaluated in the device's
  timezone (midnight-crossing supported), manual override, whitelist, OTP heuristic.
- **Admin API** — bearer-token REST for devices, DND toggle, schedules, whitelist,
  message/call history, force-release.
- **Provider interface** — Twilio is isolated in `src/providers/twilio.js` behind the
  contract in `src/providers/provider.js`, so a self-hosted SIP/FreeSWITCH backend
  can be swapped in without touching policy code.

## Local setup

```bash
cd focus-gateway
npm install
cp .env.example .env    # fill in Twilio credentials + an admin token
npm test                # policy engine tests
npm run dev
```

Expose the server so Twilio can reach it, and set the tunnel URL in `.env`:

```bash
ngrok http 3000         # or: cloudflared tunnel --url http://localhost:3000
# PUBLIC_BASE_URL=https://<your-tunnel>.ngrok.app
```

## Twilio configuration (per hosted number)

In the Twilio console for the real (hosted) number:

| Setting | Value |
|---|---|
| Voice → A call comes in | Webhook `POST {PUBLIC_BASE_URL}/webhooks/voice` |
| Voice → Primary handler fails | **Fail-open fallback**: a TwiML Bin that `<Dial>`s the shadow number — an outage must degrade to "normal phone", never "unreachable" |
| Messaging → A message comes in | Webhook `POST {PUBLIC_BASE_URL}/webhooks/sms` |

## Try it end to end

```bash
TOKEN="Bearer $ADMIN_TOKEN"; BASE=http://localhost:3000

# 1. Register a device (real_number = your Twilio number, shadow_number = a real SIM)
curl -s -X POST $BASE/admin/devices -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Test phone","real_number":"+15550001111","shadow_number":"+15552223333",
       "timezone":"America/Los_Angeles",
       "schedule":[{"days":["Mon","Tue","Wed","Thu","Fri"],"start":"16:00","end":"19:00"}]}'

# 2. Whitelist a parent number
curl -s -X POST $BASE/admin/devices/1/whitelist -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"number":"+15559998888","label":"Mom"}'

# 3. Turn DND on manually
curl -s -X POST $BASE/admin/devices/1/dnd -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"override":"on"}'

# 4. Call/text the Twilio number from a non-whitelisted phone:
#    call -> voicemail greeting; text -> vaulted silently.
#    From the whitelisted number: call rings the shadow SIM with correct caller ID.

# 5. End DND -> held texts arrive as a digest within ~30s
curl -s -X POST $BASE/admin/devices/1/dnd -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"override":"off"}'

curl -s $BASE/admin/devices/1/messages -H "Authorization: $TOKEN"
curl -s $BASE/admin/devices/1/calls -H "Authorization: $TOKEN"
```

## Notes & known scaffold limitations

- SQLite for now (`DATABASE_PATH`); swap for Postgres when the admin console lands.
- Relayed/digest texts are sent from the hosted number with a `From +1...:` body
  prefix — reply threading is solved by the Android agent (renders true senders via
  API sync) or per-contact proxy numbers on iOS (Phase 4).
- MMS inbound is not yet handled (media URLs arrive on the same webhook; store
  `NumMedia`/`MediaUrl0..N` when implementing).
- Never route emergency calls through this server — outgoing 911 uses the SIM by OS
  design, and PSAP callbacks ring the shadow number directly. Do not "fix" that.
- Voicemail recordings currently live at Twilio URLs; pull them into owned storage
  before production.
