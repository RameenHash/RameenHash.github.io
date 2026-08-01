# iOS Platform Capabilities — Study Mode MDM Deep Dive

Research date: August 2026. Verified against Apple developer documentation, the
`apple/device-management` schema repo (release branch), Apple Support deployment
guides, and Apple Developer Forums (including Apple DTS / Frameworks Engineer replies).

Legend: `[V]` = verified against primary Apple source. `[V-2nd]` = verified against
credible secondary source (vendor docs, forum consensus). `[A]` = assessment/inference.

---

## Headline verdict

| Requirement | Achievable? | Mechanism |
|---|---|---|
| 1. Block all apps except allowlist | **YES** | MDM `allowListedAppBundleIDs` (supervised) — best; or Screen Time API `.all(except:)` — weaker |
| 2. Block incoming calls except whitelist + emergency | **NO programmatically.** Only via Apple's built-in Screen Time *Communication Limits*, configured manually/by Family Sharing parent — **and that path is mutually exclusive with MDM** | See §C |
| 3. Suppress/hold SMS + iMessage until mode ends | **NO** for "hold/delay." **YES** for "user never sees them during the mode" | MDM Notifications payload + app allowlist. No delivery deferral exists. See §D |
| 4. User cannot bypass | **YES (strong)** with supervision + ADE + non-removable enrollment | See §E |

### The single most important architectural constraint (VERIFIED)

> **Child authorizations in FamilyControls require devices not to be enrolled in mobile
> device management (MDM). Calling `AuthorizationCenter.shared.requestAuthorization(for: .child)`
> while the device is enrolled in MDM will result in `FamilyControlsError.restricted`.**
> — Apple Frameworks Engineer, https://developer.apple.com/forums/thread/746716 `[V]`
> Device log emitted: `"Family Controls permission requirement is not satisfied (device is managed by MDM)"`

**You must pick one stack.** MDM+supervision, or Screen Time API with `.child`
authorization. You cannot combine MDM's app allowlisting with FamilyControls
parent-guardian enforcement on the same device. (`.individual` authorization *does*
coexist with MDM — some vendors do this — but `.individual` explicitly removes the
anti-bypass protections; see §B.)

---

## A. Apple MDM Protocol — App Blocking on Supervised Devices

### A.1 The core primitive `[V]`

From `apple/device-management` → `mdm/profiles/com.apple.applicationaccess.yaml` (release branch):

```yaml
- key: allowListedAppBundleIDs
  title: Allow Listed Apps
  supportedOS:
    iOS: { introduced: '15.0', supervised: true, userenrollment: { mode: forbidden } }
  type: <array>
  content: If present, the system only shows or can launch apps with bundle IDs in
    the array. Include the value `com.apple.webapp` to allow all webclips. This applies
    to App Store apps, marketplace apps, and locally installed apps.

- key: blockedAppBundleIDs
  supportedOS: iOS { introduced: '15.0', supervised: true, userenrollment: forbidden }
  content: If present, the system prevents showing or launching apps with bundle IDs
    in the array... Note: Denying system apps may disable other functionality.
```

Verified properties:
- Requires **supervision**. **Forbidden under User Enrollment.** iOS 15.0+. (Replaced the deprecated `whitelistedAppBundleIDs`/`blacklistedAppBundleIDs`.) `[V]`
- Behavior is **hide + prevent launch**, not uninstall. Restricted apps disappear from Home Screen/App Library/Spotlight; data is preserved; they reappear when the restriction is removed. `[V-2nd — Jamf]`
- Applies to system apps too (Phone `com.apple.mobilephone`, Messages `com.apple.MobileSMS`, Safari `com.apple.mobilesafari`, FaceTime `com.apple.facetime`, App Store `com.apple.AppStore`, Settings `com.apple.Preferences`). `[V-2nd]`
- **Gotcha:** Web Clips vanish unless you explicitly include the literal string `com.apple.webapp` in the allowlist. `[V + V-2nd Jamf]`
- **Known bug (iOS 18):** applying `allowListedAppBundleIDs` to a supervised iPhone caused native apps on the *paired Apple Watch* to disappear even when allowlisted. `[V-2nd]`

### A.2 Can MDM "hide/block all apps on demand"? — YES `[V]/[A]`

