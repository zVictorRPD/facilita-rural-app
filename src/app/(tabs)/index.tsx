import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Icon } from "@/components/icon";
import { AppBar, Avatar, Empty, Hairline, LinkText, Screen, Section } from "@/components/ui";
import { COLOR_HEX } from "@/domain/timetable";
import { workloadProgress } from "@/domain/progress";
import { useSession } from "@/session";
import type { CalendarEvent, Complementary, Course, Subject } from "@/types";
import { dayGroups, headingDate, hourLabel, minutesUntil, relativeDay, shortDate, weekdayKey, weekdayLabel, type ClassBlock } from "@/ui/classes";
import type { Timetable } from "@/domain/timetable";
import { useTheme } from "@/theme";

type Dashboard = {
  hasCurriculum: boolean;
  course?: Course;
  subjects?: Subject[];
  complementary?: Complementary[];
  timetable?: Timetable | null;
  events?: CalendarEvent[];
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const query = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Dashboard>("/dashboard") });
  const data = query.data;
  const now = new Date();
  const todayKey = weekdayKey(now);
  const today = todayKey && data?.timetable ? dayGroups(data.timetable, todayKey) : [];
  const subjects = data?.subjects ?? [];
  const byId = Object.fromEntries(subjects.map((subject) => [subject.id, subject]));
  const next = findNext(data?.timetable, now);
  const nextSubject = next ? byId[next.id] : undefined;
  const doing = subjects.filter((subject) => subject.status === "doing");
  const events = (data?.events ?? []).filter((event) => new Date(event.start) >= now).slice(0, 6);
  const totals = data?.course
    ? { obrigatory: data.course.workload_normal_lessons, optional: data.course.workload_optional_lessons, complementary: data.course.workload_complementary }
    : { obrigatory: 0, optional: 0, complementary: 0 };
  const progress = workloadProgress(subjects, (data?.complementary ?? []).map((item) => item.time), false, totals);
  const goal = totals.obrigatory + totals.optional + totals.complementary;
  const percent = goal ? Math.round((progress.total / goal) * 100) : 0;
  const nowHour = now.getHours() + now.getMinutes() / 60;

  return (
    <Screen>
      <AppBar
        title="Início"
        subtitle={headingDate(now)}
        right={
          <>
            <Pressable onPress={() => router.push("/avisos")} hitSlop={8}>
              <Icon name="bell" size={21} color={colors.text2} />
            </Pressable>
            <Pressable onPress={() => router.push("/perfil")}><Avatar uri={user?.avatar} /></Pressable>
          </>
        }
      />
      <ScrollView>
        {!data?.hasCurriculum ? (
          <Section first>
            <Empty>Você ainda não tem grade.</Empty>
            <View style={{ alignItems: "center", marginTop: -12, marginBottom: 16 }}>
              <LinkText onPress={() => router.push("/(tabs)/grade")}>Criar minha grade</LinkText>
            </View>
          </Section>
        ) : (
          <>
            <Section first title="Próxima aula" action={nextSubject ? <LinkText onPress={() => router.push(`/materia/${nextSubject.id}`)}>Abrir matéria</LinkText> : undefined}>
              {next && nextSubject ? (
                <Pressable onPress={() => router.push(`/materia/${nextSubject.id}`)} style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingBottom: 12 }}>
                  <View style={{ width: 4, borderRadius: 2, backgroundColor: COLOR_HEX[next.color] }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>{nextSubject.name}</Text>
                    <Text style={{ fontSize: 13, color: colors.text2, marginTop: 3 }}>
                      {next.when}, {hourLabel(next.start)}–{hourLabel(next.end)}
                      {next.mins != null ? <Text style={{ color: colors.link, fontWeight: "600" }}>{` · ${minutesUntil(next.start, now)}`}</Text> : null}
                    </Text>
                    {nextSubject.note ? <Text style={{ fontSize: 13, color: colors.text2, marginTop: 8, lineHeight: 18 }}>{nextSubject.note}</Text> : null}
                    {nextSubject.links?.length ? (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                        {nextSubject.links.map((link) => (
                          <Text key={link.url} onPress={() => Linking.openURL(link.url)} style={{ color: colors.link, fontSize: 13 }}>{link.name}</Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ) : (
                <Empty>Sua grade horária está vazia.</Empty>
              )}
            </Section>
            <Section title={`Hoje · ${today.length} ${today.length === 1 ? "aula" : "aulas"}`} action={<LinkText onPress={() => router.push("/(tabs)/horario")}>Semana</LinkText>}>
              {today.length ? today.map((block, index) => {
                const subject = byId[block.id];
                const past = block.end <= nowHour;
                const current = block.start <= nowHour && nowHour < block.end;
                const isNext = next?.off === 0 && block.start === next.start;
                return (
                  <Hairline key={`${block.id}-${block.start}`} first={index === 0} onPress={() => subject && router.push(`/materia/${subject.id}`)}>
                    <Text style={{ width: 82, fontSize: 12, color: past ? colors.muted : colors.text2 }}>{hourLabel(block.start)}–{hourLabel(block.end)}</Text>
                    <View style={{ width: 3, alignSelf: "stretch", borderRadius: 2, backgroundColor: COLOR_HEX[block.color], opacity: past ? 0.45 : 1 }} />
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: past ? colors.muted : colors.text }} numberOfLines={1}>{subject?.name}</Text>
                    {past ? <Text style={{ fontSize: 12, color: colors.muted }}>concluída</Text> : current ? <Text style={{ fontSize: 10, fontWeight: "600", color: colors.link, letterSpacing: 0.4 }}>AGORA</Text> : isNext ? <Text style={{ fontSize: 10, fontWeight: "600", color: colors.link, letterSpacing: 0.4 }}>PRÓXIMA</Text> : null}
                  </Hairline>
                );
              }) : <Empty>Sem aulas hoje.</Empty>}
            </Section>
            <Section title="Progresso do curso" action={<LinkText onPress={() => router.push("/resumo")}>Detalhes</LinkText>}>
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                  <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{percent}%</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{progress.total} de {goal} h feitas</Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.track, flexDirection: "row", overflow: "hidden", marginVertical: 8 }}>
                  <View style={{ width: goal ? `${(progress.obrigatory / goal) * 100}%` : 0, backgroundColor: colors.brand }} />
                  <View style={{ width: goal ? `${(progress.optional / goal) * 100}%` : 0, backgroundColor: colors.doing }} />
                  <View style={{ width: goal ? `${(progress.complementary / goal) * 100}%` : 0, backgroundColor: colors.done }} />
                </View>
                {([["Obrigatória", progress.obrigatory, totals.obrigatory, colors.brand], ["Optativa", progress.optional, totals.optional, colors.doing], ["Complementar", progress.complementary, totals.complementary, colors.done]] as const).map((row) => (
                  <View key={row[0]} style={{ flexDirection: "row", paddingVertical: 3 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: row[3], marginRight: 6, marginTop: 3 }} />
                    <Text style={{ flex: 1, fontSize: 12, color: colors.text2 }}>{row[0]}</Text>
                    <Text style={{ fontSize: 12, color: colors.text2 }}>{row[1]} / {row[2]} h</Text>
                  </View>
                ))}
              </View>
            </Section>
          </>
        )}
        <Section title="Próximos eventos" action={<LinkText onPress={() => router.push("/(tabs)/agenda")}>Agenda</LinkText>}>
          {events.length ? events.map((event, index) => {
            const start = new Date(event.start);
            const soon = relativeDay(start, now);
            return (
              <Hairline key={event.id} first={index === 0} onPress={() => router.push({ pathname: "/evento", params: { id: String(event.id) } })}>
                <View style={{ width: 46 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{shortDate(start)}</Text>
                  <Text style={{ fontSize: 12, color: colors.text2 }}>{["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][start.getDay()]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }} numberOfLines={1}>{event.title}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Text>
                </View>
                <Text style={{ fontSize: 12, color: soon === "hoje" || soon === "amanhã" ? colors.alert : colors.text2, fontWeight: soon === "hoje" || soon === "amanhã" ? "600" : "400" }}>{soon}</Text>
              </Hairline>
            );
          }) : <Empty>Nenhum evento marcado.</Empty>}
        </Section>
        {data?.hasCurriculum ? (
          <Section title={`Cursando · ${doing.length} ${doing.length === 1 ? "matéria" : "matérias"}`} action={<LinkText onPress={() => router.push("/(tabs)/grade")}>Grade</LinkText>}>
            {doing.length ? doing.map((subject, index) => (
              <Hairline key={subject.id} first={index === 0} onPress={() => router.push(`/materia/${subject.id}`)}>
                <Text style={{ width: 50, fontSize: 11, fontWeight: "600", color: colors.muted }}>{subject.code}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }} numberOfLines={1}>{subject.name}{subject.isOptional ? "  OPT" : ""}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>{subject.teacher?.name ?? "Sem professor"} · {subject.time} h</Text>
                </View>
                {subject.teacher?.email ? (
                  <Pressable onPress={() => Linking.openURL(`mailto:${subject.teacher?.email}`)} hitSlop={8}>
                    <Icon name="mail" size={17} color={colors.muted} />
                  </Pressable>
                ) : null}
              </Hairline>
            )) : <Empty>Nenhuma matéria com status Cursando.</Empty>}
          </Section>
        ) : null}
        <View style={{ height: 16 }} />
      </ScrollView>
    </Screen>
  );
}

function findNext(timetable: Timetable | null | undefined, now: Date): (ClassBlock & { off: number; when: string; mins: number | null }) | null {
  if (!timetable) return null;
  const nowHour = now.getHours() + now.getMinutes() / 60;
  for (let offset = 0; offset < 8; offset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const key = weekdayKey(date);
    if (!key) continue;
    const block = dayGroups(timetable, key).find((item) => offset > 0 || item.start > nowHour);
    if (block) {
      return {
        ...block,
        off: offset,
        when: offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : weekdayLabel(key),
        mins: offset === 0 ? Math.round((block.start - nowHour) * 60) : null,
      };
    }
  }
  return null;
}
