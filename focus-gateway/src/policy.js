// Pure policy logic — no database or config imports, so it stays unit-testable
// and reusable when the provider backend is swapped.

// Normalize to E.164-ish for comparison: strip everything but digits and a leading +,
// and assume US country code for bare 10-digit numbers.
export function normalizeNumber(raw) {
  if (!raw) return '';
  let n = String(raw).replace(/[^\d+]/g, '');
  if (!n.startsWith('+')) {
    if (n.length === 10) n = `+1${n}`;
    else if (n.length === 11 && n.startsWith('1')) n = `+${n}`;
    else n = `+${n}`;
  }
  return n;
}

// Evaluate whether DND is active for a device right now.
// Manual override wins; otherwise the schedule windows are evaluated in the
// device's own timezone so server region never affects study hours.
export function isDndActive(device, now = new Date()) {
  if (device.dnd_override === 'on') return true;
  if (device.dnd_override === 'off') return false;

  let windows;
  try {
    windows = JSON.parse(device.schedule_json);
  } catch {
    return false;
  }
  if (!Array.isArray(windows) || windows.length === 0) return false;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: device.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const day = get('weekday'); // 'Mon', 'Tue', ...
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  return windows.some((w) => {
    if (!w.days?.includes(day)) return false;
    const start = toMinutes(w.start);
    const end = toMinutes(w.end);
    // Windows that cross midnight (e.g. 22:00-06:00) split on the day boundary.
    if (end >= start) return minutes >= start && minutes < end;
    return minutes >= start || minutes < end;
  });
}

// Verification codes must not be silently held during DND (account lockouts).
// Heuristic: a 4-8 digit code near typical OTP phrasing.
const OTP_PATTERNS = [
  /\b(code|otp|verification|verify|passcode|pin)\b[^]{0,40}?\b\d{4,8}\b/i,
  /\b\d{4,8}\b[^]{0,40}?\b(code|otp|verification|verify|passcode|pin)\b/i,
];

export function looksLikeOtp(body) {
  return OTP_PATTERNS.some((re) => re.test(body ?? ''));
}

// The single decision point used by both the voice and SMS webhooks.
// Returns 'pass' (deliver/ring through) or 'hold'.
export function decide(device, { whitelisted }) {
  if (!isDndActive(device)) return 'pass';
  if (whitelisted) return 'pass';
  return 'hold';
}
