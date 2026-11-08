// Table and column names come only from trusted static repository configuration.
export function recordsRepository(db, config) {
  const { table, fields, validate, dateField, mileageField } = config;
  return {
    list: (vehicleId) =>
      db.getAllAsync(
        `SELECT r.*, v.registration_no, v.make, v.model, v.current_mileage FROM ${table} r JOIN vehicles v ON v.id=r.vehicle_id ${vehicleId ? "WHERE r.vehicle_id = ?" : ""} ORDER BY ${dateField ? `r.${dateField} DESC,` : ""} r.id DESC`,
        ...(vehicleId ? [Number(vehicleId)] : []),
      ),
    get: (id) =>
      db.getFirstAsync(`SELECT * FROM ${table} WHERE id = ?`, Number(id)),
    async save(input, id) {
      const row = validate(input);
      let savedId = Number(id);
      await db.withTransactionAsync(async () => {
        if (config.beforeSave) await config.beforeSave(db, row, id);
        const values = fields.map((field) => row[field] ?? null);
        if (id)
          await db.runAsync(
            `UPDATE ${table} SET ${fields.map((field) => `${field}=?`).join(",")} WHERE id=?`,
            ...values,
            Number(id),
          );
        else {
          const result = await db.runAsync(
            `INSERT INTO ${table}(${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`,
            ...values,
          );
          savedId = result.lastInsertRowId;
        }
        if (mileageField)
          await db.runAsync(
            "UPDATE vehicles SET current_mileage = MAX(current_mileage, ?) WHERE id = ?",
            row[mileageField],
            row.vehicle_id,
          );
      });
      return savedId;
    },
    remove: (id) =>
      db.runAsync(`DELETE FROM ${table} WHERE id = ?`, Number(id)),
  };
}
