import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Button, Empty, Hairline, NavBar, Screen, SearchField, Seg } from "@/components/ui";
import type { CurriculumResponse } from "@/types";
import { useTheme } from "@/theme";

export default function AddSubjectScreen() {
  const { periodId } = useLocalSearchParams<{ periodId?: string }>();
  const { colors } = useTheme();
  const client = useQueryClient();
  const curriculum = useQuery({ queryKey: ["curriculum"], queryFn: () => api<CurriculumResponse>("/curriculum") });
  const [q, setQ] = useState("");
  const [optional, setOptional] = useState("false");
  const [chosen, setChosen] = useState("");
  const search = useQuery({
    queryKey: ["catalog", q],
    enabled: q.trim().length >= 2,
    queryFn: () => {
      const term = q.trim();
      const params = new URLSearchParams({ page: "1" });
      if (/\d/.test(term)) params.set("code", term);
      else params.set("name", term);
      return api<{ subjects: { code: string; name: string; time: number }[] }>(`/subjects?${params.toString()}`);
    },
  });
  const data = curriculum.data?.hasCurriculum ? curriculum.data : null;
  const periods = data?.periods ?? [];
  const [target, setTarget] = useState(periodId ?? periods[0]?.id ?? "");

  const add = async () => {
    await api("/curriculum/subjects", { method: "POST", body: JSON.stringify({ periodId: Number(target), subjectCode: chosen, isOptional: optional === "true" }) });
    client.invalidateQueries({ queryKey: ["curriculum"] });
    router.back();
  };

  return (
    <Screen>
      <NavBar title="Adicionar matéria" back="Cancelar" />
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{ padding: 16, gap: 8 }}>
          <Text style={{ fontSize: 12, color: colors.text2, fontWeight: "500" }}>Matéria</Text>
          <SearchField value={q} onChangeText={setQ} placeholder="Código ou nome" />
        </View>
        <ScrollView style={{ maxHeight: 220 }}>
          {(search.data?.subjects ?? []).slice(0, 8).map((item, index) => (
            <Hairline key={item.code} first={index === 0} onPress={() => setChosen(item.code)}>
              <Text style={{ width: 50, fontSize: 11, fontWeight: "600", color: colors.muted }}>{item.code}</Text>
              <Text style={{ flex: 1, color: chosen === item.code ? colors.link : colors.text }} numberOfLines={1}>{item.name}</Text>
            </Hairline>
          ))}
          {q.length >= 2 && !search.data?.subjects.length ? <Empty>Nenhuma disciplina encontrada.</Empty> : null}
        </ScrollView>
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Text style={{ fontSize: 12, color: colors.text2 }}>Tipo</Text>
          <Seg options={[{ id: "false", label: "Obrigatória" }, { id: "true", label: "Optativa" }]} value={optional} onChange={setOptional} />
        </View>
      </View>
      <View style={{ padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Button label="Adicionar à grade" onPress={add} />
      </View>
    </Screen>
  );
}
