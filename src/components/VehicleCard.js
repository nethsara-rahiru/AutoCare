import React from "react";
import { Image, View, Text } from "react-native";
import { Car, ArrowUpRight } from "lucide-react-native";
import { router } from "expo-router";
import { Card, Heading, Body, Button, styles } from "./UI";
import { colors as c } from "../theme";
import { km } from "../utils/format";
export function VehicleCard({ vehicle, children, detailed = false }) {
  return (
    <Card>
      <View style={styles.spread}>
        <View style={{ flex: 1 }}>
          <Body muted>{vehicle.nickname || "MY VEHICLE"}</Body>
          <Heading>
            {vehicle.make} {vehicle.model}
          </Heading>
          <Text style={{ color: c.accent, fontWeight: "700", marginTop: 6 }}>
            {vehicle.registration_no}
          </Text>
        </View>
        {vehicle.image_uri ? (
          <Image
            source={{ uri: vehicle.image_uri }}
            accessibilityLabel="Vehicle photo"
            style={{ width: 94, height: 74, borderRadius: 12 }}
          />
        ) : (
          <View
            style={{
              padding: 16,
              backgroundColor: c.secondary,
              borderRadius: 16,
            }}
          >
            <Car color={c.accent} size={48} />
          </View>
        )}
      </View>
      {detailed && vehicle.image_uri && (
        <Image
          source={{ uri: vehicle.image_uri }}
          style={{ height: 190, width: "100%", borderRadius: 12 }}
          resizeMode="cover"
        />
      )}
      <Body muted>
        {vehicle.year} · {vehicle.fuel_type} · {km(vehicle.current_mileage)}
      </Body>
      {!detailed && (
        <Button
          title="View vehicle"
          secondary
          icon={ArrowUpRight}
          onPress={() => router.push(`/vehicle/${vehicle.id}`)}
        />
      )}
      {children}
    </Card>
  );
}
