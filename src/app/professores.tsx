import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Icon } from "@/components/icon";
import { Empty, Hairline, Hint, NavBar, Screen, SearchField, Sheet } from "@/components/ui";
import type { Teacher } from "@/types";
import { useTheme } from "@/theme";

export default function TeachersScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId?: string }>();
  const { colors } = useTheme();
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Teacher | null>(null);
  const query = useQuery({
    queryKey: ["teachers", name],
    queryFn: () => api<{ teachers: Teacher[] }>(`/teachers?page=1&name=${encodeURIComponent(name)}`),
  });
  const rows = query.data?.teachers ?? [];
  const pick = async (teacher: Teacher) => {
    if (!subjectId) {
      setSelected(teacher);
      return;
    }
    await api(`/curriculum/subjects/${subjectId}`, { method: "PATCH", body: JSON.stringify({ teacherId: teacher.id }) });
    client.invalidateQueries({ queryKey: ["curriculum"] });
    router.back();
  };
  return (
    <Screen>
      <NavBar title="Professores" back={subjectId ? "Cancelar" : "Mais"} />
      <View style={{ backgroundColor: colors.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <SearchField value={name} onChangeText={setName} placeholder="Nome do professor" />
      </View>
      <ScrollView>
        <Hint>{subjectId ? "Toque para atribuir à matéria" : `${rows.length} professores nesta página`}</Hint>
        {rows.map((teacher, index) => (
          <Hairline key={teacher.id} first={index === 0} onPress={() => pick(teacher)}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{teacher.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{teacher.departament_code} · {teacher.departament_name}</Text>
            </View>
            {teacher.email ? <Icon name="mail" size={18} color={colors.muted} /> : null}
          </Hairline>
        ))}
        {!rows.length ? <Empty>Nenhum professor encontrado.</Empty> : null}
      </ScrollView>
      <Sheet visible={Boolean(selected)} title={selected?.name ?? ""} onClose={() => setSelected(null)}>
        <Text style={{ paddingHorizontal: 16, color: colors.text2, marginBottom: 8 }}>{selected?.departament_name}</Text>
        {selected?.email ? <Hairline first onPress={() => Linking.openURL(`mailto:${selected.email}`)}><Icon name="mail" color={colors.text2} /><Text style={{ color: colors.text }}>Enviar e-mail</Text></Hairline> : null}
        {selected?.lattes ? <Hairline onPress={() => Linking.openURL(selected.lattes)}><Icon name="link" color={colors.text2} /><Text style={{ color: colors.text }}>Currículo Lattes</Text></Hairline> : null}
      </Sheet>
    </Screen>
  );
}
