import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Icon } from "@/components/icon";
import { Hairline, NavBar, Screen, SearchField } from "@/components/ui";
import { places } from "@/data/places";
import { useTheme } from "@/theme";

export default function MapScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const filtered = useMemo(
    () => places.filter((place) => `${place.name} ${place.label}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const selected = places.find((place) => place.id === selectedId) ?? null;
  const mapsReady = Boolean(process.env.EXPO_PUBLIC_MAP_API_KEY);

  return (
    <Screen>
      <NavBar title="Mapa do campus" back="Mais" />
      <View style={{ flex: 1 }}>
        {mapsReady ? (
          <MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={{ latitude: -22.763, longitude: -43.695, latitudeDelta: 0.03, longitudeDelta: 0.03 }}>
            {places.map((place) => (
              <Marker key={place.id} coordinate={{ latitude: place.lat, longitude: place.lng }} pinColor={selectedId === place.id ? "#C53030" : "#2A4365"} onPress={() => setSelectedId(place.id)} />
            ))}
          </MapView>
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
            <Text style={{ color: colors.muted, textAlign: "center" }}>O mapa não está disponível neste build.</Text>
          </View>
        )}
        <View style={{ position: "absolute", top: 10, left: 12, right: 12 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 }}>
            <SearchField value={query} onChangeText={setQuery} placeholder="Buscar prédio ou sigla" />
          </View>
        </View>
        {selected ? (
          <View style={{ position: "absolute", left: 12, right: 12, bottom: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{selected.label}</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{selected.name}</Text>
              </View>
              <Pressable onPress={() => setSelectedId(null)}><Icon name="x" color={colors.muted} /></Pressable>
            </View>
            <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps/dir//${selected.lat},${selected.lng}`)} style={{ marginTop: 12, height: 34, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.primaryInk, fontWeight: "600" }}>Como chegar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "42%", backgroundColor: colors.surface, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
            <Text style={{ fontWeight: "600", color: colors.text, paddingHorizontal: 16, paddingVertical: 10 }}>{filtered.length} locais</Text>
            <ScrollView>
              {filtered.slice(0, 12).map((place, index) => (
                <Hairline key={place.id} first={index === 0} onPress={() => setSelectedId(place.id)}>
                  <Icon name="pin" size={17} color={colors.muted} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "500", color: colors.text }}>{place.label}</Text>
                    {place.label !== place.name ? <Text style={{ fontSize: 12, color: colors.muted }}>{place.name}</Text> : null}
                  </View>
                </Hairline>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Screen>
  );
}
