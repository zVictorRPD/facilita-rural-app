import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Button, Empty, Footer, Hairline, Hint, NavBar, Screen, SearchField, Section, Select } from "@/components/ui";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const names = [...new Set(courses.map((course) => course.name))].filter((item) => item.toLowerCase().includes(q.toLowerCase()));
  const versions = courses.filter((course) => course.name === name);

  const create = async () => {
    if (!code) return;
    setLoading(true);
    setError("");
    try {
      await api("/curriculum", { method: "POST", body: JSON.stringify({ courseCode: code }) });
      client.invalidateQueries({ queryKey: ["curriculum"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      router.replace("/(tabs)/grade");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a grade");
    } finally {
      setLoading(false);
    }
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
        <View style={{ flex: 1 }}>
          <ScrollView>
            <Hint>Passo 2 de 2 · vigência da grade</Hint>
            <Section first>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.text }}>{name}</Text>
                  <Text onPress={() => { setName(""); setCode(""); setError(""); }} style={{ color: colors.link, fontSize: 13, fontWeight: "600" }}>Trocar</Text>
                </View>
                <Select
                  label="Vigência da grade"
                  value={code}
                  placeholder="Selecione a grade"
                  options={versions.map((course) => ({ value: course.code, label: `Grade ${course.period_emergence}` }))}
                  onChange={setCode}
                />
              </View>
            </Section>
            <Hint>Na dúvida, escolha a grade do ano em que você entrou. Ela aparece no histórico do SIGAA.</Hint>
          </ScrollView>
          <Footer>
            {error ? <Text style={{ color: colors.alert, fontSize: 13, marginBottom: 8 }}>{error}</Text> : null}
            {!code ? <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Escolha uma vigência para continuar.</Text> : null}
            <Button label="Criar grade" onPress={create} loading={loading} disabled={!code} />
          </Footer>
        </View>
      )}
    </Screen>
  );
}