Ship a second, "Study Mode" Restrictions profile containing
`allowListedAppBundleIDs = ["com.apple.mobilephone", "com.apple.webapp", "<your-agent-app>"]`.
Install to activate; remove to deactivate. This is exactly how MDM-based
kiosk/"lockdown window" products work.

Caveats:
- **Only ONE `com.apple.applicationaccess` payload may be installed at a time on iOS** (`multiple: false`). Model Study Mode as *swapping* the single restrictions profile, not layering. `[V/A]`
- Home Screen layout is separately controllable via `com.apple.homescreenlayout` (supervised) for a clean "study" springboard. `[A]`

### A.3 Latency

The legacy path is: MDM server → APNs push → device wakes → device polls MDM server →
receives `InstallProfile`/`RemoveProfile` → applies → `Acknowledged`.

- **Realistic latency: ~2–15 seconds** when the device is awake, unlocked, on good network. `[A]`
- **Degrades to minutes** if asleep, Low Power Mode, poor cellular, APNs coalescing. **Unbounded if offline** — the command queues until next check-in. `[A]`
- You cannot guarantee sub-minute activation — a schedule-driven "study mode starts at 7pm" will not be crisp via MDM push alone. `[A]`
- **Mitigation — Declarative Device Management (DDM):** ships policy + activation predicate to the device ahead of time; the device self-applies without a round trip. `[V-2nd]` **However:** DDM predicates evaluate device *state* — **no documented time-of-day/schedule predicate exists**, and **no DDM configuration for app allowlisting as of the OS 26 generation.** `[A — open verification item against the iOS 27 beta schema]`
- **WWDC26 (iOS 27) direction:** Apple announced app restrictions moving to native binary-level control using the Endpoint Security Framework, and broad migration of restrictions payloads → declarative configurations. Re-verify `com.apple.applicationaccess` deprecation status against the iOS 27 schema before committing. `[V-2nd]`

### A.4 Enrollment types — what you need `[V/V-2nd]`

| Method | Supervised? | `allowListedAppBundleIDs`? | Non-removable? |
|---|---|---|---|
| **Automated Device Enrollment (ADE)** via ABM/ASM | **Yes** | **Yes** | **Yes** (`is_mdm_removable: false`) |
| Apple Configurator (USB, wipes device) | Yes | Yes | Yes (if configured; 30-day unenroll window on manually added devices) |
| Profile-based Device Enrollment | No | No | No — removable in Settings |
| Account-driven Device Enrollment | No on iPhone/iPad | No | No |
| Account-driven **User Enrollment** | No | **Explicitly forbidden** | No |

Requirements for the real product:
1. Apple Business Manager or Apple School Manager account (free; requires D-U-N-S number and verification). Consumer parents **cannot** get ABM for a family device without a business entity — a real go-to-market blocker. `[A]`
2. Device purchased through an ABM-linked reseller/Apple, **or** added via Apple Configurator (physical USB access, full wipe, 30-day user unenroll window). `[V-2nd]`
3. Your MDM server registered in ABM with an APNs MDM push certificate.

### A.5 Lock Screen / App Lock

- **Single App Mode** (`com.apple.app.lock`, supervised): locks device to exactly one app. Nuclear option — incompatible with "Phone allowed for emergencies." `[V-2nd]`
- **Autonomous Single App Mode (ASAM)**: app opts itself in/out; MDM pre-authorizes the bundle ID. `[V-2nd]`
- **Recommended:** app allowlisting, not Single App Mode — preserves Phone-for-emergencies. `[A]`

---

## B. Screen Time API (FamilyControls / ManagedSettings / DeviceActivity)

### B.1 Entitlement and authorization `[V]`

- **Development** entitlement: works locally, no approval. **Distribution** entitlement (`family-controls-distribution`): **manual Apple request + human review**, per bundle ID, **and separately for every Screen Time app extension** (DeviceActivityMonitor, DeviceActivityReport, ShieldConfiguration, ShieldAction). `[V]`
- Turnaround: officially "a few business days"; forum reports of 10+ days to 3+ weeks with no response. **Budget 2–6 weeks; treat approval as schedule risk.** `[V-2nd]`
- Apple requires a genuine parental-control / digital-wellbeing use case in the written justification. `[V-2nd]`

