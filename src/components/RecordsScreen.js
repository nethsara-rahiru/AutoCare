import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { useApp } from "../hooks/useApp";
import {
  Screen,
  Button,
  SearchField,
  Choices,
  VehicleChoice,
  Stat,
  Empty,
  ErrorText,
  Body,
  styles,
} from "./UI";
import { RecordCard } from "./RecordCard";
import { SERVICE_TYPES } from "../constants";
import { money } from "../utils/format";
import { fuelStats } from "../utils/calculations";
export function RecordsScreen({ type }) {
  const app = useApp(),
    service = type === "services";
  const [vehicle, setVehicle] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All types"),
    [sort, setSort] = useState("Newest"),
    [error, setError] = useState("");
  const records = app[type].filter(
    (r) =>
      (!vehicle || r.vehicle_id === Number(vehicle)) &&
      (!service || category === "All types" || category === r.service_type) &&
      [
        r.registration_no,
        r.make,
        r.model,
        r.service_type,
        r.workshop,
        r.station,
        r.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const dateKey = service ? "service_date" : "filled_at";
  records.sort((a, b) =>
    sort === "Highest cost"
      ? b.cost - a.cost
      : sort === "Lowest cost"
        ? a.cost - b.cost
        : (sort === "Oldest" ? 1 : -1) *
          (a[dateKey].localeCompare(b[dateKey]) || a.id - b.id),
  );
  const stats = fuelStats(
    service
      ? []
      : app.fuel.filter((r) => !vehicle || r.vehicle_id === Number(vehicle)),
  );
  async function remove(id) {
    try {
      await app.mutate(type, "remove", id);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Screen
      title={service ? "Service history" : "Fuel tracker"}
      subtitle={
        service
          ? "Keep your vehicle at its best."
          : "Understand every fill-up. Summaries follow the vehicle filter."
      }
      action={
        <Button
          title="Add"
          icon={Plus}
          onPress={() => router.push(service ? "/service/form" : "/fuel/form")}
        />
      }
    >
      <ErrorText>{error}</ErrorText>
      <VehicleChoice
        vehicles={app.vehicles}
        all
        value={vehicle}
        onChange={setVehicle}
      />
      <SearchField value={search} onChangeText={setSearch} />
      {service && (
        <Choices
          label="Service category"
          options={["All types", ...SERVICE_TYPES]}
          value={category}
          onChange={setCategory}
        />
      )}
      <Choices
        label="Sort"
        options={
          service
            ? ["Newest", "Oldest", "Highest cost", "Lowest cost"]
            : ["Newest", "Oldest"]
        }
        value={sort}
        onChange={setSort}
      />
      <View style={styles.row}>
        {service ? (
          <Stat
            label="Maintenance spending · filtered"
            value={money(records.reduce((n, r) => n + r.cost, 0))}
            accent
          />
        ) : (
          <>
            <Stat label="Fuel spending" value={money(stats.cost)} accent />
            <Stat
              label="Litres purchased"
              value={`${stats.liters.toFixed(2)} L`}
            />
            <Stat
              label="Average price / litre"
              value={
                stats.averagePrice == null ? "—" : money(stats.averagePrice)
              }
            />
            <Stat
              label="Fuel efficiency"
              value={
                stats.efficiency == null
                  ? "—"
                  : `${stats.efficiency.toFixed(1)} km/L`
              }
            />
          </>
        )}
      </View>
      {!service && (
        <Body muted>
          {stats.efficiency == null
            ? "Not enough data: efficiency needs two consecutive full-tank records for the same vehicle with increasing odometers."
            : "Efficiency uses consecutive full tanks: distance divided by the later fill-up’s litres. Partial fills break an interval."}
        </Body>
      )}
      {!records.length && (
        <Empty
          title="No records to show"
          message="Add a record or adjust your filters."
        />
      )}
      {records.map((r) => (
        <RecordCard key={r.id} record={r} type={type} onDelete={remove} />
      ))}
    </Screen>
  );
}
