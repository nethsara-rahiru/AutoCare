import React, { useState } from 'react';
import { Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { useApp } from '../../src/hooks/useApp';
import { Screen, Field, Choices, Button, ErrorText, Empty } from '../../src/components/UI';
import { FUEL_TYPES } from '../../src/constants';
export default function VehicleForm() {
  const { id } = useLocalSearchParams(); const { vehicles, fuel, mutate } = useApp();
  const original = vehicles.find(v => v.id === Number(id));
  const [form, setForm] = useState(original || { nickname: '', registration_no: '', make: '', model: '', year: String(new Date().getFullYear()), fuel_type: 'Petrol', current_mileage: '', image_uri: null });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const set = key => value => setForm(old => ({ ...old, [key]: value }));
  async function photo() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Photo permission was declined. You can continue without a photo.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
      if (!result.canceled) {
        // Copy picker cache to app documents so images survive cache cleanup and restarts.
        const source = new File(result.assets[0].uri);
        const target = new File(Paths.document, `vehicle-${Date.now()}.${source.extension.replace('.', '') || 'jpg'}`);
        source.copy(target); set('image_uri')(target.uri);
      }
    } catch (e) { setError(e.message); }
  }
  async function save() {
    setError(''); setBusy(true);
    try {
      const maximum = Math.max(0, ...fuel.filter(r => r.vehicle_id === Number(id)).map(r => r.odometer));
      if (Number(form.current_mileage) < maximum) throw new Error('Mileage cannot be lower than a recorded fuel odometer.');
      await mutate('vehicles', 'save', form, id); router.back();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (id && !original) return <Screen title="Vehicle not found"><Empty message="This vehicle may have been deleted." /></Screen>;
  return <Screen title={id ? 'Edit vehicle' : 'Add to your garage'} subtitle="A little detail. Better care."><ErrorText>{error}</ErrorText>{[['nickname','Nickname (optional)'],['registration_no','Registration number'],['make','Make'],['model','Model'],['year','Manufacture year'],['current_mileage','Current mileage (km)']].map(([key,label]) => <Field key={key} label={label} value={form[key]} onChangeText={set(key)} autoCapitalize={key === 'registration_no' ? 'characters' : 'words'} keyboardType={['year','current_mileage'].includes(key) ? 'numeric' : 'default'} />)}<Choices label="Fuel type" options={FUEL_TYPES} value={form.fuel_type} onChange={set('fuel_type')} />{form.image_uri && <Image source={{ uri: form.image_uri }} style={{ height: 180, borderRadius: 16 }} />}<Button title="Choose vehicle photo" secondary onPress={photo} />{form.image_uri && <Button title="Remove photo" secondary onPress={() => set('image_uri')(null)} />}<Button title={busy ? 'Saving…' : 'Save vehicle'} disabled={busy} onPress={save} /></Screen>;
}