### B.2 `.child` vs `.individual` — the anti-bypass difference `[V]`

Apple (verbatim): authorizing `.child` "prevents the child user from deleting the app
that provides parental controls" and "the user can't sign out of iCloud." For
`.individual`: "the system removes any restrictions that prevent the user from
bypassing parental controls so the user can delete an authorized app or sign out of
iCloud as needed."

| | `.child` | `.individual` |
|---|---|---|
| Approval | Parent/guardian in same Family Sharing group | Device owner, Face ID/Touch ID |
| Requires child iCloud account in iCloud Family | Yes | No |
| **Works on MDM-enrolled device** | **NO — `FamilyControlsError.restricted`** `[V]` | Yes |
| Blocks app deletion | **Yes** | **No** |
| Blocks iCloud sign-out | **Yes** | **No** |

**`.individual` is unusable for the no-bypass requirement — the user simply deletes your app.** `[A]`

### B.3 Can it block ALL apps? — Almost `[V]`

```swift
let store = ManagedSettingsStore()
store.shield.applicationCategories = .all(except: allowedTokens)  // max 50 exception tokens
```

Verified limitations:
1. **System apps are not covered by category shields** — Phone, Messages, Settings, Camera etc. sit in Screen Time's "Always Allowed" list; only directly-selected tokens can shield them, and "Always Allowed" is not programmatically writable. `[V-2nd — forums 729891, 724419]`
2. **`.all(except:)` is buggy — allowlisted apps get shielded anyway** (FB15500605; acknowledged by Apple Frameworks Engineer, forum 766766). `[V]`
3. **Shielding an app token can shield sibling apps in the same app group** — cannot be overridden. `[V-2nd]`
4. **Tokens are opaque** — cannot be derived from bundle IDs; selection only via `FamilyActivityPicker` UI. You cannot curate an allowlist server-side. `[V-2nd]`
5. **Shields can persist after your app is uninstalled**, leaving the device locked with a generic shield (forum 802242, Apple DTS investigating). Serious support/liability risk. `[V-2nd]`
6. **`ManagedSettingsStore` is advisory** — "The system doesn't guarantee that the settings you specify govern the device's behavior." `[V]`
7. **Remote activation is unreliable** — settings must be written by your app/extension on-device; silent pushes are throttled; `DeviceActivityMonitor` fires only at pre-scheduled boundaries. Scheduled Study Mode is reliable; on-demand "start now" is best-effort. `[V-2nd/A]`

### B.4 What Screen Time API cannot do at all `[V]`

Cannot block/filter phone calls; cannot touch SMS/iMessage content, delivery, or
notifications; cannot set/read Apple's Communication Limits; cannot enumerate installed
apps; cannot enable/disable Focus modes.

---

## C. Calls

### C.1 CallKit Call Directory extension — cannot do allowlist mode `[V]`

- **Blocklist only.** No allowlist/deny-by-default API. Emulating "block all except whitelist" would require enumerating the numbering plan (~6 billion NANP entries). Not feasible. `[V]`
- Static data source refreshed offline — no per-call callback, no network access at call time. `[V]`
- User-toggled in Settings; **no MDM payload exists to force-enable a Call Directory extension.** `[A]`

### C.2 Live Caller ID Lookup (iOS 18+) — closer, but still not an allowlist `[V]`

The only dynamic server-driven call-blocking mechanism on iOS, but: requires
homomorphic-encryption PIR infrastructure + Apple-validated OHTTP relays + a separate
entitlement review; responses are cached per-number (no real-time policy flips);
designed for finite spam databases, not deny-by-default; poor reliability in field
reports; user-toggleable. **Unsuitable for a safety-grade "no calls" guarantee.** `[V/A]`

### C.3 Can MDM block calls? — Essentially no `[V]`

Grep of the complete `com.apple.applicationaccess.yaml` schema (209 keys): **no
restriction filters, blocks, or allowlists incoming voice calls.** Call-adjacent keys
are limited to `allowCallRecording`, `allowDefaultCallingAppModification`,
`allowFaceTime`, `deniedICCIDsForiMessageFaceTime`. Hiding the Phone app does **not**
stop the phone from ringing — incoming-call UI is system-level (telephonyd), not the
Phone app. `[V/A]`

### C.4 Can Focus mode be enforced via MDM? — NO `[V]`

