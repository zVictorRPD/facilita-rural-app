import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api } from "@/api";
import { Icon } from "@/components/icon";
import { Button, Empty, Hairline, NavBar, Screen, Section, Seg, Sheet, SheetRow } from "@/components/ui";
import { COLOR_HEX, COLOR_TOKENS, removeSubject, type Timetable } from "@/domain/timetable";
import type { CurriculumResponse, Teacher } from "@/types";
import { dayGroups, hourLabel, weekdayLabel } from "@/ui/classes";
import { useTheme } from "@/theme";

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["curriculum"], queryFn: () => api<CurriculumResponse>("/curriculum") });
  const timetable = useQuery({ queryKey: ["timetable"], queryFn: () => api<{ timetable: Timetable | null }>("/timetable") });
  const [tab, setTab] = useState("info");
  const [move, setMove] = useState(false);
  const data = query.data?.hasCurriculum ? query.data : null;
  const subject = data?.subjects[id];
  const ratings = useQuery({
    queryKey: ["ratings", subject?.code],
    enabled: Boolean(subject),
    queryFn: () => api<{ average: { complexity: number; relevance: number }; mine: { complexity: number; relevance: number; comment: string } | null; ratings: { comment: string | null; complexity: number; relevance: number; user: { name: string } }[] }>(`/subjects/${subject?.code}/ratings`),
  });
  const reload = () => {
    client.invalidateQueries({ queryKey: ["curriculum"] });
    client.invalidateQueries({ queryKey: ["timetable"] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
  };
  if (!subject || !data) {
    return <Screen><NavBar title="Matéria" /><Empty>Carregando...</Empty></Screen>;
  }
  const save = async (body: unknown) => {
    await api(`/curriculum/subjects/${subject.id}`, { method: "PATCH", body: JSON.stringify(body) });
    reload();
  };
  const schedule = describe(timetable.data?.timetable, subject.id);

  return (
    <Screen>
      <NavBar title={subject.code} />
      <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <Text style={{ fontSize: 19, fontWeight: "700", color: colors.text }}>{subject.name}</Text>
        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>{subject.time} h · {subject.isOptional ? "Optativa" : "Obrigatória"} · {subject.periodName}</Text>
        <View style={{ marginTop: 12 }}>
          <Seg options={[{ id: "info", label: "Informações" }, { id: "notas", label: "Anotações" }, { id: "aval", label: "Avaliações" }]} value={tab} onChange={setTab} />
        </View>
      </View>
      <ScrollView>
        {tab === "info" ? (
          <>
            <Section first title="Status">
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <Seg options={[{ id: "todo", label: "Pendente" }, { id: "doing", label: "Cursando" }, { id: "done", label: "Aprovado" }]} value={subject.status} onChange={(status) => save({ status })} />
              </View>
            </Section>
            <Section title="Dados">
              <GradeField subjectId={subject.id} grade={subject.grade} onSave={(grade) => save({ grade })} />
              <Kv label="Período" value={`${subject.periodName} · mover`} onPress={() => setMove(true)} />
              <Kv label="Carga horária" value={`${subject.time} h`} />
              <Kv label="Tipo" value={subject.isOptional ? "Optativa" : "Obrigatória"} onPress={() => save({ isOptional: !subject.isOptional })} />
              <Kv label="Horário" value={schedule || "Adicionar ao horário"} onPress={() => router.push({ pathname: "/adicionar-horario", params: { subjectId: subject.id } })} />
            </Section>
            <Section title="Professor" action={subject.teacher ? <Text onPress={() => router.push({ pathname: "/professores", params: { subjectId: subject.id } })} style={{ color: colors.link, fontSize: 12 }}>Alterar</Text> : undefined}>
              {subject.teacher ? (
                <Hairline first>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{subject.teacher.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{subject.teacher.departament_code}</Text>
                    <View style={{ flexDirection: "row", gap: 14, marginTop: 6 }}>
                      {subject.teacher.email ? <Text onPress={() => Linking.openURL(`mailto:${subject.teacher?.email}`)} style={{ color: colors.link }}>E-mail</Text> : null}
                      {subject.teacher.lattes ? <Text onPress={() => Linking.openURL(subject.teacher!.lattes)} style={{ color: colors.link }}>Lattes</Text> : null}
                    </View>
                  </View>
                  <Pressable onPress={() => save({ teacherId: null })}><Icon name="x" size={17} color={colors.muted} /></Pressable>
                </Hairline>
              ) : (
                <Hairline first onPress={() => router.push({ pathname: "/professores", params: { subjectId: subject.id } })}>
                  <Icon name="plus" size={18} color={colors.link} />
                  <Text style={{ color: colors.link, fontWeight: "500" }}>Adicionar professor</Text>
                </Hairline>
              )}
            </Section>
            {schedule ? (
              <Section title="No horário">
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
                  {COLOR_TOKENS.map((token) => (
                    <Pressable key={token} onPress={() => recolor(timetable.data?.timetable, subject.id, token).then(reload)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: COLOR_HEX[token], borderWidth: 2, borderColor: colors.text }} />
                  ))}
                </View>
                <Hairline onPress={() => Alert.alert("Remover do horário", subject.name, [{ text: "Cancelar" }, { text: "Remover", onPress: () => clearColor(timetable.data?.timetable, subject.id).then(reload) }])}>
                  <Text style={{ color: colors.alert, fontWeight: "500" }}>Remover do horário</Text>
                </Hairline>
              </Section>
            ) : null}
            <View style={{ padding: 16 }}>
              <Button label="Remover da grade" variant="danger" onPress={() => Alert.alert("Remover da grade", subject.name, [{ text: "Cancelar" }, { text: "Remover", onPress: () => api(`/curriculum/subjects/${subject.id}`, { method: "DELETE" }).then(() => { reload(); router.back(); }) }])} />
            </View>
          </>
        ) : null}
        {tab === "notas" ? <Notes subjectId={subject.id} note={subject.note} links={subject.links} onSave={save} /> : null}
        {tab === "aval" ? <Ratings code={subject.code} data={ratings.data} enabled={subject.status !== "todo"} onSaved={() => ratings.refetch()} /> : null}
      </ScrollView>
      <Sheet visible={move} title="Mover para" onClose={() => setMove(false)}>
        {data.periods.map((period) => (
          <SheetRow key={period.id} label={period.name} selected={period.id === subject.periodId} onPress={() => {
            api(`/curriculum/subjects/${subject.id}/period`, { method: "PATCH", body: JSON.stringify({ periodId: Number(period.id) }) }).then(() => { setMove(false); reload(); });
          }} />
        ))}
      </Sheet>
    </Screen>
  );
}

function Kv({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
      <Text style={{ color: colors.text2, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: onPress ? colors.link : colors.text, fontWeight: "500", fontSize: 13, flex: 1, textAlign: "right" }}>{value}</Text>
    </Pressable>
  );
}

function GradeField({ grade, onSave }: { subjectId: string; grade: number | null; onSave: (grade: number | null) => void }) {
  const { colors } = useTheme();
  const [value, setValue] = useState(grade?.toString() ?? "");
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 }}>
      <Text style={{ color: colors.text2, fontSize: 13 }}>Nota final</Text>
      <TextInput value={value} onChangeText={setValue} onBlur={() => onSave(value === "" ? null : Number(value.replace(",", ".")))} keyboardType="decimal-pad" placeholder="—" placeholderTextColor={colors.muted} style={{ width: 72, height: 32, borderWidth: 1, borderColor: colors.line, borderRadius: 8, textAlign: "center", color: colors.text }} />
    </View>
  );
}

