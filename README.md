# AutoCare — Offline Vehicle Maintenance Tracker

**Your Vehicle. Your Care.**

An individual university assignment: a React Native Android application for managing vehicle maintenance, fuel purchases, expenses, and reminders entirely on the device. AutoCare uses a premium dark **Midnight Drive** interface and a persistent SQLite database. There is no login, backend, public API, cloud database, or runtime internet requirement.

## Features

- Five bottom tabs: Home, Vehicles, Services, Fuel, and Reports.
- Dashboard with active vehicle selection, current mileage, registered vehicle count, calculated spending, reminders, recent service activity, and quick actions.
- Multiple vehicles: add, edit, delete with confirmation, detailed history, optional device photos, and search by registration, make, model, or nickname.
- Service CRUD with category/vehicle filters, workshop/notes search, date/cost sorting, validation, and safe mileage updates.
- Fuel CRUD with full/partial tanks, chronological odometer checks, vehicle filtering, total litres/spending, average price, and documented full-tank efficiency.
- Expense reports with inclusive date and vehicle filters, monthly/category breakdowns, vehicle comparisons, and offline SVG bars. LKR currency throughout.
- Date/mileage reminders with upcoming, due, overdue, completed states and full editing/deletion.
- Loading, error/retry, empty states, keyboard-aware forms, accessible controls, and destructive confirmations.
- Original fictional Sri Lankan seed data: **3 vehicles, 12 services, 15 fuel records, 6 reminders**. Seeded once, editable, and never recreated after deletion.

## Screenshots

Actual Chromium mobile-viewport captures of the app using browser SQLite; these are **not Android device screenshots**.

| Dashboard | Expense reports |
| --- | --- |
| ![AutoCare dashboard](docs/screenshots/dashboard.png) | ![AutoCare reports](docs/screenshots/reports.png) |

## Technology

Expo SDK 58, React Native 0.88, React 19.3, JavaScript/JSX, Expo Router, expo-sqlite, StyleSheet, Lucide, react-native-svg, expo-image-picker, expo-file-system, and React Context. Tests use Jest, jest-expo, React Native Testing Library, and real SQLite through Node's built-in SQLite engine. The lockfile defines exact compatible versions.

## Prerequisites and installation

- Node.js **24+** and npm. Node 24 is also required for the real-SQLite test adapter.
- An Android phone with SDK-58-compatible Expo Go, or Android SDK/emulator configured locally.
- Internet for initial dependency/tool installation and obtaining the development bundle. Saved application operations use local data only.

```bash
git clone https://github.com/nethsara-rahiru/AutoCare.git
cd AutoCare
npm install
npx expo start
```

Use `npm ci` instead of `npm install` for an exact lockfile installation. Scan the QR code in Expo Go. To use a configured emulator:

```bash
npm run android
```

If a phone cannot reach Metro, ensure both devices share a reachable network. Use a compatible Expo Go release; do not upgrade Expo packages individually. `npx expo install --check` checks compatibility.

### Self-contained Android build

With a configured Android SDK, JDK 17+, and a device/emulator:

```bash
npx expo run:android --variant release
```

This generates native project files locally and builds/installs a release app with embedded JavaScript. Native files and build caches are ignored. A cloud Android build/APK was **not** produced in this session. No EAS account is required for the local build command. Expo Go initially downloads JavaScript from Metro; for an airplane-mode cold launch demonstration, use the installed release app.

### Optional browser preview

```bash
npm run web
```

Browser preview uses expo-sqlite's locally bundled WASM engine and browser storage. Modern Chromium is recommended. Android is the delivery target; native photo picking and Android keyboard/safe-area behavior require phone verification. Browser and Android installations have separate databases.

## Offline operation and persistence

All business records live in `autocare.db`, opened with foreign keys and WAL enabled. Screens, searches, filters, totals, reminders, and charts use only local records. The source contains no HTTP clients, remote image URLs, online databases, or authentication. Selected photos are copied to the app document directory.

The first launch seeds demo data atomically with a persistent marker. Later launches apply only pending migrations, preserving data. Deleted samples stay deleted. Uninstalling or clearing app storage removes local records. There is no sync/export/backup feature.

## Database and calculations

