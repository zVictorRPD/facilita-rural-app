import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Button, Field, Hairline, NavBar, Screen, Section, Seg } from "@/components/ui";
import { averageGrade, topTeacher, workloadProgress } from "@/domain/progress";
import type { CurriculumResponse } from "@/types";
import { useTheme } from "@/theme";

export default function SummaryScreen() {
  const { colors } = useTheme();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["curriculum"], queryFn: () => api<CurriculumResponse>("/curriculum") });
  const [tab, setTab] = useState("curso");
  const [useDoing, setUseDoing] = useState(false);
  const [name, setName] = useState("");
  const [hours, setHours] = useState("");
  const data = query.data?.hasCurriculum ? query.data : null;
  if (!data) return <Screen><NavBar title="Resumo do curso" back="Grade" /></Screen>;
  const subjects = Object.values(data.subjects);
  const totals = { obrigatory: data.course.workload_normal_lessons, optional: data.course.workload_optional_lessons, complementary: data.course.workload_complementary };
  const progress = workloadProgress(subjects, data.complementary.map((item) => item.time), useDoing, totals);
  const goal = totals.obrigatory + totals.optional + totals.complementary;
  const reload = () => client.invalidateQueries({ queryKey: ["curriculum"] });

  return (
    <Screen>
      <NavBar title="Resumo do curso" back="Grade" />
      <View style={{ backgroundColor: colors.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <Seg options={[{ id: "curso", label: "Curso" }, { id: "periodos", label: "Períodos" }, { id: "materias", label: "Matérias" }, { id: "comp", label: "Complem." }]} value={tab} onChange={setTab} />
      </View>
      <ScrollView>
        {tab === "curso" ? (
          <Section first title="Curso">
            {[["Nome", data.course.name], ["Grade", data.course.period_emergence], ["CH obrigatória", `${totals.obrigatory} h`], ["CH optativa", `${totals.optional} h`], ["CH complementar", `${totals.complementary} h`], ["CH total", `${goal} h`], ["Feito", `${progress.total} h · ${goal ? Math.round((progress.total / goal) * 100) : 0}%`]].map(([label, value]) => (
              <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
                <Text style={{ color: colors.text2, fontSize: 13 }}>{label}</Text>
                <Text style={{ color: colors.text, fontWeight: "500", fontSize: 13, flex: 1, textAlign: "right" }}>{value}</Text>
              </View>
            ))}
            <Hairline onPress={() => setUseDoing((value) => !value)}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "500" }}>Incluir matérias cursando</Text>
              </View>
              <Text style={{ color: colors.link }}>{useDoing ? "sim" : "não"}</Text>
            </Hairline>
          </Section>
        ) : null}
        {tab === "periodos" ? (
          <Section first>
            {data.periods.map((period, index) => (
              <Hairline key={period.id} first={index === 0} onPress={() => api(`/curriculum/periods/${period.id}/visibility`, { method: "PATCH", body: JSON.stringify({ visible: !period.visible }) }).then(reload)}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "500" }}>{period.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{period.visible ? "visível na grade" : "oculto"}</Text>
                </View>
              </Hairline>
            ))}
          </Section>
        ) : null}
        {tab === "materias" ? (
          <Section first title="Matérias">
            {[["Total", String(subjects.length)], ["Aprovadas", String(subjects.filter((item) => item.status === "done").length)], ["Cursando", String(subjects.filter((item) => item.status === "doing").length)], ["Pendentes", String(subjects.filter((item) => item.status === "todo").length)], ["Nota média", averageGrade(subjects, false)?.toString() ?? "—"], ["Professor mais atribuído", topTeacher(subjects.map((item) => ({ ...item, teacherName: item.teacher?.name }))) ?? "—"]].map(([label, value]) => (
              <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
                <Text style={{ color: colors.text2 }}>{label}</Text>
                <Text style={{ color: colors.text, fontWeight: "500" }}>{value}</Text>
              </View>
            ))}
          </Section>
        ) : null}
        {tab === "comp" ? (
          <>
            <Section first title="Atividades">
              {data.complementary.map((item, index) => (
                <Hairline key={item.id} first={index === 0} onPress={() => api(`/curriculum/complementary/${item.id}`, { method: "DELETE" }).then(reload)}>
                  <Text style={{ flex: 1, color: colors.text }}>{item.name}</Text>
                  <Text style={{ color: colors.text2 }}>{item.time} h</Text>
                </Hairline>
              ))}
            </Section>
            <Section title="Adicionar atividade">
              <View style={{ paddingHorizontal: 16 }}>
                <Field label="Nome" value={name} onChangeText={setName} />
                <Field label="Horas" keyboardType="number-pad" value={hours} onChangeText={setHours} />
                <Button label="Adicionar" variant="sec" onPress={() => api("/curriculum/complementary", { method: "POST", body: JSON.stringify({ name, time: Number(hours) }) }).then(() => { setName(""); setHours(""); reload(); })} />
                <View style={{ height: 16 }} />
              </View>
            </Section>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
