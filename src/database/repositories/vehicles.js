import { validateVehicle } from "../../utils/validation";
export function vehiclesRepository(db) {
  return {
    list: (search = "") =>
      db.getAllAsync(
        "SELECT * FROM vehicles WHERE registration_no LIKE ? OR make LIKE ? OR model LIKE ? OR nickname LIKE ? ORDER BY id DESC",
        ...Array(4).fill(`%${search.trim()}%`),
      ),
    get: (id) =>
      db.getFirstAsync("SELECT * FROM vehicles WHERE id = ?", Number(id)),
    async save(input, id) {
      const v = validateVehicle(input);
      const duplicate = await db.getFirstAsync(
        "SELECT id FROM vehicles WHERE registration_no = ? AND id != ?",
        v.registration_no,
        Number(id) || -1,
      );
      if (duplicate)
        throw new Error("This registration number already exists.");
      if (id) {
        const history = await db.getFirstAsync(
          "SELECT MAX(reading) AS maximum FROM (SELECT mileage AS reading FROM services WHERE vehicle_id = ? UNION ALL SELECT odometer AS reading FROM fuel_logs WHERE vehicle_id = ?)",
          Number(id),
          Number(id),
        );
        if (v.current_mileage < (history.maximum || 0))
          throw new Error(
            "Mileage cannot be lower than an existing service or fuel record.",
          );
      }
      const values = [
        v.nickname,
        v.registration_no,
        v.make,
        v.model,
        v.year,
        v.fuel_type,
        v.current_mileage,
        v.image_uri || null,
      ];
      if (id) {
        await db.runAsync(
          "UPDATE vehicles SET nickname=?, registration_no=?, make=?, model=?, year=?, fuel_type=?, current_mileage=?, image_uri=? WHERE id=?",
          ...values,
          Number(id),
        );
        return Number(id);
      }
      const result = await db.runAsync(
        "INSERT INTO vehicles(nickname, registration_no, make, model, year, fuel_type, current_mileage, image_uri, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ...values,
        new Date().toISOString(),
      );
      return result.lastInsertRowId;
    },
    remove: (id) =>
      db.runAsync("DELETE FROM vehicles WHERE id = ?", Number(id)),
  };
}