| Table | Purpose | Important fields |
| --- | --- | --- |
| `vehicles` | Garage | unique registration, make/model/year, fuel type, mileage, local image URI |
| `services` | Maintenance | vehicle FK, category, date, mileage, LKR cost, workshop, notes |
| `fuel_logs` | Fuel purchases | vehicle FK, date, odometer, litres, cost, full-tank flag, station |
| `reminders` | Maintenance targets | vehicle FK, title, date and/or mileage, active/completed, notes |
| `app_meta` | Initialization metadata | seed-once marker |

Child rows cascade when a vehicle is deleted. Parameterized queries protect values; migrations use `PRAGMA user_version`. Dates are stored as `YYYY-MM-DD`. Money uses the requested REAL schema with two-decimal input and total rounding. See [architecture and complete field map](docs/ARCHITECTURE.md) and [authoritative schema](src/database/schema.js).

- Combined expenses = maintenance + fuel.
- Average fuel price = total fuel cost / total litres.
- Efficiency uses **adjacent full-tank records for the same vehicle**: odometer difference / litres in the later fill. Partial fills interrupt intervals; insufficient/inconsistent records show no efficiency. Combined efficiency uses summed qualifying distance / summed qualifying litres.
- Reminder precedence: **Completed > Overdue > Due > Upcoming**. Either exceeded date/mileage makes an active reminder overdue. Today/exact mileage makes it due unless another target is overdue.
- New service/fuel mileage only increases the vehicle odometer. Editing/deleting history never reduces it.

## Structure

```text
app/
  _layout.js              Startup and stack routes
  (tabs)/                 Home, Vehicles, Services, Fuel, Reports
  vehicle/[id].js         Vehicle details
  vehicle/form.js         Add/edit vehicle
  service/form.js         Add/edit service
  fuel/form.js            Add/edit fuel
  reminders.js            Reminder CRUD and completion
src/
  components/             Shared controls, record forms/cards, charts
  database/               Connection, migrations, seed, repositories
  hooks/                  Shared state and refresh
  theme/ constants/ utils/
__tests__/                Unit, component, real SQLite integration tests
scripts/                  Source/offline checks and optional browser smoke test
docs/                     Architecture, manual QA, delivery evidence
```

## Testing

```bash
npm test
npm test -- --coverage
npm run lint
npm run format:check
npm run check
npx expo-doctor
npx expo export --platform android
```

`lint` parses every application source file, verifies relative imports, and rejects runtime HTTP/WebSocket clients and remote URLs. It is a focused static source check, not ESLint. Jest covers input validation, expenses/efficiency, reminder precedence, vehicle/service/fuel/reminder CRUD, duplicate registrations, filtering, foreign keys, migrations/seed-once, transactions, mileage safety, persistence, dynamic totals, and accessible component behavior.

Optional browser integration check, with Python Playwright and Chromium installed:

```bash
# Terminal 1
npm run web -- --port 8081
# Terminal 2
python scripts/browser-smoke.py
```

Set `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`. This check uses an isolated profile, disables browser networking for local CRUD/navigation/reports, reconnects to reload development assets, verifies persisted data, and deletes its test vehicle. It is supplementary to Android testing.

On proxied cloud hosts, Node-based online tooling may need `NODE_USE_ENV_PROXY=1 npx expo-doctor` so it honors the configured proxy. No such environment setting is needed by the app.

GitHub Actions runs tests, source/format checks, Expo compatibility, and Android JS export on pushes to `main`. An export is a JavaScript bundle validation, not an APK build or device test.

## Known limitations and submission checks

- Android phone/emulator execution, native photo selection, release APK building, and airplane-mode cold restart remain manual checks. See [Android acceptance checklist](docs/MANUAL_QA.md).
- No device notifications; reminder status is shown in-app and recalculated when the app foregrounds.
- No cloud sync, backup, or export. Storage clearing/uninstall deletes records.
- Calendar date text entry uses validated `YYYY-MM-DD`. Same-day fuel records sort by odometer/ID because no time-of-day is stored.
- Replaced/deleted photos may leave unused files in the app documents directory.
- Record snapshots and UI filtering suit the assignment dataset; large-scale histories would need pagination.

Development was committed directly to **main**, following the final instruction. No development branch or pull request is used. See [delivery evidence](docs/DELIVERY.md) for exact verification and remaining acceptance work. Deadline: **15 November 2026**.
