import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../hooks/useApp';
import { Screen, Field, VehicleChoice, Choices, Button, Body, ErrorText, Empty, styles } from './UI';
import { SERVICE_TYPES } from '../constants';
import { today } from '../utils/format';
import { colors as c } from '../theme';
export function RecordForm({ type }) {
  const { id, vehicleId } = useLocalSearchParams(); const app = useApp(); const service = type === 'services';
  const original = app[type].find(r => r.id === Number(id));
  const [form, setForm] = useState(original || { vehicle_id: Number(vehicleId) || app.vehicles[0]?.id || '', service_type: 'Engine Oil', service_date: today(), filled_at: today(), mileage: '', odometer: '', cost: '', liters: '', total_cost: '', workshop: '', station: '', notes: '', is_full_tank: false });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const set = key => value => setForm(old => ({ ...old, [key]: value }));
  async function save() { setError(''); setBusy(true); try { await app.mutate(type, 'save', form, id); router.back(); } catch(e) { setError(e.message); } finally { setBusy(false); } }
  if (!app.vehicles.length) return <Screen title="Add a vehicle first"><Empty action={<Button title="Add vehicle" onPress={() => router.push('/vehicle/form')} />} /></Screen>;
  if (id && !original) return <Screen title="Record not found"><Empty message="This record may have been deleted." /></Screen>;
  const fields = service ? [['service_date','Service date (YYYY-MM-DD)'],['mileage','Mileage at service (km)'],['cost','Service cost (LKR)'],['workshop','Workshop (optional)'],['notes','Notes (optional)']] : [['filled_at','Fill-up date (YYYY-MM-DD)'],['odometer','Odometer (km)'],['liters','Litres purchased'],['total_cost','Total cost (LKR)'],['station','Fuel station (optional)']];
  return <Screen title={`${id ? 'Edit' : 'Add'} ${service ? 'service' : 'fuel record'}`} subtitle="Saved on your device. Always available."><ErrorText>{error}</ErrorText><VehicleChoice vehicles={app.vehicles} value={form.vehicle_id} onChange={set('vehicle_id')} />{service && <Choices label="Service category" options={SERVICE_TYPES} value={form.service_type} onChange={set('service_type')} />}{fields.map(([key,label]) => <Field key={key} label={label} value={form[key]} onChangeText={set(key)} placeholder={key.includes('date') || key === 'filled_at' ? 'YYYY-MM-DD' : undefined} multiline={key === 'notes'} keyboardType={['mileage','odometer'].includes(key) ? 'numeric' : ['cost','total_cost','liters'].includes(key) ? 'decimal-pad' : 'default'} />)}{!service && <View style={styles.spread}><Body>Filled to a full tank</Body><Switch accessibilityLabel="Full tank" value={!!form.is_full_tank} onValueChange={set('is_full_tank')} trackColor={{ true: c.accent }} /></View>}<Body muted>Higher readings update the vehicle mileage automatically. Lower readings never reduce it.</Body><Button title={busy ? 'Saving…' : 'Save record'} disabled={busy} onPress={save} /></Screen>;
}
