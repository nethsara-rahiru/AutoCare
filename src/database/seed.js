import { today } from '../utils/format';
export async function seed(db) {
  if (await db.getFirstAsync("SELECT value FROM app_meta WHERE key = 'demo_seed_v1'")) return;
  await db.withTransactionAsync(async () => {
    const vehicles = [
      ['Daily companion', 'CAA-1234', 'Toyota', 'Prius', 2015, 'Hybrid', 124800],
      ['Weekend drive', 'CBB-5678', 'Honda', 'Civic', 2018, 'Petrol', 78400],
      ['City runner', 'CAD-9012', 'Suzuki', 'Wagon R', 2017, 'Petrol', 96300],
    ];
    for (let v = 0; v < vehicles.length; v++) {
      const result = await db.runAsync('INSERT INTO vehicles(nickname, registration_no, make, model, year, fuel_type, current_mileage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ...vehicles[v], new Date().toISOString());
      const id = result.lastInsertRowId, base = vehicles[v][6] - 2400;
      const types = ['Engine Oil', 'Air Filter', 'Brake Service', 'General Service'];
      const costs = [16500, 4200, 18500, 26500];
      for (let s = 0; s < 4; s++) await db.runAsync('INSERT INTO services(vehicle_id, service_type, service_date, mileage, cost, workshop, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', id, types[s], `2026-${String(6 + s).padStart(2, '0')}-12`, base - 1500 + s * 500, costs[s] + v * 1500, ['Colombo Auto Works', 'Kandy Motor Care', 'Galle Service Centre'][v], 'Fictional demonstration record; inspected and serviced.');
      const liters = [25, 27, 26, 28, 25];
      for (let f = 0; f < 5; f++) await db.runAsync('INSERT INTO fuel_logs(vehicle_id, filled_at, odometer, liters, total_cost, is_full_tank, station) VALUES (?, ?, ?, ?, ?, ?, ?)', id, `2026-${String(7 + Math.floor(f / 2)).padStart(2, '0')}-${f % 2 ? '25' : '08'}`, base + f * (v === 0 ? 520 : 400), liters[f], liters[f] * 310, 1, ['Lanka Fuel Colombo', 'Kandy Fuel Point', 'Galle Fuel Stop'][v]);
      await db.runAsync('INSERT INTO reminders(vehicle_id, title, due_date, due_mileage, notes) VALUES (?, ?, ?, ?, ?)', id, 'Engine oil inspection', today(), vehicles[v][6] + 1000, 'Check oil level and condition.');
      await db.runAsync('INSERT INTO reminders(vehicle_id, title, due_date, due_mileage, notes) VALUES (?, ?, ?, ?, ?)', id, 'Tire rotation', null, vehicles[v][6] + 3000, 'Inspect tire pressure and rotate tires.');
    }
    await db.runAsync("INSERT INTO app_meta(key, value) VALUES ('demo_seed_v1', 'done')");
  });
}
