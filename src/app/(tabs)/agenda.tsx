import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Icon } from "@/components/icon";
import { AppBar, Empty, Hairline, Screen, Section, Seg } from "@/components/ui";
import type { CalendarEvent } from "@/types";
import { relativeDay, shortDate } from "@/ui/classes";
import { useTheme } from "@/theme";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export default function AgendaScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ aba?: string }>();
  const events = useQuery({ queryKey: ["events"], queryFn: () => api<CalendarEvent[]>("/events") });
  const calendar = useQuery({ queryKey: ["academic-calendar"], queryFn: () => api<{ name: string; date: string }[]>("/academic-calendar", { auth: false }) });
  const [tab, setTab] = useState(params.aba === "academico" ? "acad" : "pessoal");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const days = useMemo(() => monthCells(cursor), [cursor]);
  const list = events.data ?? [];
  const same = (left: Date, right: Date) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
  const dayEvents = list.filter((event) => same(new Date(event.start), selected));

  return (
    <Screen>
      <AppBar
        title="Agenda"
        subtitle={tab === "pessoal" ? "Provas, entregas e compromissos" : "Datas da UFRRJ"}
        right={tab === "pessoal" ? <Pressable onPress={() => router.push({ pathname: "/evento", params: { date: selected.toISOString() } })} hitSlop={8}><Icon name="plus" size={22} color={colors.text2} /></Pressable> : undefined}
      />
      <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <Seg options={[{ id: "pessoal", label: "Pessoal" }, { id: "acad", label: "Calendário acadêmico" }]} value={tab} onChange={setTab} />
      </View>
      {tab === "acad" ? (
        <ScrollView>
          <Section first title="Datas">
            {(calendar.data ?? []).map((item, index) => {
              const date = new Date(`${item.date}T00:00:00`);
              const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86400000);
              return (
                <Hairline key={item.name} first={index === 0}>
                  <View style={{ width: 46 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{shortDate(date)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{date.toLocaleDateString("pt-BR")}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: daysLeft >= 0 && daysLeft <= 30 ? colors.alert : colors.text2, fontWeight: daysLeft >= 0 && daysLeft <= 30 ? "600" : "400" }}>{daysLeft >= 0 ? `faltam ${daysLeft} dias` : `há ${-daysLeft} dias`}</Text>
                </Hairline>
              );
            })}
          </Section>
        </ScrollView>
      ) : (
        <ScrollView>
          <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{MONTHS[cursor.getMonth()][0].toUpperCase() + MONTHS[cursor.getMonth()].slice(1)} {cursor.getFullYear()}</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><Icon name="left" color={colors.text2} /></Pressable>
              <Pressable onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><Icon name="chev" color={colors.text2} /></Pressable>
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", backgroundColor: colors.surface, paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            {WEEK.map((label, index) => <Text key={index} style={{ width: "14.28%", textAlign: "center", fontSize: 11, fontWeight: "600", color: colors.muted, paddingVertical: 4 }}>{label}</Text>)}
            {days.map((date) => {
              const outside = date.getMonth() !== cursor.getMonth();
              const marked = list.some((event) => same(new Date(event.start), date));
              const isSelected = same(date, selected);
              const isToday = same(date, new Date());
              return (
                <Pressable key={date.toISOString()} onPress={() => { setSelected(date); if (outside) setCursor(new Date(date.getFullYear(), date.getMonth(), 1)); }} style={{ width: "14.28%", height: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: isSelected ? colors.primary : "transparent" }}>
                  <Text style={{ fontSize: 13, color: isSelected ? "#fff" : outside ? colors.muted : isToday ? colors.link : colors.text, fontWeight: isToday ? "700" : "400" }}>{date.getDate()}</Text>
                  <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: marked ? (isSelected ? "#fff" : colors.muted) : "transparent" }} />
                </Pressable>
              );
            })}
          </View>
          <Section title={`${selected.getDate()} de ${MONTHS[selected.getMonth()]}`} action={<Text onPress={() => router.push({ pathname: "/evento", params: { date: selected.toISOString() } })} style={{ color: colors.link, fontSize: 12, fontWeight: "500" }}>Adicionar</Text>}>
            {dayEvents.length ? dayEvents.map((event, index) => (
              <Hairline key={event.id} first={index === 0} onPress={() => router.push({ pathname: "/evento", params: { id: String(event.id) } })}>
                <Text style={{ width: 82, fontSize: 12, color: colors.text2 }}>{new Date(event.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{event.title}</Text>
                  {event.description ? <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>{event.description}</Text> : null}
                </View>
              </Hairline>
            )) : <Empty>Nenhum evento neste dia.</Empty>}
          </Section>
          <Section title="Próximos">
            {list.filter((event) => new Date(event.start) >= new Date() && !same(new Date(event.start), selected)).slice(0, 5).map((event, index) => (
              <Hairline key={event.id} first={index === 0} onPress={() => router.push({ pathname: "/evento", params: { id: String(event.id) } })}>
                <View style={{ width: 46 }}>
                  <Text style={{ fontWeight: "600", color: colors.text, fontSize: 13 }}>{shortDate(new Date(event.start))}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: colors.text }} numberOfLines={1}>{event.title}</Text>
                <Text style={{ fontSize: 12, color: colors.text2 }}>{relativeDay(new Date(event.start))}</Text>
              </Hairline>
            ))}
          </Section>
        </ScrollView>
      )}
    </Screen>
  );
}

function monthCells(cursor: Date) {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const grid = new Date(start);
  grid.setDate(1 - start.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(grid);
    date.setDate(grid.getDate() + index);
    return date;
  });
}
