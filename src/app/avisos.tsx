import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { NavBar, Screen, Section } from "@/components/ui";
import { useTheme } from "@/theme";

export default function AnnouncementsScreen() {
  const { colors } = useTheme();
  const query = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api<{ id: string; title: string; description: string; date: string }[]>("/announcements", { auth: false }),
  });
  useEffect(() => {
    const last = query.data?.[0]?.id ?? query.data?.at(-1)?.id;
    if (last) AsyncStorage.setItem("facilita.notice", last);
  }, [query.data]);
  return (
    <Screen>
      <NavBar title="Novidades" />
      <ScrollView>
        <Section first>
          {(query.data ?? []).map((item) => (
            <View key={item.id} style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ flex: 1, fontWeight: "600", color: colors.text }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>{item.date.slice(8, 10)}/{item.date.slice(5, 7)}/{item.date.slice(2, 4)}</Text>
              </View>
              <Text style={{ color: colors.text2, marginTop: 4, lineHeight: 19 }}>{item.description}</Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </Screen>
  );
}
