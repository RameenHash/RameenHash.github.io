# Android Platform Capabilities — Study Mode MDM Deep Dive

Research date: August 2026. `[VERIFIED]` = direct fetch of official Android docs or
AOSP source. `[SNIPPET]` = sourced via search extraction of official pages
(developers.google.com / support.google.com were not directly fetchable from this
environment) — re-verify before committing engineering. `[ASSESSMENT]` = inference.

---

## Executive summary

1. **You almost certainly cannot ship a custom DPC.** Google closed new custom-DPC
   registration, and since 2025 Play Protect enforces an **allowlist** of approved DPCs
   at provisioning time — a non-allowlisted DPC fails enrollment with "Harmful app
   blocked." This is the single biggest risk to the project.
2. **Android Management API (AMAPI) can now set your app as default SMS / dialer /
   call-screening app without user consent** — added **October 2025**
   (`defaultApplicationSettings`), which is precisely what this product needs. But the
   SMS piece appears to require **Android 16+** — a severe device-fleet constraint.
3. **Requirements 1 (app blocking), 2 (whitelist-only calls), and 4 (no bypass) are
   cleanly achievable.** Requirement 3 (holding SMS) is achievable for SMS/MMS but
   **RCS will defeat it** on any device where Google Messages retains RCS. This is a
   product-design problem: block Google Messages and disable RCS on the managed SKU.

---

## A. Android Enterprise / Device Policy

### A.1 Device Owner (fully managed) is mandatory — not Profile Owner

| Capability you need | DO (fully managed) | PO (work profile) |
|---|---|---|
| Lock task mode / kiosk | Yes (Android 5.0+) | No |
| Suspend/hide apps in the personal space | Yes | No — PO only controls the work profile |
| `setDefaultSmsApplication` | Yes | Only PO of org-owned managed profile |
| `DISALLOW_FACTORY_RESET`, `DISALLOW_SAFE_BOOT`, `DISALLOW_ADD_USER` | Yes | No |
| `setStatusBarDisabled`, `setKeyguardDisabled` | Yes | No |
| Enterprise FRP | Yes | No |
| Control device-wide calls/SMS | Yes | No |

