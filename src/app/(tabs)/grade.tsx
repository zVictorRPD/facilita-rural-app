import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api } from "@/api";
import { Icon } from "@/components/icon";
import { AppBar, Avatar, Empty, Hairline, Hint, Screen, Section, Sheet, SheetRow, StatusPill } from "@/components/ui";
import { defaultFilter } from "@/domain/progress";
import { useSession } from "@/session";
import type { CurriculumResponse, Subject } from "@/types";
import { useTheme } from "@/theme";

const nextStatus = { todo: "doing", doing: "done", done: "todo" } as const;

export default function GradeScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["curriculum"], queryFn: () => api<CurriculumResponse>("/curriculum") });
  const data = query.data;
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [move, setMove] = useState<Subject | null>(null);
  const [adding, setAdding] = useState(false);
  const [periodName, setPeriodName] = useState("");
  const reload = () => {
    client.invalidateQueries({ queryKey: ["curriculum"] });
    client.invalidateQueries({ queryKey: ["dashboard"] });
  };

  if (!data) {
    return <Screen><AppBar title="Grade" subtitle="Grade curricular" /><Empty>Carregando a grade...</Empty></Screen>;
  }
  if (!data.hasCurriculum) {
    return (
      <Screen>
        <AppBar title="Grade" subtitle="Grade curricular" right={<Pressable onPress={() => router.push("/perfil")}><Avatar uri={user?.avatar} /></Pressable>} />
        <Section first>
          <View style={{ paddingHorizontal: 28, paddingVertical: 40, alignItems: "center", gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>Você ainda não tem grade</Text>
            <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center", lineHeight: 19 }}>Escolha seu curso e a grade vem montada com todos os períodos, obrigatórias e optativas.</Text>
            <Pressable onPress={() => router.push("/criar-grade")} style={{ marginTop: 12, backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, height: 34, justifyContent: "center" }}>
              <Text style={{ color: colors.primaryInk, fontWeight: "600", fontSize: 13 }}>Criar minha grade</Text>
            </Pressable>
          </View>
        </Section>
      </Screen>
    );
  }

  const visible = data.periods.filter((period) => period.visible);
  const currentId = periodId && visible.some((period) => period.id === periodId) ? periodId : visible[0]?.id;
  const period = data.periods.find((item) => item.id === currentId);
  const subjects = period?.subjectIds.map((id) => data.subjects[id]).filter(Boolean) ?? [];
  const filter = data.filter ?? defaultFilter;
  const shown = subjects.filter((subject) => {
    if (subject.isOptional && !filter.optional) return false;
    if (!subject.isOptional && !filter.obligatory) return false;
    return filter[subject.status];
  });
  const filtered = !Object.values(filter).every(Boolean);
  const hours = subjects.reduce((total, subject) => total + subject.time, 0);
  const done = subjects.filter((subject) => subject.status === "done").length;
  const doing = subjects.filter((subject) => subject.status === "doing").length;

  const patch = async (path: string, body?: unknown, method = "PATCH") => {
    await api(path, { method, body: body ? JSON.stringify(body) : undefined });
    reload();
  };
  const toggleFilter = (key: keyof typeof filter) => {
    if (!data.hasCurriculum) return;
    const next = { ...filter, [key]: !filter[key] };
    client.setQueryData(["curriculum"], { ...data, filter: next });
    api("/curriculum/filter", { method: "PATCH", body: JSON.stringify(next) }).catch(() => {
      client.setQueryData(["curriculum"], data);
    });
  };

  return (
    <Screen>
      <AppBar
        title="Grade"
        subtitle={`${data.course.name} · grade ${data.course.period_emergence}`}
        right={
          <>
            <Pressable onPress={() => setFilterOpen(true)} hitSlop={8}><Icon name="filter" size={21} color={filtered ? colors.link : colors.text2} /></Pressable>
            <Pressable onPress={() => router.push("/resumo")} hitSlop={8}><Icon name="info" size={21} color={colors.text2} /></Pressable>
          </>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line, flexGrow: 0 }}>
        {visible.map((item) => {
          const on = item.id === currentId;
          return (
            <Pressable key={item.id} onPress={() => setPeriodId(item.id)} style={{ paddingHorizontal: 10, paddingTop: 11, paddingBottom: 9, borderBottomWidth: 2, borderBottomColor: on ? colors.brand : "transparent" }}>
              <Text style={{ fontSize: 13, fontWeight: on ? "600" : "500", color: on ? colors.text : colors.muted }}>{item.name.replace(" período", "")}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setAdding(true)} style={{ paddingHorizontal: 10, justifyContent: "center" }}>
          <Text style={{ color: colors.link, fontSize: 13, fontWeight: "500" }}>+ Período</Text>
        </Pressable>
      </ScrollView>
      <ScrollView>
        {period ? (
          <Section first>
            <Hairline first>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{period.name}</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{subjects.length} matérias · {hours} h · {done} aprovadas · {doing} cursando</Text>
              </View>
              <Pressable onPress={() => setPeriodOpen(true)} hitSlop={8}><Icon name="more" size={22} color={colors.muted} strokeWidth={2.4} /></Pressable>
            </Hairline>
            {shown.map((subject) => (
              <Hairline key={subject.id} onPress={() => router.push(`/materia/${subject.id}`)} onLongPress={() => setMove(subject)}>
                <Text style={{ width: 50, fontSize: 11, fontWeight: "600", color: colors.muted }}>{subject.code}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }} numberOfLines={1}>
                    {subject.name}{subject.isOptional && period.name !== "Optativas" ? "  OPT" : ""}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>{subject.time} h · {subject.teacher?.name ?? "Sem professor"}{subject.grade != null ? ` · nota ${subject.grade.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}` : ""}</Text>
                </View>
                <StatusPill status={subject.status} onPress={() => patch(`/curriculum/subjects/${subject.id}`, { status: nextStatus[subject.status] })} />
              </Hairline>
            ))}
            {!shown.length ? <Empty>{subjects.length ? "Todas as matérias deste período estão ocultas pelo filtro." : "Nenhuma matéria neste período."}</Empty> : null}
            <Hairline onPress={() => router.push({ pathname: "/adicionar-materia", params: { periodId: period.id } })}>
              <Icon name="plus" size={18} color={colors.link} />
              <Text style={{ color: colors.link, fontSize: 14, fontWeight: "500" }}>Adicionar matéria</Text>
            </Hairline>
          </Section>
        ) : <Empty>Todos os períodos estão ocultos. Reexiba em Resumo do curso.</Empty>}
        <Hint>Toque no status para trocar. Segure a matéria para movê-la de período.</Hint>
        <View style={{ height: 16 }} />
      </ScrollView>
      <Sheet visible={adding} title="Novo período" onClose={() => setAdding(false)}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
          <TextInput value={periodName} onChangeText={setPeriodName} placeholder="Nome do período" placeholderTextColor={colors.muted} style={{ height: 40, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 11, color: colors.text }} />
          <Pressable onPress={() => { if (periodName.trim()) patch("/curriculum/periods", { name: periodName.trim() }, "POST"); setPeriodName(""); setAdding(false); }} style={{ height: 44, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.primaryInk, fontWeight: "600" }}>Adicionar</Text>
          </Pressable>
        </View>
      </Sheet>
      <Sheet visible={filterOpen} title="Exibir matérias" onClose={() => setFilterOpen(false)}>
        {([["obligatory", "Obrigatórias"], ["optional", "Optativas"], ["todo", "Pendentes"], ["doing", "Cursando"], ["done", "Aprovadas"]] as const).map(([key, label]) => (
          <SheetRow key={key} label={`${label}${filter[key] ? "" : " · oculto"}`} selected={filter[key]} onPress={() => toggleFilter(key)} />
        ))}
      </Sheet>
      <Sheet visible={periodOpen} title={period?.name ?? "Período"} onClose={() => setPeriodOpen(false)}>
        <SheetRow label="Marcar como aprovado" onPress={() => { setPeriodOpen(false); period && patch(`/curriculum/periods/${period.id}/status`, { status: "done" }); }} />
        <SheetRow label={period?.visible ? "Ocultar período" : "Mostrar período"} onPress={() => { setPeriodOpen(false); period && patch(`/curriculum/periods/${period.id}/visibility`, { visible: !period.visible }); }} />
        <SheetRow label="Excluir período" danger onPress={() => {
          setPeriodOpen(false);
          if (!period) return;
          Alert.alert("Excluir período", "As matérias desta coluna também saem.", [
            { text: "Cancelar" },
            { text: "Excluir", style: "destructive", onPress: () => patch(`/curriculum/periods/${period.id}`, undefined, "DELETE") },
          ]);
        }} />
      </Sheet>
      <Sheet visible={Boolean(move)} title="Mover para" onClose={() => setMove(null)}>
        {data.periods.map((item) => (
          <SheetRow key={item.id} label={item.name} selected={item.id === move?.periodId} onPress={() => {
            if (move && item.id !== move.periodId) patch(`/curriculum/subjects/${move.id}/period`, { periodId: Number(item.id) });
            setMove(null);
          }} />
        ))}
      </Sheet>
    </Screen>
  );
}
