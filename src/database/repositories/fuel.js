import { recordsRepository } from './records';
import { validateFuel } from '../../utils/validation';
export const fuelRepository = db => recordsRepository(db, {
  table: 'fuel_logs', fields: ['vehicle_id','filled_at','odometer','liters','total_cost','is_full_tank','station'], validate: validateFuel, dateField: 'filled_at', mileageField: 'odometer',
  async beforeSave(db, row, id) {
    const conflict = await db.getFirstAsync(`SELECT id FROM fuel_logs WHERE vehicle_id = ? AND id != ? AND ((filled_at < ? AND odometer > ?) OR (filled_at > ? AND odometer < ?)) LIMIT 1`, row.vehicle_id, Number(id) || -1, row.filled_at, row.odometer, row.filled_at, row.odometer);
    if (conflict) throw new Error('Odometer conflicts with an earlier or later fuel record. Check the date and mileage.');
  },
});