**No Focus or Do Not Disturb key exists anywhere in the Apple restrictions schema**
(verified by regex over all 209 keys). Corroborated by Jamf Nation. There is likewise
no public API for a third-party app to activate a Focus mode.

> Myth check: `allowFocus`, `allowDoNotDisturb`, and a global `allowNotifications`
> restriction key **do not exist**. Do not build on them.

### C.5 Apple's built-in Screen Time Communication Limits — the ONLY thing that does what you want `[V]`

Apple Support: "You can either allow or block communication — including incoming and
outgoing phone calls, FaceTime calls, and messages — from certain contacts in iCloud,
either at all times or during certain periods." Emergency numbers always reachable.

This is exactly requirements 2 and 3 — and **you cannot access it**:
- No public API (zero Communication Limits surface in FamilyControls/ManagedSettings). `[V]`
- No MDM payload. `[V]`
- Configured only via device Settings (behind a Screen Time passcode) or remotely by a Family Sharing organizer/parent.
- Only matches contacts stored in **iCloud Contacts**. `[V-2nd]`
- `[A]` Untested hybrid: Communication Limits is a Settings feature, not an API, so a parent *might* be able to set it manually via Family Sharing on an MDM-supervised device. Verify on real hardware; if it works it is the best available answer for calls on iOS.

### C.6 Carrier-level `[A]`

- Major US carriers do not expose per-line "allowlist-only inbound" APIs to third parties.
- Kid-phone products (Gabb, Troomi, Pinwheel) enforce contact allowlists at the **MVNO/network level**. This is the only truly reliable, un-bypassable way to satisfy whitelist-only calling on iOS.
- MDM can pin the device to a managed eSIM (`forcePreserveESIMOnErase`) to prevent SIM swapping. `[V]`

---

## D. SMS / iMessage Suppression

### D.1 The direct answer: NO `[V]`

**There is no sanctioned way for any third-party app or for MDM to intercept, read,
hide, delete, hold, or delay SMS or iMessage on iOS.** Confirmed by exhaustion:

- **IdentityLookup / `ILMessageFilterExtension`** (the only message-adjacent API) works only with SMS/MMS from **unknown senders** — never iMessage, never known contacts. It can only classify into Junk/Promotional/Transactional (message is already delivered); it cannot delete, hold, or delay; it cannot pass content to your app or server; it is user-toggleable with no MDM enforcement key. `[V]`
- No notification-read API exists for other apps' notifications. `[A]`
- Delivery cannot be deferred: iMessage is APNs→IMDaemon, SMS is baseband→CommCenter; neither is exposed. There is no hold-and-release queue. `[A, high confidence]`

### D.2 The closest achievable — and it's actually good `[V]`

**Mechanism 1 — MDM Notifications payload (`com.apple.notificationsettings`)**
(iOS 9.3+, supervised, forbidden under User Enrollment):

> "The profile specifies notification settings by bundle identifier (even for apps that
> aren't installed on the device yet), and **those settings will always be enforced.**"

Per-app keys: `NotificationsEnabled`, `ShowInNotificationCenter`, `ShowInLockScreen`,
`AlertType`, `BadgesEnabled`, `SoundsEnabled`. Set `NotificationsEnabled = false` for
`com.apple.MobileSMS` — and pair with `allowNotificationsModification = false` so the
user cannot re-enable it. `[V]`

**Mechanism 2 — hide the Messages app** via `allowListedAppBundleIDs` (omit
`com.apple.MobileSMS`). Note: `allowChat = false` kills iMessage but **not** SMS. `[V]`

Net result of 1+2 combined:

| Behavior | Achieved? |
|---|---|
| Message is not delivered until mode ends | **No** — delivered silently, immediately |
| No banner, sound, badge, or lock-screen alert | **Yes** |
| User cannot open Messages to check | **Yes** (app hidden) |
| User cannot re-enable notifications | **Yes** |
| Messages all appear at once when mode ends | **Yes, effectively** — removing the profile restores the app with the full backlog |
| Sender sees "Delivered" during the mode | **Yes** — unavoidable |

Functionally equivalent to the goal from the *student's* perspective; not from the
sender's. If the promise is "texts held until 9pm," accept presentation-layer-only, or
own the transport with a custom messaging app (both parties must use it). `[A]`

