import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNumber, isDndActive, looksLikeOtp } from '../src/policy.js';

test('normalizeNumber handles common US formats', () => {
  assert.equal(normalizeNumber('(555) 123-4567'), '+15551234567');
  assert.equal(normalizeNumber('15551234567'), '+15551234567');
  assert.equal(normalizeNumber('+15551234567'), '+15551234567');
  assert.equal(normalizeNumber('+447911123456'), '+447911123456');
});

const baseDevice = {
  dnd_override: null,
  timezone: 'UTC',
  schedule_json: JSON.stringify([{ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start: '16:00', end: '19:00' }]),
};

// 2026-08-03 is a Monday.
const mondayAt = (hhmm) => new Date(`2026-08-03T${hhmm}:00Z`);
const saturdayAt = (hhmm) => new Date(`2026-08-01T${hhmm}:00Z`);

test('schedule window activates DND during study hours', () => {
  assert.equal(isDndActive(baseDevice, mondayAt('17:30')), true);
  assert.equal(isDndActive(baseDevice, mondayAt('15:59')), false);
  assert.equal(isDndActive(baseDevice, mondayAt('19:00')), false);
  assert.equal(isDndActive(baseDevice, saturdayAt('17:30')), false);
});

test('manual override beats schedule', () => {
  assert.equal(isDndActive({ ...baseDevice, dnd_override: 'on' }, saturdayAt('03:00')), true);
  assert.equal(isDndActive({ ...baseDevice, dnd_override: 'off' }, mondayAt('17:30')), false);
});

test('windows crossing midnight', () => {
  const night = {
    ...baseDevice,
    schedule_json: JSON.stringify([{ days: ['Mon'], start: '22:00', end: '06:00' }]),
  };
  assert.equal(isDndActive(night, mondayAt('23:00')), true);
  assert.equal(isDndActive(night, mondayAt('05:00')), true);
  assert.equal(isDndActive(night, mondayAt('12:00')), false);
});

test('empty schedule means DND off', () => {
  assert.equal(isDndActive({ ...baseDevice, schedule_json: '[]' }, mondayAt('17:30')), false);
});

test('OTP detection', () => {
  assert.equal(looksLikeOtp('Your verification code is 482913'), true);
  assert.equal(looksLikeOtp('483920 is your Google verification code.'), true);
  assert.equal(looksLikeOtp('Use PIN 4821 to log in'), true);
  assert.equal(looksLikeOtp('hey wanna hang out at 7'), false);
  assert.equal(looksLikeOtp('meet me at 1600 main st'), false);
});
