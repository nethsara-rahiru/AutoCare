import { FUEL_TYPES, SERVICE_TYPES } from '../constants';
import { roundMoney } from './format';
export function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}
function required(value, label) { if (!String(value ?? '').trim()) throw new Error(`${label} is required.`); return String(value).trim(); }
function numeric(value, label, positive = false, integer = false) {
  required(value, label); const n = Number(value);
  if (!Number.isFinite(n) || (positive ? n <= 0 : n < 0) || (integer && !Number.isSafeInteger(n)) || n > 1e12) throw new Error(`${label} must be a ${positive ? 'positive' : 'nonnegative'}${integer ? ' whole' : ''} number.`);
  return n;
}
function date(value, label) { if (!validDate(value)) throw new Error(`${label} must be a valid date (YYYY-MM-DD).`); return value; }
export function validateVehicle(v) {
  const year = numeric(v.year, 'Year', true, true);
  if (year < 1900 || year > new Date().getFullYear() + 1) throw new Error('Enter a sensible manufacture year.');
  if (!FUEL_TYPES.includes(v.fuel_type)) throw new Error('Select a fuel type.');
  return { ...v, nickname: (v.nickname || '').trim(), registration_no: required(v.registration_no, 'Registration number').toUpperCase(), make: required(v.make, 'Make'), model: required(v.model, 'Model'), year, current_mileage: numeric(v.current_mileage, 'Mileage', false, true) };
}
export function validateService(v) {
  if (!SERVICE_TYPES.includes(v.service_type)) throw new Error('Select a service category.');
  return { ...v, vehicle_id: numeric(v.vehicle_id, 'Vehicle', true, true), service_date: date(v.service_date, 'Service date'), mileage: numeric(v.mileage, 'Mileage', false, true), cost: roundMoney(numeric(v.cost, 'Cost')) };
}
export function validateFuel(v) {
  return { ...v, vehicle_id: numeric(v.vehicle_id, 'Vehicle', true, true), filled_at: date(v.filled_at, 'Fill-up date'), odometer: numeric(v.odometer, 'Odometer', false, true), liters: numeric(v.liters, 'Litres', true), total_cost: roundMoney(numeric(v.total_cost, 'Total cost')), is_full_tank: v.is_full_tank ? 1 : 0 };
}
export function validateReminder(v) {
  const due_date = v.due_date ? date(v.due_date, 'Due date') : null;
  const due_mileage = v.due_mileage === '' || v.due_mileage == null ? null : numeric(v.due_mileage, 'Due mileage', false, true);
  if (!due_date && due_mileage == null) throw new Error('Provide a due date, due mileage, or both.');
  return { ...v, vehicle_id: numeric(v.vehicle_id, 'Vehicle', true, true), title: required(v.title, 'Title'), due_date, due_mileage, status: v.status === 'completed' ? 'completed' : 'active' };
}
