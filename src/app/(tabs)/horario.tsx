import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Icon } from "@/components/icon";
import { AppBar, Empty, Hairline, Hint, Screen, Section, Seg } from "@/components/ui";
import { COLOR_HEX, DAY_KEYS, type Timetable } from "@/domain/timetable";
import type { CurriculumResponse } from "@/types";
import { dayGroups, hourLabel, weekdayLabel } from "@/ui/classes";
import { useTheme } from "@/theme";

const SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function TimetableScreen() {
  const { colors } = useTheme();
  const curriculum = useQuery({ queryKey: ["curriculum"], queryFn: () => api<CurriculumResponse>("/curriculum") });
  const timetableQuery = useQuery({ queryKey: ["timetable"], queryFn: () => api<{ timetable: Timetable | null }>("/timetable") });
  const [view, setView] = useState("dia");
  const todayKey = String(Math.min(Math.max(new Date().getDay() + 1, 2), 7));
  const [day, setDay] = useState(todayKey);
  const [free, setFree] = useState(false);
  const timetable = timetableQuery.data?.timetable;
  const subjects = curriculum.data?.hasCurriculum ? curriculum.data.subjects : {};
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;
  const monday = useMemo(() => {
    const date = new Date();
    const distance = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - distance);
    return date;
  }, []);

  return (
    <Screen>
      <AppBar
        title="Horário"
        subtitle={`Semana de ${monday.getDate()} a ${monday.getDate() + 5} de ${monday.toLocaleDateString("pt-BR", { month: "long" })}`}
        right={curriculum.data?.hasCurriculum ? (
          <Pressable onPress={() => router.push("/adicionar-horario")} hitSlop={8}><Icon name="plus" size={22} color={colors.text2} /></Pressable>
        ) : undefined}
      />
      {curriculum.data?.hasCurriculum ? (
        <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <Seg options={[{ id: "dia", label: "Dia" }, { id: "semana", label: "Semana" }]} value={view} onChange={setView} />
        </View>
      ) : null}
      {!curriculum.data?.hasCurriculum ? (
        <Empty>Crie sua grade curricular para montar o horário.</Empty>
      ) : view === "semana" ? (
        <WeekGrid timetable={timetable} subjects={subjects} todayKey={todayKey} />
      ) : (
        <ScrollView>
          <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            {DAY_KEYS.map((key, index) => {
              const date = new Date(monday);
              date.setDate(monday.getDate() + index);
              const on = day === key;
              return (
                <Pressable key={key} onPress={() => setDay(key)} style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: on ? colors.brand : "transparent" }}>
                  <Text style={{ fontSize: 11, color: on ? colors.text : colors.muted }}>{SHORT[index]}</Text>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: key === todayKey ? colors.link : colors.text }}>{date.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
          <Section first title={`${weekdayLabel(day)} · ${dayGroups(timetable, day).length} aulas`}>
            {(free ? freeRows(timetable, day) : dayGroups(timetable, day).map((block) => ({ kind: "class" as const, block }))).map((row, index) => row.kind === "class" ? (
              <Hairline key={`${row.block.id}-${row.block.start}`} first={index === 0} onPress={() => router.push(`/materia/${row.block.id}`)}>
                <Text style={{ width: 82, fontSize: 12, color: colors.text2 }}>{hourLabel(row.block.start)}–{hourLabel(row.block.end)}</Text>
                <View style={{ width: 3, alignSelf: "stretch", borderRadius: 2, backgroundColor: COLOR_HEX[row.block.color] }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }} numberOfLines={1}>{subjects[row.block.id]?.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{subjects[row.block.id]?.code}</Text>
                </View>
                {day === todayKey && row.block.start <= nowHour && nowHour < row.block.end ? <Text style={{ fontSize: 10, fontWeight: "600", color: colors.link }}>AGORA</Text> : null}
              </Hairline>
            ) : (
              <Hairline key={row.key} first={index === 0} onPress={() => router.push({ pathname: "/adicionar-horario", params: { code: row.code } })}>
                <Text style={{ width: 82, fontSize: 12, color: colors.muted }}>{row.label}</Text>
                <Text style={{ flex: 1, fontSize: 14, color: colors.muted }}>Livre</Text>
                <Icon name="plus" size={16} color={colors.link} />
              </Hairline>
            ))}
          </Section>
          <Section>
            <Hairline first onPress={() => setFree((value) => !value)}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>Mostrar horários livres</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>Toque num horário livre para adicionar uma matéria</Text>
              </View>
              <View style={{ width: 38, height: 22, borderRadius: 11, backgroundColor: free ? colors.ok : colors.line, justifyContent: "center", paddingHorizontal: 2 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff", marginLeft: free ? 16 : 0 }} />
              </View>
            </Hairline>
          </Section>
        </ScrollView>
      )}
    </Screen>
  );
}

function WeekGrid({ timetable, subjects, todayKey }: { timetable?: Timetable | null; subjects: Record<string, { code: string; name: string }>; todayKey: string }) {
  const { colors } = useTheme();
  const turns = ["m", "t", "n"] as const;
  const slots = ["1", "2", "3", "4", "5"] as const;
  const used = new Set<string>();
  return (
    <ScrollView>
      <Section first>
        <View style={{ padding: 10 }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: 36 }} />
            {SHORT.map((label, index) => <Text key={label} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: "600", color: DAY_KEYS[index] === todayKey ? colors.link : colors.muted }}>{label}</Text>)}
          </View>
          {turns.map((turn) => slots.map((slot) => (
            <View key={`${turn}${slot}`} style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>
              <Text style={{ width: 34, fontSize: 10, color: colors.muted, textAlign: "right", paddingRight: 4, lineHeight: 28 }}>{String(turn === "m" ? 6 + Number(slot) : turn === "t" ? 11 + Number(slot) : 16 + Number(slot)).padStart(2, "0")}h</Text>
              {DAY_KEYS.map((day) => {
                const cell = timetable?.[day]?.[turn]?.[slot];
                const occupied = cell && typeof cell === "object" ? cell : null;
                if (occupied) used.add(occupied.id);
                return (
                  <Pressable key={day} onPress={() => occupied ? router.push(`/materia/${occupied.id}`) : router.push({ pathname: "/adicionar-horario", params: { code: `${day}${turn.toUpperCase()}${slot}` } })} style={{ flex: 1, height: 28, borderRadius: 3, backgroundColor: occupied ? COLOR_HEX[occupied.bgColor] : colors.surface2, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: occupied ? "#fff" : "transparent" }}>{occupied ? subjects[occupied.id]?.code : ""}</Text>
                  </Pressable>
                );
              })}
            </View>
          )))}
        </View>
      </Section>
      <Section title="Legenda">
        {[...used].map((id, index) => (
          <Hairline key={id} first={index === 0} onPress={() => router.push(`/materia/${id}`)}>
            <Text style={{ width: 50, fontSize: 11, fontWeight: "600", color: colors.muted }}>{subjects[id]?.code}</Text>
            <Text style={{ flex: 1, fontSize: 14, color: colors.text }} numberOfLines={1}>{subjects[id]?.name}</Text>
          </Hairline>
        ))}
        {!used.size ? <Empty>Nenhuma matéria no horário.</Empty> : null}
      </Section>
      <Hint>Toque num horário vazio para adicionar uma matéria nele.</Hint>
    </ScrollView>
  );
}

function freeRows(timetable: Timetable | null | undefined, day: string) {
  const blocks = dayGroups(timetable, day);
  const rows: ({ kind: "class"; block: ReturnType<typeof dayGroups>[number] } | { kind: "free"; key: string; label: string; code: string })[] = [];
  (["m", "t", "n"] as const).forEach((turn) => {
    (["1", "2", "3", "4", "5"] as const).forEach((slot) => {
      const start = (turn === "m" ? 7 : turn === "t" ? 12 : 17) + Number(slot) - 1;
      const block = blocks.find((item) => item.start === start);
      const inside = blocks.find((item) => item.start < start && start < item.end);
      if (inside) return;
      if (block) rows.push({ kind: "class", block });
      else rows.push({ kind: "free", key: `${turn}${slot}`, label: `${hourLabel(start)}–${hourLabel(start + 1)}`, code: `${day}${turn.toUpperCase()}${slot}` });
    });
  });
  return rows;
}
