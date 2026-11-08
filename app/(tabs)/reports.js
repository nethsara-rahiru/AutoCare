import React, { useState } from "react";
import { View } from "react-native";
import { useApp } from "../../src/hooks/useApp";
import {
  Screen,
  VehicleChoice,
  Field,
  Button,
  Card,
  Heading,
  Stat,
  ErrorText,
  styles,
} from "../../src/components/UI";
import { ExpenseChart } from "../../src/components/ExpenseChart";
import { expenses, monthlyExpenses } from "../../src/utils/calculations";
import { validDate } from "../../src/utils/validation";
import { money, roundMoney } from "../../src/utils/format";
export default function Reports() {
  const app = useApp(),
    [vehicle, setVehicle] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const error =
    (from && !validDate(from)) || (to && !validDate(to))
      ? "Use valid dates in YYYY-MM-DD format."
      : from && to && from > to
        ? "Start date must be before the end date."
        : "";
  const matches = (r, key, withVehicle = true) =>
    !error &&
    (!withVehicle || !vehicle || r.vehicle_id === Number(vehicle)) &&
    (!from || r[key] >= from) &&
    (!to || r[key] <= to);
  const services = app.services.filter((r) => matches(r, "service_date")),
    fuel = app.fuel.filter((r) => matches(r, "filled_at")),
    totals = expenses(services, fuel);
  const categories = new Map();
  services.forEach((r) =>
    categories.set(
      r.service_type,
      roundMoney((categories.get(r.service_type) || 0) + r.cost),
    ),
  );
  const comparison = app.vehicles
    .filter((v) => !vehicle || v.id === Number(vehicle))
    .map((v) => ({
      label: `${v.registration_no} · ${v.make}`,
      value: expenses(
        app.services.filter(
          (r) => r.vehicle_id === v.id && matches(r, "service_date", false),
        ),
        app.fuel.filter(
          (r) => r.vehicle_id === v.id && matches(r, "filled_at", false),
        ),
      ).total,
    }));
  return (
    <Screen
      title="The bigger picture"
      subtitle="Your expenses, clearly in view. All amounts in LKR."
    >
      <VehicleChoice
        vehicles={app.vehicles}
        all
        value={vehicle}
        onChange={setVehicle}
      />
      <Field
        label="From date (YYYY-MM-DD, optional)"
        value={from}
        onChangeText={setFrom}
      />
      <Field
        label="To date (YYYY-MM-DD, optional)"
        value={to}
        onChangeText={setTo}
      />
      <Button
        title="Clear date range"
        secondary
        onPress={() => {
          setFrom("");
          setTo("");
        }}
      />
      <ErrorText>{error}</ErrorText>
      <View style={styles.row}>
        <Stat label="Maintenance expenses" value={money(totals.serviceCost)} />
        <Stat label="Fuel expenses" value={money(totals.fuelCost)} />
        <Stat label="Combined expenses" value={money(totals.total)} accent />
      </View>
      <Card>
        <Heading>Monthly expense breakdown</Heading>
        <ExpenseChart rows={monthlyExpenses(services, fuel)} />
      </Card>
      <Card>
        <Heading>Expense categories</Heading>
        <ExpenseChart
          rows={[...categories]
            .map(([label, value]) => ({ label, value }))
            .concat(
              fuel.length ? [{ label: "Fuel", value: totals.fuelCost }] : [],
            )}
        />
      </Card>
      <Card>
        <Heading>Vehicle comparison</Heading>
        <ExpenseChart rows={comparison} />
      </Card>
    </Screen>
  );
}
