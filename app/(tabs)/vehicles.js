import React, { useState } from 'react';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useApp } from '../../src/hooks/useApp';
import { Screen, SearchField, Button, Empty, ErrorText, confirmDelete } from '../../src/components/UI';
import { VehicleCard } from '../../src/components/VehicleCard';
export default function Vehicles() {
  const { vehicles, mutate } = useApp(); const [search, setSearch] = useState(''), [error, setError] = useState('');
  const results = vehicles.filter(v => [v.registration_no, v.make, v.model, v.nickname].join(' ').toLowerCase().includes(search.toLowerCase().trim()));
  async function remove(id) { try { await mutate('vehicles', 'remove', id); } catch (e) { setError(e.message); } }
  return <Screen title="My garage" subtitle={`${vehicles.length} vehicles · Every journey, cared for.`} action={<Button title="Add" icon={Plus} onPress={() => router.push('/vehicle/form')} />}><SearchField value={search} onChangeText={setSearch} placeholder="Registration, make, model or nickname" /><ErrorText>{error}</ErrorText>{!results.length && <Empty title={vehicles.length ? 'No matching vehicles' : 'Your garage starts here'} action={<Button title="Add vehicle" onPress={() => router.push('/vehicle/form')} />} />}{results.map(v => <VehicleCard key={v.id} vehicle={v}><Button secondary title="Edit vehicle" onPress={() => router.push({ pathname: '/vehicle/form', params: { id: v.id } })} /><Button danger title="Delete vehicle" onPress={() => confirmDelete('Delete this vehicle and all its services, fuel logs and reminders? This cannot be undone.', () => remove(v.id))} /></VehicleCard>)}</Screen>;
}
