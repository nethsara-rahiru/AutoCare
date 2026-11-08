import React, { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useApp } from "../src/hooks/useApp";
import {
  Screen,
  Button,
  Field,
  VehicleChoice,
  Choices,
  Card,
  Heading,
  ErrorText,
  Empty,
  styles,
  confirmDelete,
} from "../src/components/UI";
import { ReminderCard } from "../src/components/ReminderCard";
import { reminderStatus } from "../src/utils/calculations";
export default function Reminders() {
  const { vehicleId } = useLocalSearchParams();
  const { vehicles, reminders, mutate } = useApp();
  const [vehicle, setVehicle] = useState(vehicleId || ""),
    [filter, setFilter] = useState("All"),
    [editing, setEditing] = useState(null),
    [form, setForm] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const set = (key) => (value) => setForm((old) => ({ ...old, [key]: value }));
  function add() {
    setEditing(null);
    setError("");
    setForm({
      vehicle_id: Number(vehicle) || vehicles[0]?.id || "",
      title: "",
      due_date: "",
      due_mileage: "",
      notes: "",
      status: "active",
    });
  }
  async function operation(action, ...args) {
    setError("");
    setBusy(true);
    try {
      await mutate("reminders", action, ...args);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const records = reminders.filter(
    (r) =>
      (!vehicle || r.vehicle_id === Number(vehicle)) &&
      (filter === "All" || reminderStatus(r, r.current_mileage) === filter),
  );
  if (!vehicles.length)
    return (
      <Screen title="Maintenance reminders">
        <Empty
          title="Add a vehicle first"
          action={
            <Button
              title="Add vehicle"
              onPress={() => router.push("/vehicle/form")}
            />
          }
        />
      </Screen>
    );
  return (
    <Screen
      title="Stay ahead"
      subtitle="A little care goes a long way."
      action={<Button title="Add" onPress={add} />}
    >
      <ErrorText>{error}</ErrorText>
      {form && (
        <Card>
          <Heading>{editing ? "Edit reminder" : "New reminder"}</Heading>
          <VehicleChoice
            vehicles={vehicles}
            value={form.vehicle_id}
            onChange={set("vehicle_id")}
          />
          {[
            ["title", "Reminder title"],
            ["due_date", "Due date (YYYY-MM-DD, optional)"],
            ["due_mileage", "Due mileage (km, optional)"],
            ["notes", "Notes (optional)"],
          ].map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={form[key]}
              onChangeText={set(key)}
              keyboardType={key === "due_mileage" ? "numeric" : "default"}
              multiline={key === "notes"}
            />
          ))}
          <Button
            title={busy ? "Saving…" : "Save reminder"}
            disabled={busy}
            onPress={async () => {
              if (await operation("save", form, editing)) setForm(null);
            }}
          />
          <Button title="Cancel" secondary onPress={() => setForm(null)} />
        </Card>
      )}
      <VehicleChoice
        all
        vehicles={vehicles}
        value={vehicle}
        onChange={setVehicle}
      />
      <Choices
        label="Status"
        options={["All", "Upcoming", "Due", "Overdue", "Completed"]}
        value={filter}
        onChange={setFilter}
      />
      {!records.length && (
        <Empty title="All clear" message="No reminders match this view." />
      )}
      {records.map((r) => (
        <ReminderCard key={r.id} reminder={r}>
          <View style={styles.row}>
            {r.status !== "completed" && (
              <Button
                title="Complete"
                disabled={busy}
                onPress={() => operation("complete", r.id)}
              />
            )}
            <Button
              secondary
              title="Edit"
              onPress={() => {
                setEditing(r.id);
                setForm(r);
                setError("");
              }}
            />
            <Button
              danger
              title="Delete"
              disabled={busy}
              onPress={() =>
                confirmDelete("Delete this reminder permanently?", () =>
                  operation("remove", r.id),
                )
              }
            />
          </View>
        </ReminderCard>
      ))}
    </Screen>
  );
}
