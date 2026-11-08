import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Card, Heading, Body, Button, styles, confirmDelete } from "./UI";
import { money, km, dateLabel } from "../utils/format";
export function RecordCard({ record: r, type, onDelete }) {
  const service = type === "services";
  return (
    <Card>
      <View style={styles.spread}>
        <View style={{ flex: 1 }}>
          <Heading>
            {service
              ? r.service_type
              : `${r.liters.toFixed(2)} L · ${r.is_full_tank ? "Full tank" : "Partial fill"}`}
          </Heading>
          <Body muted>
            {r.registration_no} ·{" "}
            {dateLabel(service ? r.service_date : r.filled_at)}
          </Body>
        </View>
      </View>
      <Heading>{money(service ? r.cost : r.total_cost)}</Heading>
      <Body muted>
        {km(service ? r.mileage : r.odometer)}
        {(service ? r.workshop : r.station)
          ? ` · ${service ? r.workshop : r.station}`
          : ""}
      </Body>
      {r.notes ? <Body>{r.notes}</Body> : null}
      <View style={styles.row}>
        <Button
          secondary
          title="Edit"
          onPress={() =>
            router.push({
              pathname: service ? "/service/form" : "/fuel/form",
              params: { id: r.id },
            })
          }
        />
        <Button
          danger
          title="Delete"
          onPress={() =>
            confirmDelete("Delete this record permanently?", () =>
              onDelete(r.id),
            )
          }
        />
      </View>
    </Card>
  );
}
