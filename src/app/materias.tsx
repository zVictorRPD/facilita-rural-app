import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Empty, Hairline, Hint, NavBar, Screen, SearchField } from "@/components/ui";
import { useTheme } from "@/theme";

export default function SubjectsScreen() {
  const { colors } = useTheme();
  const [q, setQ] = useState("");
  const [hours, setHours] = useState(0);
  const query = useQuery({
    queryKey: ["subjects", q, hours],
    queryFn: () => api<{ subjects: { code: string; name: string; time: number }[] }>(`/subjects?page=1&code=${encodeURIComponent(q)}&name=${encodeURIComponent(q)}&time=${hours}`),
  });
  const rows = query.data?.subjects ?? [];
  return (
    <Screen>
      <NavBar title="Matérias" back="Mais" />
      <View style={{ backgroundColor: colors.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 8 }}>
        <SearchField value={q} onChangeText={setQ} placeholder="Código ou nome" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {[0, 30, 60, 90, 120].map((value) => (
            <Text key={value} onPress={() => setHours(value)} style={{ fontSize: 12, fontWeight: hours === value ? "600" : "500", color: hours === value ? colors.text : colors.text2, borderWidth: 1, borderColor: hours === value ? colors.text2 : colors.line, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.surface }}>{value ? `${value} h` : "Todas"}</Text>
          ))}
        </ScrollView>
      </View>
      <ScrollView>
        <Hint>{`${rows.length} disciplinas nesta página`}</Hint>
        {rows.map((item, index) => (
          <Hairline key={item.code} first={index === 0} onPress={() => router.push({ pathname: "/materias", params: { code: item.code } })}>
            <Text style={{ width: 50, fontSize: 11, fontWeight: "600", color: colors.muted }}>{item.code}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }} numberOfLines={1}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{item.time} h</Text>
            </View>
          </Hairline>
        ))}
        {!rows.length ? <Empty>Nenhuma disciplina encontrada.</Empty> : null}
      </ScrollView>
    </Screen>
  );
}