function Notes({ subjectId, note, links, onSave }: { subjectId: string; note: string | null; links: { name: string; url: string }[]; onSave: (body: unknown) => Promise<void> }) {
  const { colors } = useTheme();
  const [text, setText] = useState(note ?? "");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  return (
    <>
      <Section first title="Anotações">
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <TextInput value={text} onChangeText={setText} onBlur={() => onSave({ note: text })} multiline placeholder="Escreva algo sobre a matéria" placeholderTextColor={colors.muted} style={{ minHeight: 96, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10, color: colors.text, textAlignVertical: "top" }} />
        </View>
      </Section>
      <Section title={`Links úteis · ${links.length}`}>
        {links.map((link) => (
          <Hairline key={link.url} onPress={() => Linking.openURL(link.url)}>
            <Icon name="link" size={16} color={colors.link} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.link, fontWeight: "500" }}>{link.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>{link.url}</Text>
            </View>
          </Hairline>
        ))}
        <View style={{ padding: 16, gap: 8 }}>
          <TextInput value={name} onChangeText={setName} placeholder="Nome (ex.: Slides)" placeholderTextColor={colors.muted} style={{ height: 40, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 11, color: colors.text }} />
          <TextInput value={url} onChangeText={setUrl} autoCapitalize="none" placeholder="Endereço" placeholderTextColor={colors.muted} style={{ height: 40, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 11, color: colors.text }} />
          <Button label="Adicionar link" variant="sec" onPress={() => onSave({ links: [...links, { name, url: url.startsWith("http") ? url : `https://${url}` }] }).then(() => { setName(""); setUrl(""); })} />
        </View>
      </Section>
    </>
  );
}

