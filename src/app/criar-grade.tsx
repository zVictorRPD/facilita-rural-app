import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Button, Empty, Hairline, Hint, NavBar, Screen, SearchField, Section } from "@/components/ui";
import type { CurriculumResponse } from "@/types";
import { useTheme } from "@/theme";

export default function CreateGradeScreen() {
  const { colors } = useTheme();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["curriculum"], queryFn: () => api<CurriculumResponse>("/curriculum") });
  const courses = query.data && !query.data.hasCurriculum ? query.data.courses : [];
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const names = [...new Set(courses.map((course) => course.name))].filter((item) => item.toLowerCase().includes(q.toLowerCase()));
  const versions = courses.filter((course) => course.name === name);

  const create = async () => {
    await api("/curriculum", { method: "POST", body: JSON.stringify({ courseCode: code }) });
    client.invalidateQueries({ queryKey: ["curriculum"] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
    router.replace("/(tabs)/grade");
  };

  return (
    <Screen>
      <NavBar title="Criar grade" back="Grade" />
      {!name ? (
        <>
          <View style={{ backgroundColor: colors.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <SearchField value={q} onChangeText={setQ} placeholder="Buscar curso" />
          </View>
          <ScrollView>
            <Hint>Passo 1 de 2 · escolha o curso</Hint>
            <Section first>
              {names.map((item, index) => (
                <Hairline key={item} first={index === 0} onPress={() => setName(item)}>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text }}>{item}</Text>
                </Hairline>
              ))}
              {!names.length ? <Empty>Nenhum curso encontrado.</Empty> : null}
            </Section>
          </ScrollView>
        </>
      ) : (
        <>
          <ScrollView>
            <Hint>Passo 2 de 2 · vigência da grade</Hint>
            <Section first title={name} action={<Text onPress={() => { setName(""); setCode(""); }} style={{ color: colors.link, fontSize: 12 }}>Trocar</Text>}>
              {versions.map((course, index) => (
                <Hairline key={course.code} first={index === 0} onPress={() => setCode(course.code)}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>Grade {course.period_emergence}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{code === course.code ? "Selecionada" : "Seropédica"}</Text>
                  </View>
                </Hairline>
              ))}
            </Section>
            <Hint>Na dúvida, escolha a grade do ano em que você entrou. Ela aparece no histórico do SIGAA.</Hint>
          </ScrollView>
          <View style={{ padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Button label="Criar grade" onPress={create} />
          </View>
        </>
      )}
    </Screen>
  );
}
