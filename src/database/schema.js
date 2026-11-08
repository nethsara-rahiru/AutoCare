export const migrations = [
  `CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, registration_no TEXT NOT NULL UNIQUE COLLATE NOCASE,
    make TEXT NOT NULL, model TEXT NOT NULL, year INTEGER NOT NULL CHECK(year >= 1900), fuel_type TEXT NOT NULL,
    current_mileage INTEGER NOT NULL DEFAULT 0 CHECK(current_mileage >= 0), image_uri TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, service_date TEXT NOT NULL, mileage INTEGER NOT NULL CHECK(mileage >= 0),
    cost REAL NOT NULL CHECK(cost >= 0), workshop TEXT, notes TEXT
  );
  CREATE TABLE fuel_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    filled_at TEXT NOT NULL, odometer INTEGER NOT NULL CHECK(odometer >= 0), liters REAL NOT NULL CHECK(liters > 0),
    total_cost REAL NOT NULL CHECK(total_cost >= 0), is_full_tank INTEGER NOT NULL DEFAULT 0 CHECK(is_full_tank IN (0,1)), station TEXT
  );
  CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    title TEXT NOT NULL, due_date TEXT, due_mileage INTEGER CHECK(due_mileage >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed')), notes TEXT,
    CHECK(due_date IS NOT NULL OR due_mileage IS NOT NULL)
  );
  CREATE TABLE app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE INDEX services_vehicle_date ON services(vehicle_id, service_date);
  CREATE INDEX fuel_vehicle_date ON fuel_logs(vehicle_id, filled_at);
  CREATE INDEX reminders_vehicle ON reminders(vehicle_id);
  CREATE INDEX services_date ON services(service_date);
  CREATE INDEX fuel_date ON fuel_logs(filled_at);`,
];
export async function migrate(db) {
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const { user_version: version } = await db.getFirstAsync('PRAGMA user_version');
  if (version > migrations.length) throw new Error('This database requires a newer AutoCare version.');
  for (let i = version; i < migrations.length; i++) {
    await db.withTransactionAsync(async () => { await db.execAsync(migrations[i]); await db.execAsync(`PRAGMA user_version = ${i + 1}`); });
  }
}
