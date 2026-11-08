import { today, roundMoney } from "./format";
export function fuelStats(logs) {
  const ordered = [...logs].sort(
    (a, b) =>
      a.filled_at.localeCompare(b.filled_at) ||
      a.odometer - b.odometer ||
      a.id - b.id,
  );
  let distance = 0,
    fuelUsed = 0;
  const groups = new Map();
  for (const log of ordered) {
    const previous = groups.get(log.vehicle_id);
    if (
      previous &&
      previous.is_full_tank &&
      log.is_full_tank &&
      log.odometer > previous.odometer &&
      log.liters > 0
    ) {
      distance += log.odometer - previous.odometer;
      fuelUsed += log.liters;
    }
    groups.set(log.vehicle_id, log);
  }
  const liters = logs.reduce((n, r) => n + r.liters, 0);
  const cost = roundMoney(logs.reduce((n, r) => n + r.total_cost, 0));
  return {
    liters,
    cost,
    averagePrice: liters ? cost / liters : null,
    efficiency: fuelUsed ? distance / fuelUsed : null,
  };
}
export function reminderStatus(reminder, mileage, date = today()) {
  if (reminder.status === "completed") return "Completed";
  if (
    (reminder.due_date && reminder.due_date < date) ||
    (reminder.due_mileage != null && mileage > reminder.due_mileage)
  )
    return "Overdue";
  if (
    reminder.due_date === date ||
    (reminder.due_mileage != null && mileage >= reminder.due_mileage)
  )
    return "Due";
  return "Upcoming";
}
export function expenses(services, fuel) {
  const serviceCost = roundMoney(services.reduce((n, r) => n + r.cost, 0));
  const fuelCost = roundMoney(fuel.reduce((n, r) => n + r.total_cost, 0));
  return { serviceCost, fuelCost, total: roundMoney(serviceCost + fuelCost) };
}
export function monthlyExpenses(services, fuel) {
  const months = new Map();
  for (const [records, field, dateField] of [
    [services, "cost", "service_date"],
    [fuel, "total_cost", "filled_at"],
  ]) {
    for (const row of records) {
      const key = row[dateField].slice(0, 7);
      months.set(key, roundMoney((months.get(key) || 0) + row[field]));
    }
  }
  return [...months]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}
