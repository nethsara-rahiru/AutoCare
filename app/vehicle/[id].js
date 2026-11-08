import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../src/hooks/useApp';
import { Screen, Stat, Button, Heading, Card, Body, Empty, styles } from '../../src/components/UI';
import { VehicleCard } from '../../src/components/VehicleCard';
import { ReminderCard } from '../../src/components/ReminderCard';
import { expenses } from '../../src/utils/calculations';
import { money, dateLabel, km } from '../../src/utils/format';
export default function VehicleDetails() {
  const { id } = useLocalSearchParams(); const app = useApp(); const vehicle = app.vehicles.find(v => v.id === Number(id));
  if (!vehicle) return <Screen title="Vehicle not found"><Empty message="This vehicle may have been removed." /></Screen>;
  const services = app.services.filter(r => r.vehicle_id === vehicle.id), fuel = app.fuel.filter(r => r.vehicle_id === vehicle.id), reminders = app.reminders.filter(r => r.vehicle_id === vehicle.id && r.status !== 'completed');
  const totals = expenses(services, fuel);
  return <Screen title="Vehicle details" subtitle="Your vehicle. Your care."><VehicleCard vehicle={vehicle} detailed /><Button title="Edit vehicle" secondary onPress={() => router.push({pathname:'/vehicle/form', params:{id}})} /><View style={styles.row}><Stat label="Maintenance" value={money(totals.serviceCost)} /><Stat label="Fuel" value={money(totals.fuelCost)} /><Stat label="Combined expenses" value={money(totals.total)} accent /></View><View style={styles.row}><Button title="Add service" onPress={() => router.push({pathname:'/service/form',params:{vehicleId:id}})} /><Button title="Add fuel" onPress={() => router.push({pathname:'/fuel/form',params:{vehicleId:id}})} /></View><Heading>Recent services</Heading>{!services.length && <Body muted>No services recorded yet.</Body>}{services.slice(0,3).map(r => <Card key={r.id}><Heading>{r.service_type}</Heading><Body>{money(r.cost)} · {km(r.mileage)}</Body><Body muted>{dateLabel(r.service_date)} · {r.workshop || 'No workshop'}</Body><Button secondary title="View / edit service" onPress={() => router.push({pathname:'/service/form',params:{id:r.id}})} /></Card>)}<Heading>Recent fuel</Heading>{!fuel.length && <Body muted>No fuel recorded yet.</Body>}{fuel.slice(0,3).map(r => <Card key={r.id}><Heading>{r.liters} L · {money(r.total_cost)}</Heading><Body muted>{dateLabel(r.filled_at)} · {km(r.odometer)}</Body><Button secondary title="View / edit fuel" onPress={() => router.push({pathname:'/fuel/form',params:{id:r.id}})} /></Card>)}<Heading>Maintenance reminders</Heading>{!reminders.length && <Body muted>No active reminders.</Body>}{reminders.map(r => <ReminderCard key={r.id} reminder={r} />)}<Button title="Manage reminders" secondary onPress={() => router.push({pathname:'/reminders',params:{vehicleId:id}})} /></Screen>;
}
