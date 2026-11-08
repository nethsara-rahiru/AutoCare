# Delivery evidence — 8 November 2026

## Implemented

Complete Expo Router application with five tabs and supporting forms/details/reminders; Midnight Drive theme; SQLite migration and seed-once startup; vehicle/service/fuel/reminder CRUD; search/filter/sort; persistent local photos; dynamic dashboard; date/vehicle-filtered expense reports; offline SVG charts; LKR formatting; input and odometer validation; destructive confirmations; loading/error/empty states; original app icon; documentation and GitHub Actions.

The final instruction replaced the proposed branch/PR workflow: work goes directly to `main`. The existing initial commit is preserved. Delivery targets **38 total reachable commits on main**, comprising the original commit and 37 implementation commits. No development branch, pull request, or merge operation is required. Confirm the delivered revision with `git rev-parse HEAD`, `git rev-list --count main`, and `git ls-remote origin refs/heads/main`; the handover message supplies the final SHA after push verification.

## Executed verification

| Command | Observed result |
| --- | --- |
| `npm test -- --coverage` | 3 suites, **50 passed**, 0 failed |
| `npm run lint` | 33 runtime source files parse; relative imports resolve; no HTTP/WebSocket clients or remote URLs |
| `npm run format:check` | All matched files use Prettier formatting |
| `npm run check` | Expo dependencies up to date |
| `NODE_USE_ENV_PROXY=1 npx expo-doctor` | **20/20** checks passed |
| `npx expo export --platform android` | Android Hermes JS bundle and assets exported successfully |
| `python scripts/browser-smoke.py` | Passed in Chromium; no page errors |
| `git diff --check` | No whitespace errors |

Coverage for the configured database/repository/utility scope: **96.79% statements, 89.6% branches, 97.87% functions, 97.16% lines**. This is not whole-app UI coverage. SQLite integration tests run actual SQLite through Node 24's built-in engine; they do not simulate the native Expo bridge.

Covered scenarios include valid/missing/duplicate vehicle input; vehicle create/read/update/delete/search; service CRUD/filtering/totals; fuel CRUD/validation/chronology/cost/weighted price/full-tank efficiency; reminder date/mileage/status/completion/delete; relational constraints/cascades; migration initialization; seed-once after deletion; disk close/reopen persistence; dashboard/report recalculation; safe mileage edits; coherent demo readings across all dates; accessible controls; and search/type/vehicle filtering.

Chromium loaded the application and WASM SQLite, then networking was disabled for vehicle creation, related service/fuel creation, navigation, searches, and reports. Networking was re-enabled only to reload development assets; the test confirmed persisted records after reload and deleted its test vehicle. This verifies loaded browser functionality offline, **not Android airplane-mode cold launch**. Screenshots are actual browser captures, with test records included in the reports capture.

Initial component testing exposed a Lucide ESM transformation issue, fixed in Jest configuration. Early browser-script failures were ambiguous selectors for retained navigation screens; accessible role selection resolved them. Initial Expo Doctor checks could not access online metadata until Node's environment-proxy support was enabled. Final checks above passed.

## Remaining manual acceptance

The executor has no `adb`, configured Android SDK/emulator, or attached Android phone. Consequently:

- No APK/native build or native installation was performed.
- No Android device/emulator test is claimed.
- Native photo selection/permission handling, Android keyboard and safe areas, TalkBack, and actual airplane-mode restart need device verification.
- No device notification service is implemented; in-app reminders are complete.
- GitHub Actions is configured; local checks are evidenced here, while hosted run status must be read on GitHub.

Follow [MANUAL_QA.md](MANUAL_QA.md) before university submission. Source implementation and automated checks are complete; final Android acceptance is pending. Known product limitations are recorded in the README and architecture document.

## Run

```bash
npm ci
npx expo start
```

Use compatible Expo Go on Android, or `npm run android` with a configured emulator. For a self-contained offline install with local SDK/JDK tooling, use `npx expo run:android --variant release` and then perform the airplane-mode restart checklist.
