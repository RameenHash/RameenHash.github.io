import Database from 'better-sqlite3';
import { config } from './config.js';

export const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS devices (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  real_number   TEXT NOT NULL UNIQUE,  -- E.164, hosted at the provider
  shadow_number TEXT NOT NULL,         -- E.164, the SIM's secret number
  timezone      TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  -- Manual override wins over schedule: 'on' | 'off' | NULL (follow schedule)
  dnd_override  TEXT CHECK (dnd_override IN ('on','off')),
  -- JSON: [{"days":["Mon","Tue","Wed","Thu","Fri"],"start":"16:00","end":"19:00"}]
  schedule_json TEXT NOT NULL DEFAULT '[]',
  otp_passthrough INTEGER NOT NULL DEFAULT 1,
  voicemail_greeting TEXT NOT NULL DEFAULT
    'This person is currently in study mode and cannot take calls. Please leave a message after the tone, or call back later.',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS whitelist (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  number    TEXT NOT NULL,             -- E.164
  label     TEXT,
  UNIQUE (device_id, number)
);

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  body        TEXT NOT NULL,
  -- 'relayed' (delivered immediately), 'held' (in the vault), 'released' (delivered after DND)
  status      TEXT NOT NULL CHECK (status IN ('relayed','held','released')),
  is_otp      INTEGER NOT NULL DEFAULT 0,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  released_at TEXT
);

CREATE TABLE IF NOT EXISTS call_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id     INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  from_number   TEXT NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('bridged','voicemail','error')),
  recording_url TEXT,
  call_sid      TEXT,
  at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tracks last observed DND state per device so the release job can detect the
-- active -> inactive transition even for schedule-driven changes.
CREATE TABLE IF NOT EXISTS dnd_state (
  device_id  INTEGER PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
  active     INTEGER NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

export const queries = {
  deviceByRealNumber: db.prepare('SELECT * FROM devices WHERE real_number = ?'),
  deviceById: db.prepare('SELECT * FROM devices WHERE id = ?'),
  allDevices: db.prepare('SELECT * FROM devices ORDER BY id'),
  insertDevice: db.prepare(`
    INSERT INTO devices (name, real_number, shadow_number, timezone, schedule_json)
    VALUES (@name, @real_number, @shadow_number, @timezone, @schedule_json)`),
  setDndOverride: db.prepare('UPDATE devices SET dnd_override = ? WHERE id = ?'),
  setSchedule: db.prepare('UPDATE devices SET schedule_json = ? WHERE id = ?'),

  whitelistForDevice: db.prepare('SELECT * FROM whitelist WHERE device_id = ?'),
  isWhitelisted: db.prepare('SELECT 1 FROM whitelist WHERE device_id = ? AND number = ?'),
  addWhitelist: db.prepare('INSERT OR IGNORE INTO whitelist (device_id, number, label) VALUES (?, ?, ?)'),
  removeWhitelist: db.prepare('DELETE FROM whitelist WHERE device_id = ? AND number = ?'),

  insertMessage: db.prepare(`
    INSERT INTO messages (device_id, from_number, body, status, is_otp)
    VALUES (@device_id, @from_number, @body, @status, @is_otp)`),
  heldMessages: db.prepare("SELECT * FROM messages WHERE device_id = ? AND status = 'held' ORDER BY received_at"),
  markReleased: db.prepare("UPDATE messages SET status = 'released', released_at = datetime('now') WHERE id = ?"),
  messagesForDevice: db.prepare('SELECT * FROM messages WHERE device_id = ? ORDER BY received_at DESC LIMIT 200'),

  insertCallEvent: db.prepare(`
    INSERT INTO call_events (device_id, from_number, action, recording_url, call_sid)
    VALUES (@device_id, @from_number, @action, @recording_url, @call_sid)`),
  attachRecording: db.prepare('UPDATE call_events SET recording_url = ? WHERE call_sid = ?'),
  callEventsForDevice: db.prepare('SELECT * FROM call_events WHERE device_id = ? ORDER BY at DESC LIMIT 200'),

  getDndState: db.prepare('SELECT * FROM dnd_state WHERE device_id = ?'),
  upsertDndState: db.prepare(`
    INSERT INTO dnd_state (device_id, active, changed_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(device_id) DO UPDATE SET active = excluded.active, changed_at = excluded.changed_at`),
};
