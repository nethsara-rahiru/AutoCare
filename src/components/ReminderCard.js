import React from 'react';
import { Text, View } from 'react-native';
import { Card, Heading, Body, styles } from './UI';
import { reminderStatus } from '../utils/calculations';
import { dateLabel, km } from '../utils/format';
import { colors as c } from '../theme';
export function ReminderCard({ reminder: r, children }) {
  const status = reminderStatus(r, r.current_mileage);
  const color = { Upcoming: c.accent, Due: c.warning, Overdue: c.danger, Completed: c.success }[status];
  return <Card><View style={styles.spread}><View style={{ flex: 1 }}><Heading>{r.title}</Heading><Body muted>{r.registration_no}</Body></View><Text style={{ color, fontWeight: '700' }}>{status}</Text></View><Body muted>{[r.due_date && dateLabel(r.due_date), r.due_mileage != null && km(r.due_mileage)].filter(Boolean).join(' · ')}</Body>{r.notes ? <Body>{r.notes}</Body> : null}{children}</Card>;
}