A work profile is architecturally wrong here: the personal profile (where the apps and
the SIM's messaging live) is outside PO control.

### A.2 Provisioning (all require a factory-fresh device)

| Method | How | Notes |
|---|---|---|
| **QR code** | Tap setup-wizard welcome 6×, scan QR | Android 7.0+. Best for retail fulfilment (card in the box) |
| **Zero-touch** | IMEI pre-registered via authorized reseller; DPC auto-enforced at first boot, cannot be skipped, **survives factory reset** | Strongest anti-bypass. Requires reseller relationship. The one to use |
| `afw#…` identifier | Typed in place of Google account in setup | Fallback; AMAPI uses `afw#setup` |
| `adb dpm set-device-owner` | Dev/testing only | Not shippable |

### A.3 Key DevicePolicyManager capabilities `[VERIFIED unless noted]`

**Kiosk / launcher:** `setLockTaskPackages`, `setLockTaskFeatures` (HOME, OVERVIEW,
GLOBAL_ACTIONS, NOTIFICATIONS, SYSTEM_INFO, KEYGUARD flags),
`addPersistentPreferredActivity` (permanent HOME app), manifest
`android:lockTaskMode="if_whitelisted"`. **"Users cannot exit lock task mode without
DPC intervention"** — this is the no-bypass primitive.

**User restrictions** (`addUserRestriction`): `DISALLOW_FACTORY_RESET`,
`DISALLOW_SAFE_BOOT`, `DISALLOW_ADD_USER`, `DISALLOW_USER_SWITCH`,
`DISALLOW_DEBUGGING_FEATURES` (kills ADB/dev options), `DISALLOW_CONFIG_DATE_TIME`
(schedule evasion), `DISALLOW_APPS_CONTROL` (no force-stop/clear-data),
`DISALLOW_UNINSTALL_APPS`, `DISALLOW_INSTALL_UNKNOWN_SOURCES_GLOBALLY`,
`DISALLOW_AIRPLANE_MODE` (API 28+), `DISALLOW_CREATE_WINDOWS` (blocks overlays),
`DISALLOW_OUTGOING_CALLS` (**emergency calls always permitted** `[VERIFIED]`).

**Anti-tamper:** `setUserControlDisabledPackages` (API 30+), `setUninstallBlocked`,
`setPermittedInputMethods` (rogue keyboards can embed browsers),
`setPermittedAccessibilityServices`, `setStatusBarDisabled`,
`setFactoryResetProtectionPolicy` (Android 11+).

### A.4 Custom DPC vs Android Management API — the consequential decision

`[SNIPPET — high confidence, corroborated across multiple sources]`

- **New custom-DPC registration is closed.** New EMM solutions must use AMAPI, which
  ships Google's own DPC (Android Device Policy) as Device Owner.
- Play EMM API methods used by custom DPCs were turned off **30 September 2025**.
- **Play Protect DPC allowlist (live since 2025):** only Google-approved DPCs may
  provision; others fail with "Harmful app blocked." Appeals: multi-week to
  multi-month, frequent rejections.

| | Custom DPC | AMAPI |
|---|---|---|
| Registration | **Closed to new entrants** | Open (GCP project) |
| Provisioning | Blocked by Play Protect allowlist | Works out of the box |
| DevicePolicyManager access | Direct, instant, offline | None — JSON policy enforced by Google's DPC |
| Default SMS/dialer/screening control | `setDefaultSmsApplication` (API 29+), `setDefaultDialerApplication` (API 34+) | `defaultApplicationSettings` policy (Oct 2025) |
| Custom on-device logic | Unlimited | Your app is a normal app granted privileged roles by policy |

**Recommendation `[ASSESSMENT]`:** Build on AMAPI; assume custom DPC is unavailable
(file an allowlist appeal in parallel, don't block on it). Under AMAPI your device-side
app can't call DO methods — so "study mode on" must be enforced **inside your own app**
(you ARE the launcher, the SMS app, and the call screener), with AMAPI providing the
static scaffolding (which apps exist, which roles you hold, what the user can't change).
Local enforcement is instant, works offline, and survives FCM delivery failures.

---

## B. Blocking apps on demand

**`setPackagesSuspended` — the right primary tool.** Suspended apps: icon greyed out;
tapping shows a system dialog **customizable via `SuspendDialogInfo`** ("Study mode
until 4:30 PM — tap for details"); cannot start activities; **notifications
suppressed**; cannot show dialogs/toasts, play audio, or vibrate; data retained.

**Cannot be suspended:** device admins, the active launcher, package
installer/uninstaller/verifier, **the default dialer**, permission controller.
`[ASSESSMENT]` This exclusion list is a gift — the emergency dialer is structurally
unsuspendable, and if your app is the launcher you can never brick yourself.

**Recommended layered composition `[ASSESSMENT]`:**
1. **Baseline (always on):** your app is the persistent HOME activity; non-approved
   apps are `installType: BLOCKED` — they never exist on the device. Curated-device layer.
2. **Study mode on:** `setPackagesSuspended(approvedButNotDuringStudy, true)` —
   instant, local, self-explaining dialog.
3. **Hard mode (optional):** lock task mode with only launcher + dialer allowlisted,
   features = HOME | KEYGUARD | SYSTEM_INFO (omit NOTIFICATIONS and GLOBAL_ACTIONS).

**Latency:** `setPackagesSuspended` is a synchronous binder call — effectively
instantaneous, works offline. Server-pushed AMAPI policy changes are FCM-dependent
(Family Link's comparable pushes: ~5 min or next connection). **Precompute schedules
on-device; reserve server push for schedule changes and manual overrides.**

---

## C. Calls

### C.1 CallScreeningService — yes, it can silently reject non-whitelisted calls `[VERIFIED — AOSP javadoc]`

`CallResponse.Builder`:

| Method | Behavior |
|---|---|
| `setDisallowCall(true)` | Block the incoming call |
| `setRejectCall(true)` | Disconnect as if user rejected (requires disallow) |
| `setSilenceCall(true)` | No ringtone, call still arrives + logged |
| `setSkipCallLog(true)` | Not shown in call log (only if disallowed) |
| `setSkipNotification(true)` | No missed-call notification (only if disallowed) |

- **Fully invisible reject:** disallow + reject + skipCallLog + skipNotification.
- **Silent-but-logged:** `setSilenceCall(true)` alone — useful for a "held calls" review list.
- **5-second response budget** — whitelist lookup must be entirely local. `[VERIFIED]`
- Framework binds to the app holding `ROLE_CALL_SCREENING`; the default dialer can
  implement screening implicitly. `[VERIFIED]`
- `Call.Details.getCallerNumberVerificationStatus()` gives STIR/SHAKEN attestation. `[VERIFIED]`

### C.2 Emergency calls — safe by construction

- **Outgoing emergency calls can never be blocked** (platform invariant; exempt from
  `DISALLOW_OUTGOING_CALLS`; reachable from keyguard). `[VERIFIED]`
- **Emergency callback mode:** incoming calls with `PROPERTY_EMERGENCY_CALLBACK_MODE`
  **skip call filtering entirely** — a PSAP calling back after a 911 dial rings through
  regardless of your whitelist. Correct and required; surface it as a safety feature. `[SNIPPET]`
- Keep the default dialer on the lock-task allowlist (it's unsuspendable anyway) and
  the emergency story works with zero special-casing.

### C.3 Setting default dialer/screening without user consent — yes

- **DPM route:** `setDefaultDialerApplication` (API 34/Android 14) — DO callable. `[SNIPPET]`
- **AMAPI route (Oct 2025):** `defaultApplicationSettings` with `DEFAULT_DIALER`
  ("fully managed devices on Android 14 and 15" — verify whether that means 14+),
  `DEFAULT_CALL_SCREENING`, `DEFAULT_CALL_REDIRECTION`. **"Once configured, this policy
  prevents users from changing the default application settings."** `[SNIPPET]`

---

## D. SMS holding

### D.1 The default SMS app mechanism — works exactly as hoped `[VERIFIED]`

- `SMS_DELIVER_ACTION` / `WAP_PUSH_DELIVER_ACTION` are delivered **only to the default
  SMS app**; only the default handler can write the SMS provider.
- Android itself posts no notification for an incoming text — the default SMS app does.
  If your app is the default handler: receive `SMS_DELIVER`, store the message
  (encrypted), **post nothing** during study mode, then show a digest ("4 messages
  while you were studying") when the mode ends. No platform mechanism is defeated.
  **The single cleanest part of the whole design.**

### D.2 Setting the default SMS role programmatically

- **DPM:** `setDefaultSmsApplication` — **API 29 / Android 10**, DO or PO of org-owned
  managed profile. `[SNIPPET]`
- **AMAPI:** `DEFAULT_SMS` — *"supported on company-owned devices on **Android 16 and
  above**."* `[SNIPPET]`

> ⚠️ **The sharpest fork in the road:** if AMAPI `DEFAULT_SMS` truly requires Android
> 16+, your device fleet is dictated by it (the API-29 DPM route sits behind the closed
> custom-DPC door). **Verify this first.** It argues strongly for selling/bundling a
> fixed hardware SKU on Android 16+ (as Gabb/Pinwheel/Bark all do) rather than BYOD.

The consumer path (`ACTION_CHANGE_DEFAULT`) prompts the user; the DPM/AMAPI paths
bypass the prompt — that's what a managed device buys you. `[VERIFIED]`

### D.3 ⚠️ RCS — the load-bearing problem `[SNIPPET, high confidence]`

- **Only Google Messages can access Android's RCS API** (hidden, internally
  allowlisted; third parties have been asking for years).
- RCS is delivered via Google Jibe / carrier RCS servers — **not** via `SMS_DELIVER`.

| Scenario | Result |
|---|---|
| Google Messages installed, RCS on | RCS messages arrive and notify, bypassing your hold. **Requirement fails** |
| Google Messages suspended during mode | Notifications suppressed, but messages are held by Google Messages — invisible to your digest |
| **Google Messages BLOCKED; RCS disabled device-wide** | Your app is the sole messaging surface. **Fully works.** Senders' phones fall back to SMS |

The only clean answer is the third — which is why every serious product in this space
controls the OS image or device SKU. User-visible cost: no typing indicators, read
receipts, high-res media; green-bubble-style degradation in group chats. Decide
deliberately.

### D.4 Other SMS pitfalls

- **MMS:** as default handler you own `WAP_PUSH_DELIVER` and must implement MMS
  download yourself (APN config, `downloadMultimediaMessage`) — carrier-variable and
  routinely underestimated.
- **Leakage via `RECEIVE_SMS`:** the legacy `SMS_RECEIVED_ACTION` broadcast still goes
  to every app holding `RECEIVE_SMS`. Mitigate: block all non-approved apps + deny the
  SMS permission group by policy (`permissionGrants` DENY default).
- **OTP / 2FA codes:** holding SMS means holding verification codes. Design a carve-out
  (parse for OTP patterns, pass through or "show codes only" affordance). Test Play
  Services SMS Retriever / User Consent paths separately.
- **Play distribution:** SMS/Call Log permission groups are restricted on Google Play —
  default-handler status + declaration form required. Distribute as a **private app
  via managed Google Play**; raise the compliance question with Google early.

---

## E. DND / notifications

- **`NotificationListenerService` cannot prevent a notification from posting** — it is
  strictly reactive (cancel after sound/vibration/heads-up already fired). Use only for
  observability, never enforcement. `[VERIFIED]`
- **Package suspension suppresses notifications at delivery** — strictly stronger than
  DND, no special grant needed. This is the correct primary mechanism; since study mode
  already suspends everything outside the whitelist, notification suppression comes free.
- Lock task mode without `LOCK_TASK_FEATURE_NOTIFICATIONS` suppresses display wholesale;
  `setStatusBarDisabled(true)` blocks the shade.
- **DND (`setInterruptionFilter`)** requires `ACCESS_NOTIFICATION_POLICY`, which cannot
  be requested via dialog; whether DO/AMAPI can grant it without user action is
  **unverified** — design DND as an optional belt-and-braces layer only.
- **Open item — prototype early:** does an incoming whitelisted call render correctly
  in lock task mode with notifications disabled? Docs don't answer it; it's the
  requirement-2 happy path.

---

## F. Anti-bypass

### Factory reset / FRP

- `DISALLOW_FACTORY_RESET` blocks the Settings path but **not** the recovery-menu path.
- `setFactoryResetProtectionPolicy` (Android 11+) controls which accounts may
  re-provision post-reset.
- **Android ≤14:** enabling OEM unlocking + hard reset **bypasses account validation** —
  the classic teenage bypass, widely documented on YouTube.
- **Android 15+:** OEM-unlocking no longer affects the reset process; enterprise FRP is
  always enforced. A genuinely significant hardening.
- **Zero-touch re-enforces the DPC on first boot after any reset and cannot be skipped.**

### Bypass vector table

| Vector | Mitigation | Residual risk |
|---|---|---|
| Uninstall agent | DO can't be uninstalled; `setUninstallBlocked` | Low |
| Force-stop / clear data | `setUserControlDisabledPackages`, `DISALLOW_APPS_CONTROL` | Low |
| Safe mode | `DISALLOW_SAFE_BOOT` | Low |
| Recovery-menu factory reset | Enterprise FRP + zero-touch | Low on A15+, **high on ≤A14** |
| Bootloader unlock / fastboot | Hardware choice: locked bootloader | **Unmitigable in software** |
| ADB / developer options | `DISALLOW_DEBUGGING_FEATURES` | Low |
| Clock change to escape schedule | `DISALLOW_CONFIG_DATE_TIME` + AUTO_TIME + server-anchored time | Low if handled |
| Airplane mode to dodge policy push | **Enforce locally on-device, never depend on live push** | — |
| Secondary user / guest | `DISALLOW_ADD_USER`, `DISALLOW_USER_SWITCH` | Low |
| Third-party launcher | `addPersistentPreferredActivity` | Low |
| Overlays | `DISALLOW_CREATE_WINDOWS` | Low |
| Rogue keyboard with embedded browser | `setPermittedInputMethods` | **Commonly overlooked** |
| Accessibility automation | `setPermittedAccessibilityServices` | Low |
| Sideloading | `DISALLOW_INSTALL_UNKNOWN_SOURCES_GLOBALLY` | Low |
| **RCS bypassing held SMS** | Block Google Messages + disable RCS | **The real one** |
| SMS leak via `RECEIVE_SMS` | Deny SMS permission group; block non-approved apps | Low |

The two vectors that will actually bite are **RCS** and **pre-Android-15 OEM-unlock
reset**. Both are solved by controlling the hardware SKU. Everything else is a config line.

---

## G. Existing products `[ASSESSMENT — directional]`

| Product | Approach | Signal |
|---|---|---|
| Gabb | Custom OS (GabbOS) on Samsung A15 5G; no browser/store | Concluded platform APIs alone were insufficient |
| Pinwheel | Own hardware + custom launcher OS; caregiver portal, curated catalog | Closest to the "baseline layer" model |
| Bark Phone | Samsung + Bark software; approval-gated installs, granular Settings control | Implies Device Owner + Knox |
| Troomi | Custom OS on Samsung, curated apps | Same pattern |
| Google Family Link | Supervised Google Account (not a DPC); ~5-min block latency; documented bypasses | The weakest model — what no-DO gets you |
| Truple / Canopy | AccessibilityService + deprecated Device Admin | The approach to avoid — fragile, trivially bypassed |

**Every product that reliably achieves "cannot bypass" either ships its own
hardware/OS image or runs fully managed Android Enterprise. None achieve it as an
installable app on a user-owned phone.**

---

## Consolidated feasibility

| Req | Mechanism | Verdict |
|---|---|---|
| 1. Block all apps except whitelist | `setPackagesSuspended` + persistent HOME + optional lock task | ✅ Solid — instant, offline, good UX |
| 2. Whitelist-only calls | `CallScreeningService` (disallow/reject/skipLog/skipNotification); role forced by policy | ✅ Solid — emergency + ECBM exempt by design; 5s budget ⇒ local whitelist |
| 3. Hold SMS invisibly | Custom default SMS app; receive `SMS_DELIVER`, post nothing, digest on mode end | ⚠️ Works for SMS/MMS. **Defeated by RCS** unless Google Messages blocked + RCS off. Possibly Android 16+ via AMAPI |
| 4. No bypass | DO + restrictions + lock task + enterprise FRP + zero-touch | ✅ Solid on Android 15+/locked bootloader |

### Open questions to resolve before committing engineering

1. **Does AMAPI `DEFAULT_SMS` really require Android 16+?** Highest-leverage unknown —
   dictates the entire device strategy.
2. **Is a custom DPC obtainable at all?** File the Play Protect allowlist appeal in
   parallel; don't block on it.
3. **Can `ACCESS_NOTIFICATION_POLICY` be granted by policy?** Affects only the optional
   DND layer.
4. **Does a whitelisted incoming call render in lock task mode with notifications
   disabled?** Prototype early.
5. **Play policy for a private-app default SMS handler via managed Google Play** —
   raise with Google before building.

### Key URLs

- Lock task mode: https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode
- Dedicated devices cookbook: https://developer.android.com/work/dpc/dedicated-devices/cookbook
- DevicePolicyManager: https://developer.android.com/reference/android/app/admin/DevicePolicyManager
- Screen calls: https://developer.android.com/develop/connectivity/telecom/dialer-app/screen-calls
- CallScreeningService: https://developer.android.com/reference/android/telecom/CallScreeningService
- Default-handler permissions: https://developer.android.com/guide/topics/permissions/default-handlers
- SMS/Call Log Play policy: https://support.google.com/googleplay/android-developer/answer/10208820
- AE deprecations: https://developers.google.com/android/work/deprecations
- Approved DPC allowlist: https://support.google.com/work/android/answer/16694822
- AMAPI default application settings: https://developers.google.com/android/management/default-application-settings
- AMAPI app roles: https://developers.google.com/android/management/app-roles
- Provisioning: https://developers.google.com/android/management/provision-device
- Enterprise FRP: https://support.google.com/work/android/answer/14549362