---

## E. Anti-Bypass

### E.1 What supervision + ADE actually enforces `[V]`

| Control | Key / Mechanism |
|---|---|
| MDM profile cannot be removed | ADE profile `is_mdm_removable: false` |
| Wipe → re-enrolls automatically | ABM/ASM serial assignment; Remote Management screen in Setup Assistant is mandatory |
| Cannot erase from Settings | `allowEraseContentAndSettings = false` |
| Cannot install other profiles | `allowUIConfigurationProfileInstallation = false` |
| Cannot delete apps | `allowAppRemoval = false` |
| Cannot hide apps (iOS 18 feature) | `allowAppsToBeHidden = false` |
| Cannot modify notification settings | `allowNotificationsModification = false` |
| Cannot manipulate the clock | `forceAutomaticDateAndTime = true` |
| Cannot disable Find My | `allowFindMyDevice = false` |
| SIM swap defense | `deniedICCIDsForiMessageFaceTime`, `forcePreserveESIMOnErase` |
| Activation Lock | ABM-managed; Managed Activation Lock with MDM bypass code |

Field-verified: on ADE devices, even a DFU restore brings the Remote Management screen
right back; only releasing the serial from ABM removes it. `[V-2nd]`

### E.2 Known bypass vectors `[A]`

| Vector | Mitigation |
|---|---|
| Device not in ABM (retail/Configurator; 30-day unenroll window) | Only ship ADE devices bought through ABM channel |
| Airplane mode / Wi-Fi off (blocks new MDM commands) | **Design Study Mode fail-secure: restrictions installed by default, profile *removed* to unlock.** Network denial then = stays locked |
| Time manipulation | `forceAutomaticDateAndTime = true` |
| Commercial "MDM bypass" tools | Mostly only work on non-ADE enrollments or jailbreakable SoCs; use ADE + Activation Lock |
| Jailbreak / checkm8 | A11 and earlier are bootrom-vulnerable forever; enforce a device floor of iPhone 12/A14+ |
| `.individual` FamilyControls → delete the app | Do not use `.individual` for enforcement |
| Emergency SOS dialer | Always available from lock screen regardless of every restriction — by design, and required |

**Strongest realistic stack:** ADE + supervised + non-removable + Activation Lock +
`allowEraseContentAndSettings:false` + `allowUIConfigurationProfileInstallation:false` +
`allowAppRemoval:false` + `allowNotificationsModification:false` +
`forceAutomaticDateAndTime:true` + iPhone 12 or later. Genuinely hard to defeat without
physical destruction or org cooperation. `[A]`

---

## F. Comparable products and where they hit the wall

| Product | Mechanism | Wall |
|---|---|---|
| Jamf Pro / Jamf School | Full MDM + supervision + ADE | Cannot control Focus modes, calls, or Messages content |
| Mosyle | Same MDM primitives + agent app | Same platform ceiling; schedules resolve to MDM pushes |
| Qustodio | Unsupervised MDM profile + VPN filter + Screen Time API | Call/SMS blocking is **Android-only**; profile removable |
| Bark / Bark Phone | iOS: MDM profile + Screen Time API + cloud monitoring | Cannot read iMessage on iOS at all; **the Bark Phone is an Android device** for exactly this reason |
| OurPact | Screen Time API `.child` (+ historical MDM, pulled by Apple in 2019, reinstated) | Cannot block calls/texts |
| Gabb / Troomi / Pinwheel | **Custom Android + MVNO carrier-level allowlisting** | They chose Android + carrier control *because* iOS makes contact-allowlist calling and message control impossible |
| Opal / one sec / Brick | Screen Time API `.individual` | Commitment devices only — users can delete the app |

**Pattern:** every product that actually delivers "calls and texts only from an
approved list" does it on **Android with carrier control**, not on iOS.

---

## Synthesis: two viable iOS architectures

### Architecture 1 — MDM + Supervision (recommended)
Satisfies: apps ✅, calls ❌ (needs Communication Limits hybrid or MVNO), texts ⚠️ (suppress-not-hold), anti-bypass ✅✅

