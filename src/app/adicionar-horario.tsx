import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Button, Field, NavBar, Screen } from "@/components/ui";
import { COLOR_HEX, COLOR_TOKENS, placeSubject, type ColorToken, type Timetable } from "@/domain/timetable";
import type { CurriculumResponse } from "@/types";
import { useTheme } from "@/theme";

export default function AddTimetableScreen() {
  const { subjectId, code: initial } = useLocalSearchParams<{ subjectId?: string; code?: string }>();
  const { colors } = useTheme();
  const client = useQueryClient();
  const curriculum = useQuery({ queryKey: ["curriculum"], queryFn: () => api<CurriculumResponse>("/curriculum") });
  const timetable = useQuery({ queryKey: ["timetable"], queryFn: () => api<{ timetable: Timetable | null }>("/timetable") });
  const data = curriculum.data?.hasCurriculum ? curriculum.data : null;
  const subjects = data ? Object.values(data.subjects) : [];
  const [chosen, setChosen] = useState(subjectId || subjects.find((item) => item.status === "doing")?.id || subjects[0]?.id || "");
  const [code, setCode] = useState(initial ?? "");
  const [color, setColor] = useState<ColorToken>("blue.500");
  const [message, setMessage] = useState("");

  const save = async () => {
    const current = timetable.data?.timetable;
    if (!current || !chosen) return;
    const placed = placeSubject(current, chosen, color, code);
    if (!placed.ok) {
      setMessage(placed.error);
      return;
    }
    await api("/timetable", { method: "PUT", body: JSON.stringify({ timetable: placed.timetable }) });
    client.invalidateQueries({ queryKey: ["timetable"] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
    router.back();
  };

  return (
    <Screen>
      <NavBar title="Adicionar horário" back="Cancelar" />
      <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Text style={{ fontSize: 12, color: colors.text2, marginBottom: 6 }}>Matéria</Text>
          {subjects.slice(0, 12).map((subject) => (
            <Pressable key={subject.id} onPress={() => setChosen(subject.id)} style={{ paddingVertical: 8 }}>
              <Text style={{ color: chosen === subject.id ? colors.link : colors.text, fontWeight: chosen === subject.id ? "600" : "400" }}>{subject.code} · {subject.name}</Text>
            </Pressable>
          ))}
          <Field label="Código do horário (SIGAA)" autoCapitalize="characters" value={code} onChangeText={setCode} placeholder="Ex.: 246M12" />
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 10 }}>Dias 2 a 7 + turno M, T ou N + tempos 1 a 5.</Text>
          <Text style={{ fontSize: 12, color: colors.text2, marginBottom: 8 }}>Cor</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {COLOR_TOKENS.map((token) => (
              <Pressable key={token} onPress={() => setColor(token)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: COLOR_HEX[token], borderWidth: color === token ? 2 : 0, borderColor: colors.text }} />
            ))}
          </View>
          {message ? <Text style={{ color: colors.alert, marginTop: 12 }}>{message}</Text> : null}
        </View>
      </ScrollView>
      <View style={{ padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Button label="Salvar horário" onPress={save} />
      </View>
    </Screen>
  );
}
