import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Bell, Plus, Wrench, Fuel } from "lucide-react-native";
import { useApp } from "../../src/hooks/useApp";
import {
  Screen,
  VehicleChoice,
  Card,
  Heading,
  Body,
  Button,
  Stat,
  Empty,
  styles,
} from "../../src/components/UI";
import { VehicleCard } from "../../src/components/VehicleCard";
import { ReminderCard } from "../../src/components/ReminderCard";
import { expenses, reminderStatus } from "../../src/utils/calculations";
import { money, dateLabel, km } from "../../src/utils/format";
export default function Dashboard() {
  const app = useApp(),
    [selected, setSelected] = useState(null);
  const vehicle =
    app.vehicles.find((v) => v.id === Number(selected)) || app.vehicles[0];
  if (!vehicle)
    return (
      <Screen title="Welcome to AutoCare" subtitle="Your Vehicle. Your Care.">
        <Empty
          title="Make room for your first vehicle"
          message="Keep every service, fill-up and reminder together. Privately, on your device."
          action={
            <Button
              title="Add vehicle"
              icon={Plus}
              onPress={() => router.push("/vehicle/form")}
            />
          }
        />
      </Screen>
    );
  const services = app.services.filter((r) => r.vehicle_id === vehicle.id),
    fuel = app.fuel.filter((r) => r.vehicle_id === vehicle.id),
    totals = expenses(services, fuel);
  const priority = { Overdue: 0, Due: 1, Upcoming: 2 };
  const reminders = app.reminders
    .filter((r) => r.vehicle_id === vehicle.id && r.status !== "completed")
    .sort(
      (a, b) =>
        priority[reminderStatus(a, a.current_mileage)] -
          priority[reminderStatus(b, b.current_mileage)] ||
        (a.due_date || "9999").localeCompare(b.due_date || "9999") ||
        (a.due_mileage ?? Infinity) - (b.due_mileage ?? Infinity),
    );
  return (
    <Screen
      title="Ready for the road?"
      subtitle="Your Vehicle. Your Care."
      action={
        <Button
          title="Reminders"
          secondary
          icon={Bell}
          onPress={() => router.push("/reminders")}
        />
      }
    >
      <VehicleChoice
        vehicles={app.vehicles}
        value={vehicle.id}
        onChange={setSelected}
      />
      <VehicleCard vehicle={vehicle} />
      <View style={styles.row}>
        <Stat label="Registered vehicles" value={app.vehicles.length} />
        <Stat label="Current odometer" value={km(vehicle.current_mileage)} />
        <Stat
          label="Maintenance · selected vehicle"
          value={money(totals.serviceCost)}
        />
        <Stat label="Fuel · selected vehicle" value={money(totals.fuelCost)} />
        <Stat
          label="Combined expenses · selected vehicle"
          value={money(totals.total)}
          accent
        />
      </View>
      <Heading>Quick actions</Heading>
      <View style={styles.row}>
        <Button
          title="Add service"
          icon={Wrench}
          onPress={() =>
            router.push({
              pathname: "/service/form",
              params: { vehicleId: vehicle.id },
            })
          }
        />
        <Button
          title="Add fuel"
          icon={Fuel}
          onPress={() =>
            router.push({
              pathname: "/fuel/form",
              params: { vehicleId: vehicle.id },
            })
          }
        />
      </View>
      <Heading>Care on the horizon</Heading>
      {!reminders.length && (
        <Card>
          <Body muted>
            No active reminders. Your next journey is looking clear.
          </Body>
          <Button
            title="Create reminder"
            secondary
            onPress={() =>
              router.push({
                pathname: "/reminders",
                params: { vehicleId: vehicle.id },
              })
            }
          />
        </Card>
      )}
      {reminders.slice(0, 3).map((r) => (
        <ReminderCard key={r.id} reminder={r} />
      ))}
      <Heading>Recent service activity</Heading>
      {!services.length && (
        <Body muted>No services yet. Record your next visit here.</Body>
      )}
      {services.slice(0, 3).map((r) => (
        <Card key={r.id}>
          <Heading>{r.service_type}</Heading>
          <Body>{money(r.cost)}</Body>
          <Body muted>
            {dateLabel(r.service_date)} ·{" "}
            {r.workshop || "Workshop not specified"}
          </Body>
          <Button
            secondary
            title="View service"
            onPress={() =>
              router.push({ pathname: "/service/form", params: { id: r.id } })
            }
          />
        </Card>
      ))}
    </Screen>
  );
}
