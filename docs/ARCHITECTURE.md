# Architecture and data model

AutoCare is an individual React Native Android assignment. Expo Router owns all navigation. No backend, login, remote API, analytics, or remote imagery is used by application code.

## Layers

- `app/`: five tab screens and supporting vehicle, service, fuel, and reminder stack screens.
- `src/components/`: shared cards, accessible controls, forms, and SVG expense bars.
- `src/hooks/useApp.js`: SQLite startup, shared record snapshots, serialized mutations, and refresh after every write or foreground transition.
- `src/database/`: connection singleton, versioned migrations, one-time original demo dataset, parameterized repositories.
- `src/utils/`: validated input, local calendar dates, LKR formatting, and pure calculations.

Screens read shared data loaded from SQLite. All writes go through repositories; the provider serializes mutations to prevent overlapping transaction scopes. Related service/fuel writes and mileage increases are atomic. Every successful mutation refreshes all record collections. No dashboard/report totals are hardcoded.

For this assignment's dataset size, loading record snapshots keeps refresh logic simple. Repository lists support vehicle filtering and vehicle search in SQL; service category, search, sorting, and report date filters are applied to locally retrieved rows. Very large histories would benefit from SQL pagination and aggregate queries.

## SQLite schema v1

The authoritative DDL is [`src/database/schema.js`](../src/database/schema.js).

| Table | Columns |
| --- | --- |
| vehicles | id PK; nickname; registration_no NOT NULL UNIQUE COLLATE NOCASE; make; model; year; fuel_type; current_mileage DEFAULT 0; image_uri; created_at |
| services | id PK; vehicle_id FK; service_type; service_date; mileage; cost; workshop; notes |
| fuel_logs | id PK; vehicle_id FK; filled_at; odometer; liters; total_cost; is_full_tank DEFAULT 0; station |
| reminders | id PK; vehicle_id FK; title; due_date nullable; due_mileage nullable; status DEFAULT active; notes |
| app_meta | key PK; value; persistent seed-once marker |

All child foreign keys cascade on vehicle deletion. Foreign keys are enabled on every opened connection. CHECK constraints reject negative amounts/mileage, invalid full-tank flags, invalid reminder status, and reminders with no target. Indexes cover child vehicle IDs, service/fuel dates, and combined vehicle/date queries.

`PRAGMA user_version` records migration version. Each pending migration runs in a transaction. A newer unsupported schema produces an actionable startup error rather than deleting records. Initialization never resets data. Demo rows and the seed marker share one transaction. Deleting samples never causes them to reappear.

Dates use local `YYYY-MM-DD`; creation timestamps use ISO UTC. Currency retains the requested REAL columns, but input and calculated totals round to two decimal places. This is controlled rounding for assignment-scale amounts, not an accounting ledger. SQLite data remains private to the installation. Uninstalling or clearing app storage removes it. No backup/sync feature is provided.

## Rules

- Registration is trimmed and uppercased; duplicates are rejected case insensitively.
- Mileage is a nonnegative whole number. A vehicle editor cannot undercut stored fuel or service readings.
- Service/fuel inserts and edits update mileage using `MAX(current_mileage, entered_reading)`. Editing/deleting history never rolls back current mileage. A historical record may be below the current reading.
- Fuel records cannot contradict odometers on earlier/later calendar dates for the same vehicle. Same-day records are ordered by odometer, then ID, since no time-of-day field exists. Equal readings do not produce efficiency intervals.
- Efficiency groups records by vehicle and sorts chronologically. Only adjacent full-tank records with increasing odometers form intervals; partial fills break intervals. Use the later fill's litres. Overall efficiency is summed qualifying distance divided by summed qualifying litres, never the unweighted average of interval efficiencies. Search does not alter efficiency adjacency; fuel summaries follow the vehicle filter.
- Reminder precedence: Completed > Overdue > Due > Upcoming. Either passed date or exceeded mileage makes an active reminder overdue. Either today's date or exactly reached mileage makes it due, unless another target is already overdue. Reminder status is evaluated against the local calendar and stored mileage.
- Reports include both boundary dates. Month grouping uses the stored date's first seven characters. All reports derive from current SQLite records.
- Picker images are copied from temporary cache to the app document directory. Removing/replacing a photo may leave an unused document file; it does not affect records. No remote image URLs are built into the app.

## Extension boundaries

Future migrations must append to the migration array, never modify already released migrations. Keep parameterized values and static trusted table names. Add device notifications only after core Android acceptance; reminders currently work entirely inside the application.
