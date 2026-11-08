import React from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, Plus, Search } from 'lucide-react-native';
import { colors as c } from '../theme';
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background }, content: { padding: 20, paddingBottom: 40, gap: 16, width: '100%', maxWidth: 760, alignSelf: 'center' },
  title: { color: c.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.8 }, subtitle: { color: c.muted, fontSize: 14, lineHeight: 21 },
  heading: { color: c.text, fontSize: 18, fontWeight: '700' }, text: { color: c.text, fontSize: 15, lineHeight: 23 },
  card: { backgroundColor: c.surface, borderRadius: 20, padding: 18, gap: 10, borderWidth: 1, borderColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }, spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  button: { backgroundColor: c.accent, minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { color: c.background, fontWeight: '700', fontSize: 14 }, input: { color: c.text, borderWidth: 1, borderColor: c.border, backgroundColor: c.secondary, borderRadius: 12, padding: 14, minHeight: 50, fontSize: 16 },
  label: { color: c.muted, fontSize: 13, fontWeight: '600', marginBottom: 7 }, chip: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.secondary },
  stat: { flexGrow: 1, flexBasis: '44%', backgroundColor: c.surface, padding: 16, borderRadius: 16, gap: 8, borderWidth: 1, borderColor: c.border },
});
export function Screen({ title, subtitle, children, action }) {
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><View style={styles.spread}><View style={{ flex: 1 }}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>{action}</View>{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export const Card = ({ children, style }) => <View style={[styles.card, style]}>{children}</View>;
export const Heading = ({ children }) => <Text accessibilityRole="header" style={styles.heading}>{children}</Text>;
export const Body = ({ children, muted = false }) => <Text style={muted ? styles.subtitle : styles.text}>{children}</Text>;
export function Button({ title, onPress, secondary, danger, disabled, icon: Icon }) { return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && { backgroundColor: c.secondary }, danger && { backgroundColor: '#48202A' }, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>{Icon && <Icon size={18} color={secondary ? c.accent : c.background} />}<Text style={[styles.buttonText, (secondary || danger) && { color: danger ? c.danger : c.accent }]}>{title}</Text></Pressable>; }
export function Field({ label, value, onChangeText, multiline, ...props }) { return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={c.muted} value={String(value ?? '')} onChangeText={onChangeText} multiline={multiline} style={[styles.input, multiline && { minHeight: 95, textAlignVertical: 'top' }]} {...props} /></View>; }
export const SearchField = ({ value, onChangeText, placeholder = 'Search records…' }) => <View style={[styles.row, { flexWrap: 'nowrap' }]}><Search color={c.muted} size={20} /><View style={{ flex: 1 }}><Field label="Search" value={value} onChangeText={onChangeText} placeholder={placeholder} /></View></View>;
export function Choices({ label, options, value, onChange }) { return <View style={{ gap: 8 }}><Text style={styles.label}>{label}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{options.map(option => { const item = typeof option === 'string' ? { label: option, value: option } : option; const selected = String(item.value) === String(value); return <Pressable key={String(item.value)} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${label}: ${item.label}`} onPress={() => onChange(item.value)} style={[styles.chip, selected && { borderColor: c.accent, backgroundColor: '#15334A' }]}><Text style={{ color: selected ? c.accent : c.muted, fontWeight: '600' }}>{item.label}</Text></Pressable>; })}</ScrollView></View>; }
export const Stat = ({ label, value, accent }) => <View style={styles.stat}><Text style={styles.label}>{label}</Text><Text style={{ color: accent ? c.accent : c.text, fontSize: 20, fontWeight: '800' }}>{value}</Text></View>;
export const Empty = ({ title = 'Nothing here yet', message = 'Add your first record to get started.', action }) => <Card><Car color={c.accent} size={40} /><Heading>{title}</Heading><Body muted>{message}</Body>{action}</Card>;
export const ErrorText = ({ children }) => children ? <Text accessibilityRole="alert" style={{ color: c.danger, lineHeight: 22 }}>{children}</Text> : null;
export const Loading = () => <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}><ActivityIndicator color={c.accent} size="large" /><Body>Opening your garage…</Body></View>;
export async function confirmDelete(message, action) {
  if (Platform.OS === 'web') { if (window.confirm(message)) await action(); }
  else Alert.alert('Delete record?', message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: action }]);
}
export function VehicleChoice({ vehicles, value, onChange, all = false }) { return <Choices label="Vehicle" options={[...(all ? [{ label: 'All vehicles', value: '' }] : []), ...vehicles.map(v => ({ label: `${v.registration_no} · ${v.make}`, value: v.id }))]} value={value} onChange={onChange} />; }
