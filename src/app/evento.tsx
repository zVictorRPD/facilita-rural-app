import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { api } from "@/api";
import { Button, Field, NavBar, Screen } from "@/components/ui";
import type { CalendarEvent } from "@/types";
import { useTheme } from "@/theme";

export default function EventScreen() {
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const { colors } = useTheme();
  const client = useQueryClient();
  const events = useQuery({ queryKey: ["events"], queryFn: () => api<CalendarEvent[]>("/events") });
  const current = events.data?.find((event) => String(event.id) === id);
  const base = current ? new Date(current.start) : date ? new Date(date) : new Date();
  const [title, setTitle] = useState(current?.title ?? "");
  const [description, setDescription] = useState(current?.description ?? "");
  const [day, setDay] = useState(base.toISOString().slice(0, 10));
  const [start, setStart] = useState(current ? timeOf(current.start) : "14:00");
  const [end, setEnd] = useState(current ? timeOf(current.end) : "16:00");
  const [error, setError] = useState("");

  const save = async () => {
    const startDate = new Date(`${day}T${start}:00`);
    const endDate = new Date(`${day}T${end}:00`);
    if (!title.trim()) return setError("Dê um título ao evento.");
    if (endDate <= startDate) return setError("O fim precisa ser depois do início.");
    const body = JSON.stringify({ title, description, start: startDate.toISOString(), end: endDate.toISOString() });
    if (current) await api(`/events/${current.id}`, { method: "PATCH", body });
    else await api("/events", { method: "POST", body });
    client.invalidateQueries({ queryKey: ["events"] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
    router.back();
  };

  return (
    <Screen>
      <NavBar title={current ? "Editar evento" : "Novo evento"} back="Cancelar" />
      <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Field label="Título" value={title} onChangeText={setTitle} placeholder="Ex.: Prova 2 — Redes" error={error} />
        <Field label="Dia" value={day} onChangeText={setDay} placeholder="AAAA-MM-DD" />
        <Field label="Início" value={start} onChangeText={setStart} placeholder="14:00" />
        <Field label="Fim" value={end} onChangeText={setEnd} placeholder="16:00" />
        <Field label="Descrição" value={description} onChangeText={setDescription} multiline placeholder="Opcional" />
        {current ? (
          <View style={{ marginTop: 8 }}>
            <Button label="Excluir evento" variant="danger" onPress={() => api(`/events/${current.id}`, { method: "DELETE" }).then(() => { client.invalidateQueries({ queryKey: ["events"] }); router.back(); })} />
          </View>
        ) : null}
      </ScrollView>
      <View style={{ padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Button label={current ? "Salvar" : "Adicionar"} onPress={save} />
      </View>
    </Screen>
  );
}

function timeOf(value: string) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
