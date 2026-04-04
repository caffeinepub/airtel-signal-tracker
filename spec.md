# Airtel Signal Tracker — Emergency & Safety Features (Version 14)

## Current State

The app has 10+ tabs: Home, Compass, GPS Dir, Map, Guide, Wi-Fi, USSD, Help, AR, History.
Existing emergency-adjacent components:
- `EmergencyContactBroadcaster.tsx` — manual one-tap SMS with GPS to saved contacts (up to 3)
- `TowerOutageBanner.tsx`, `TowerOutageHistoryLog.tsx` — outage tracking exists
- `OfflineSignalDiary.tsx` — manual signal logging
- `UssdPage.tsx` — has USSD codes including support numbers
- `BottomNav.tsx` — scrollable horizontal tabs

No dedicated Emergency/Safety tab or page exists. No auto-detection of 30-min signal loss. No Airtel customer care call shortcuts. No network blackout auto-logger. No flood/weather alert section. No power outage correlation tracker.

## Requested Changes (Diff)

### Add
1. **Emergency SOS Beacon** — Auto-detects if estimated signal has been critically low (≤ -105 dBm or no GPS) for 30+ consecutive minutes. Shows a countdown timer and fires an SMS to saved emergency contacts with GPS coords. Uses `EmergencyContactBroadcaster` contacts already in localStorage. Adds auto-trigger logic on top of manual SOS.
2. **Airtel Customer Care Shortcuts** — Dedicated section with one-tap buttons to: call 100 (Airtel free), call 111 (Airtel Uganda), open WhatsApp with Airtel Uganda support number (+256800100100). Uses `window.location.href` with `tel:` and `https://wa.me/` links.
3. **Network Blackout Reporter** — Auto-logs every time signal drops to zero/offline. Stores timestamps and duration to localStorage. Shows a list of recent blackout events with date, time, and duration. Uses `useOnlineStatus` hook already in app.
4. **Flood/Weather Alert Integration** — Offline-cached section with weather warnings for Karamoja region (stored in localStorage). Shows static advisories (flood season, dust storm, dry season) with dates/severity. Includes a link to Uganda Red Cross / Uganda Meteorological Authority (opens in browser when online). Shows offline badge when not connected.
5. **Power Outage Signal Tracker** — Lets user manually log when local power goes out. Compares power outage timestamps against blackout log entries to show correlation. Displays a summary: "3 of 5 signal losses occurred during power outages".

All 5 features go into a new **Emergency & Safety** page/tab accessible from a new `safety` tab in `BottomNav`.

### Modify
- `BottomNav.tsx` — Add `safety` tab with a shield icon (or siren/alert icon from lucide)
- `App.tsx` — Add `safety` to `TabId` union type, add route rendering for `SafetyPage`, pass necessary props (rssi, userPosition, isOnline)
- `EmergencyContactBroadcaster.tsx` — Enhance with auto-trigger: add a prop `autoTriggerActive: boolean` that when true shows a red banner "SOS Auto-Sending in Xs" with a cancel button

### Remove
- Nothing removed

## Implementation Plan

1. Create `src/frontend/src/components/EmergencySOSBeacon.tsx` — timer logic watching rssi prop, triggers auto-SMS when 30+ min below threshold. Uses contacts from localStorage. Shows countdown banner.
2. Create `src/frontend/src/components/AirtelCareShortcuts.tsx` — call 100, call 111, WhatsApp buttons.
3. Create `src/frontend/src/components/NetworkBlackoutReporter.tsx` — listens to `isOnline`, auto-logs outage start/end to localStorage, displays recent blackout events.
4. Create `src/frontend/src/components/FloodWeatherAlerts.tsx` — static offline-cached Karamoja weather warnings with seasonal advisories and external links.
5. Create `src/frontend/src/components/PowerOutageTracker.tsx` — manual power outage log, cross-references blackout log for correlation analysis.
6. Create `src/frontend/src/pages/SafetyPage.tsx` — composes all 5 components, accepts props: rssi, userPosition, isOnline.
7. Update `BottomNav.tsx` — add `{ id: 'safety', label: 'Safety', icon: ShieldAlert }` to tabs array.
8. Update `App.tsx` — add `'safety'` to `TabId`, add `{activeTab === 'safety' && <SafetyPage ... />}` in render.