function Ratings({ code, data, enabled, onSaved }: { code: string; data?: { average: { complexity: number; relevance: number }; ratings: { comment: string | null; complexity: number; relevance: number; user: { name: string } }[] }; enabled: boolean; onSaved: () => void }) {
  const { colors } = useTheme();
  const [complexity, setComplexity] = useState("5");
  const [relevance, setRelevance] = useState("5");
  const [comment, setComment] = useState("");
  return (
    <>
      <Section first title={`Avaliação dos alunos · ${data?.ratings.length ?? 0}`}>
        <View style={{ flexDirection: "row" }}>
          <Stat label="Complexidade" value={data?.average.complexity} />
          <Stat label="Relevância" value={data?.average.relevance} />
        </View>
      </Section>
      <Section title="Avaliar">
        {enabled ? (
          <View style={{ padding: 16, gap: 8 }}>
            <Text style={{ color: colors.text2, fontSize: 12 }}>Complexidade de 0 a 10</Text>
            <TextInput value={complexity} onChangeText={setComplexity} keyboardType="number-pad" style={{ height: 40, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 11, color: colors.text }} />
            <Text style={{ color: colors.text2, fontSize: 12 }}>Relevância de 0 a 10</Text>
            <TextInput value={relevance} onChangeText={setRelevance} keyboardType="number-pad" style={{ height: 40, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 11, color: colors.text }} />
            <TextInput value={comment} onChangeText={setComment} placeholder="Comentário (opcional)" placeholderTextColor={colors.muted} style={{ minHeight: 70, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10, color: colors.text }} />
            <Button label="Enviar avaliação" variant="sec" onPress={() => api(`/subjects/${code}/rating`, { method: "PUT", body: JSON.stringify({ complexity: Number(complexity), relevance: Number(relevance), comment }) }).then(onSaved)} />
          </View>
        ) : <Empty>Marque a matéria como Cursando ou Aprovado para avaliar.</Empty>}
      </Section>
      <Section title="Comentários">
        {data?.ratings.filter((item) => item.comment).map((item) => (
          <View key={`${item.user.name}-${item.comment}`} style={{ paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Text style={{ fontWeight: "600", color: colors.text, fontSize: 12 }}>{item.user.name}</Text>
            <Text style={{ color: colors.text2, marginTop: 4 }}>{item.comment}</Text>
          </View>
        ))}
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: colors.muted, letterSpacing: 0.5 }}>{label.toUpperCase()}</Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{value ? value.toFixed(1) : "—"}<Text style={{ fontSize: 12, color: colors.muted }}> /10</Text></Text>
    </View>
  );
}

function describe(timetable: Timetable | null | undefined, id: string) {
  const parts: string[] = [];
  for (const day of ["2", "3", "4", "5", "6", "7"]) {
    dayGroups(timetable, day).filter((block) => block.id === id).forEach((block) => {
      parts.push(`${weekdayLabel(day).slice(0, 3)} ${hourLabel(block.start)}–${hourLabel(block.end)}`);
    });
  }
  return parts.join("; ");
}

async function recolor(timetable: Timetable | null | undefined, id: string, color: string) {
  if (!timetable) return;
  const next = structuredClone(timetable);
  for (const day of Object.keys(next)) for (const turn of Object.keys(next[day])) for (const slot of Object.keys(next[day][turn])) {
    const cell = next[day][turn][slot];
    if (cell && typeof cell === "object" && cell.id === id) next[day][turn][slot] = { id, bgColor: color as typeof cell.bgColor };
  }
  await api("/timetable", { method: "PUT", body: JSON.stringify({ timetable: next }) });
}

async function clearColor(timetable: Timetable | null | undefined, id: string) {
  if (!timetable) return;
  await api("/timetable", { method: "PUT", body: JSON.stringify({ timetable: removeSubject(timetable, id) }) });
}
