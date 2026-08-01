/**
 * Provider interface.
 *
 * The gateway's policy logic never talks to a telephony vendor directly; it goes
 * through this interface so webhook mode (Twilio, current) can be swapped for a
 * self-hosted SIP/FreeSWITCH backend later without touching policy code.
 * See docs/mdm-focus-platform/telephony-gateway.md ("What runs where").
 *
 * A provider module must export:
 *
 *   verifyWebhook(req) -> boolean
 *     Authenticate that an inbound webhook genuinely came from the provider.
 *
 *   bridgeCallResponse({ toShadowNumber, callerId }) -> string (response body)
 *     Instruct the provider to connect the inbound call to the device,
 *     presenting the original caller's number as caller ID.
 *
 *   voicemailResponse({ greeting, recordingCallbackUrl }) -> string
 *     Instruct the provider to play the greeting and record a voicemail.
 *
 *   sendSms({ to, from, body }) -> Promise<void>
 *     Send an outbound SMS (used for relays and digest delivery).
 *
 *   contentType -> string
 *     Content-Type for webhook response bodies (e.g. text/xml for TwiML).
 */
export {};
