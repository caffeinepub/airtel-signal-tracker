# Airtel Signal Tracker

## Current State
The app has 9 tabs: Home, Compass, Map, Guide, Wi-Fi, USSD, Help, AR, History. The Compass tab shows direction to the nearest Airtel tower using device heading + bearing. The app uses GPS (with Moroto fallback at lat: 2.5341, lon: 34.6622). There is no dedicated GPS navigation feature pointing to Moroto Town itself.

## Requested Changes (Diff)

### Add
- New `GpsDirectionPage` component: a dedicated GPS Direction screen for Moroto Town center
  - Shows real-time bearing from user's current location to Moroto Town center (lat: 2.5341, lon: 34.6622)
  - Large animated compass arrow pointing toward Moroto Town
  - Live distance in km/meters
  - Cardinal direction label (N, NE, E, etc.)
  - Degree bearing display
  - Walking/ETA estimate based on distance
  - "You are in Moroto" message when within 0.5km
  - GPS accuracy indicator
  - Works offline (uses device GPS only)
- New "GPS" tab in BottomNav pointing to the new page
- New TabId "gps" in App.tsx

### Modify
- `App.tsx`: Add "gps" TabId, render `GpsDirectionPage` when active, pass userPosition and gpsStatus
- `BottomNav.tsx`: Add GPS tab with Navigation icon

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/GpsDirectionPage.tsx` with the full GPS direction UI for Moroto Town
2. Update `App.tsx` to add TabId "gps" and render the new page
3. Update `BottomNav.tsx` to add the GPS tab
