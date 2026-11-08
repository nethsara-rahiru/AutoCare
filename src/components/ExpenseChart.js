import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors as c } from '../theme';
import { money } from '../utils/format';
import { Body } from './UI';
export function ExpenseChart({ rows }) {
  const maximum = Math.max(1, ...rows.map(r => r.value));
  if (!rows.length) return <Body muted>No spending in this period.</Body>;
  return <View style={{ gap: 16 }}>{rows.map((r,i) => <View key={`${r.label}-${i}`} accessible accessibilityLabel={`${r.label}: ${money(r.value)}`}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Text style={{ color: c.muted, flex: 1 }}>{r.label}</Text><Text style={{ color: c.text, fontWeight: '600' }}>{money(r.value)}</Text></View><Svg width="100%" height={16} viewBox="0 0 300 16" preserveAspectRatio="none" style={{ marginTop: 7 }}><Rect x={0} y={0} width={300} height={12} rx={6} fill={c.secondary} /><Rect x={0} y={0} width={Math.max(0, r.value / maximum * 300)} height={12} rx={6} fill={i % 2 ? '#22C55E' : c.accent} /></Svg></View>)}</View>;
}