- ABM/ASM + ADE + supervised + non-removable enrollment.
- Study Mode ON = install profile with `allowListedAppBundleIDs` + notification-kill payload. OFF = remove that profile; base profile keeps anti-bypass restrictions permanently.
- Latency: seconds online; unbounded offline → design fail-secure (remove-to-unlock).
- Business constraint: ABM requires a business entity and channel-purchased devices.

### Architecture 2 — Screen Time API, `.child` authorization
Satisfies: apps ⚠️ (buggy, system apps escape), calls ❌, texts ❌, anti-bypass ⚠️

- Consumer-friendly (no ABM), works on any family iPhone in an iCloud Family. Mutually exclusive with MDM.
- Blocked by: entitlement review lead time, the `.all(except:)` bug, 50-token cap, opaque tokens, unreliable remote activation, sticky-shield-after-uninstall defect.
- Pair with the parent manually configuring Apple's Communication Limits for calls/texts — the only path to requirement 2, outside your product's control.

### Myths you must not design around
- `allowFocus` / `allowDoNotDisturb` / global `allowNotifications` MDM keys — do not exist.
- MDM- or API-enforced Focus modes — do not exist on iOS.
- Any API to read, hide, delete, or delay SMS/iMessage — does not exist.
- CallKit whitelist-mode call blocking — does not exist (blocklist only, static).
- Combining MDM supervision with FamilyControls `.child` — throws `FamilyControlsError.restricted`.
- Deriving `ApplicationToken` from a bundle ID — impossible; picker-only.

---

## Sources

- Restrictions payload schema — apple/device-management (release): https://raw.githubusercontent.com/apple/device-management/release/mdm/profiles/com.apple.applicationaccess.yaml
- Notifications payload schema: https://raw.githubusercontent.com/apple/device-management/release/mdm/profiles/com.apple.notificationsettings.yaml
- Device management restrictions for iPhone and iPad — Apple Support: https://support.apple.com/guide/deployment/restrictions-for-iphone-and-ipad-dep0f7dd3d8/web
- Restrictions for supervised devices: https://support.apple.com/guide/deployment/restrictions-for-supervised-devices-dep6b5ae23e9/web
- Enrollment methods: https://support.apple.com/guide/deployment/enrollment-methods-for-apple-devices-dep08f54fcf6/web
- About device supervision: https://support.apple.com/guide/deployment/about-device-supervision-dep1d89f0bff/web
- Automated Device Enrollment: https://support.apple.com/guide/deployment/automated-device-enrollment-management-dep73069dd57/web
- Declarative device management: https://support.apple.com/guide/deployment/declarative-device-management-manage-apple-depc30268577/web
- WWDC26 device management updates: https://support.apple.com/guide/deployment/device-management-updates-depd638aa061/web
- FamilyControls: https://developer.apple.com/documentation/familycontrols
- requestAuthorization(for:): https://developer.apple.com/documentation/familycontrols/authorizationcenter/requestauthorization(for:)
- ActivityCategoryPolicy.all(except:): https://developer.apple.com/documentation/managedsettings/shieldsettings/activitycategorypolicy/all(except:)
- ManagedSettingsStore: https://developer.apple.com/documentation/managedsettings/managedsettingsstore
- Identifying and blocking calls (CallKit): https://developer.apple.com/documentation/callkit/identifying-and-blocking-calls
- SMS and MMS message filtering (IdentityLookup): https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering
- Live Caller ID Lookup: https://developer.apple.com/documentation/IdentityLookup/getting-up-to-date-calling-and-blocking-information-for-your-app
- Block calls and messages with Screen Time: https://support.apple.com/guide/iphone/block-calls-and-messages-with-screen-time-iph4df1c0dad/ios
- Forum: .child auth fails under MDM (Apple engineer): https://developer.apple.com/forums/thread/746716
- Forum: .all(except:) bug FB15500605: https://developer.apple.com/forums/thread/766766
- Forum: system apps unshieldable: https://developer.apple.com/forums/thread/729891
- Forum: shield persists after uninstall: https://developer.apple.com/forums/thread/802242
- Jamf: Restricting iOS apps: https://docs.jamf.com/best-practice-workflows/jamf-pro/controlling-distribution-ios-tvos-apps/Restricting_iOS_Apps.html
- Jamf Nation: no MDM restriction for Focus modes: https://community.jamf.com/t5/jamf-school/new-function-at-ios-17-quot-focus-quot/m-p/315853
