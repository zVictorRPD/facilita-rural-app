import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { Icon } from "@/components/icon";
import { Button, Logo, Screen } from "@/components/ui";
import { useTheme, type Palette } from "@/theme";

const slides = [
  {
    title: "Sua grade pronta",
    text: "Escolha o curso e a grade vem montada com todos os períodos, obrigatórias e optativas. Marque o que já fez e acompanhe o progresso.",
  },
  {
    title: "O horário do SIGAA, traduzido",
    text: "Cole o código (ex.: 246M12) e a semana aparece organizada, com a próxima aula sempre à vista.",
  },
  {
    title: "Provas, entregas e o campus",
    text: "Agenda pessoal, calendário acadêmico, professores e o mapa da Rural no mesmo lugar.",
  },
];

const subjects = [
  ["IM887", "Banco de Dados II", "doing"],
  ["IM882", "Redes", "doing"],
  ["IM880", "Eng. de Software", "done"],
  ["IM504", "Gestão de Projetos", "todo"],
  ["IM505", "Sist. Distribuídos", "todo"],
] as const;

const periods = ["3º", "4º", "5º", "6º", "7º", "8º"];
const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const turns = [
  { id: "m", start: 7 },
  { id: "t", start: 12 },
  { id: "n", start: 17 },
];
const filled = new Set(["2-m-1", "2-m-2", "4-m-1", "4-m-2", "6-m-1", "6-m-2"]);
const other = new Set(["3-t-3", "3-t-4", "5-t-3", "5-t-4"]);
const monthDays = [25, 26, 27, 28, 29, 30, 31];
const markedDays = new Set([26, 28]);
const events = [
  ["28/10", "qua", "Prova 2 — Redes", "14:00–16:00", "em 2 dias", true],
  ["03/11", "ter", "Entrega — BD II", "até 23:59", "em 8 dias", false],
  ["10/11", "ter", "Seminário de ES", "08:00–10:00", "em 15 dias", false],
] as const;

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const finish = async () => {
    await AsyncStorage.setItem("facilita.onboard", "1");
    router.replace("/(auth)/login");
  };
  return (
    <Screen padded>
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 }}>
        <Logo />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 18 }} showsVerticalScrollIndicator={false}>
          <View style={{ backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 12, gap: 10 }}>
            {index === 0 ? <GradeArt colors={colors} /> : null}
            {index === 1 ? <TimetableArt colors={colors} /> : null}
            {index === 2 ? <AgendaArt colors={colors} /> : null}
          </View>
        </ScrollView>
        <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.4, color: colors.text }}>{slide.title}</Text>
        <Text style={{ fontSize: 15, color: colors.text2, lineHeight: 22, marginTop: 10 }}>{slide.text}</Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 20, marginBottom: 16 }}>
          {slides.map((item, dot) => (
            <View key={item.title} style={{ width: dot === index ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: dot === index ? colors.primary : colors.line }} />
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text onPress={finish} style={{ color: colors.muted, fontSize: 14, fontWeight: "500" }}>Pular</Text>
          <Button small label={index < slides.length - 1 ? "Próximo" : "Começar"} onPress={() => (index < slides.length - 1 ? setIndex(index + 1) : finish())} />
        </View>
      </View>
    </Screen>
  );
}

function Panel({ children, colors }: { children: ReactNode; colors: Palette }) {
  return <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 10, overflow: "hidden" }}>{children}</View>;
}

function GradeArt({ colors }: { colors: Palette }) {
  return (
    <>
      <Panel colors={colors}>
        <View style={{ flexDirection: "row", paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.line }}>
          {periods.map((period) => {
            const on = period === "5º";
            return (
              <Text key={period} style={{ fontSize: 12, fontWeight: on ? "600" : "500", color: on ? colors.text : colors.muted, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 7, borderBottomWidth: 2, borderBottomColor: on ? colors.brand : "transparent" }}>{period}</Text>
            );
          })}
        </View>
        {subjects.map(([code, name, status], row) => (
          <View key={code} style={{ minHeight: 38, paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: row ? 1 : 0, borderTopColor: colors.line }}>
            <Text style={{ width: 44, fontSize: 10.5, fontWeight: "600", color: colors.muted }}>{code}</Text>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "500", color: colors.text }} numberOfLines={1}>{name}</Text>
            <Status status={status} colors={colors} />
          </View>
        ))}
      </Panel>
      <Panel colors={colors}>
        <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontSize: 12, color: colors.muted }}><Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, letterSpacing: -0.3 }}>48%</Text> do curso</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>1.440 de 3.000 h</Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.track, flexDirection: "row", overflow: "hidden", marginTop: 7 }}>
            <View style={{ width: "46%", backgroundColor: colors.brand }} />
            <View style={{ width: "2%", backgroundColor: colors.done }} />
          </View>
        </View>
      </Panel>
    </>
  );
}

function Status({ status, colors }: { status: "todo" | "doing" | "done"; colors: Palette }) {
  const label = status === "todo" ? "Pendente" : status === "doing" ? "Cursando" : "Aprovado";
  const dot = status === "todo" ? colors.todo : status === "doing" ? colors.doing : colors.done;
  return (
    <View style={{ width: 74, flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} />
      <Text style={{ fontSize: 11, fontWeight: "500", color: status === "todo" ? colors.muted : colors.text2 }}>{label}</Text>
    </View>
  );
}

function TimetableArt({ colors }: { colors: Palette }) {
  return (
    <>
      <Panel colors={colors}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>Código</Text>
          <View style={{ flex: 1, height: 36, borderWidth: 1, borderColor: colors.link, borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", letterSpacing: 1, color: colors.text }}>246M12</Text>
            <View style={{ width: 1.5, height: 18, backgroundColor: colors.link, marginLeft: 2 }} />
          </View>
        </View>
      </Panel>
      <View style={{ alignItems: "center", marginVertical: -2 }}>
        <View style={{ transform: [{ rotate: "90deg" }] }}>
          <Icon name="chev" size={18} color={colors.muted} />
        </View>
      </View>
      <Panel colors={colors}>
        <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", gap: 2 }}>
            <View style={{ width: 26 }} />
            {weekDays.map((day) => <Text key={day} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: "600", color: colors.muted }}>{day}</Text>)}
          </View>
          {turns.map((turn, turnIndex) => (
            <View key={turn.id}>
              {turnIndex ? <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 2 }} /> : null}
              {[1, 2, 3, 4, 5].map((slot) => (
                <View key={slot} style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>
                  <Text style={{ width: 26, textAlign: "right", paddingRight: 4, fontSize: 9, color: colors.muted, lineHeight: 9 }}>{String(turn.start + slot - 1).padStart(2, "0")}h</Text>
                  {weekDays.map((day, dayIndex) => {
                    const key = `${dayIndex + 2}-${turn.id}-${slot}`;
                    const on = filled.has(key);
                    const faded = other.has(key);
                    return <View key={day} style={{ flex: 1, height: 9, borderRadius: 2, backgroundColor: on ? colors.doing : faded ? colors.muted : colors.track, opacity: faded ? 0.45 : 1 }} />;
                  })}
                </View>
              ))}
            </View>
          ))}
          <Text style={{ fontSize: 12, fontWeight: "600", color: colors.ok, marginTop: 8 }}>Seg, Qua, Sex · 07:00–09:00</Text>
        </View>
      </Panel>
    </>
  );
}

function AgendaArt({ colors }: { colors: Palette }) {
  const letters = ["D", "S", "T", "Q", "Q", "S", "S"];
  return (
    <>
      <Panel colors={colors}>
        <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingTop: 8 }}>
          {letters.map((letter, letterIndex) => (
            <Text key={letterIndex} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: "600", color: colors.muted }}>{letter}</Text>
          ))}
        </View>
        <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingBottom: 6 }}>
          {monthDays.map((day) => {
            const selected = day === 28;
            return (
              <View key={day} style={{ flex: 1, alignItems: "center", paddingVertical: 5, borderRadius: 7, backgroundColor: selected ? colors.primary : "transparent" }}>
                <Text style={{ fontSize: 13, color: selected ? "#fff" : colors.text }}>{day}</Text>
                <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: markedDays.has(day) ? (selected ? "#fff" : colors.muted) : "transparent" }} />
              </View>
            );
          })}
        </View>
      </Panel>
      <Panel colors={colors}>
        {events.map(([date, weekday, title, time, when, soon], row) => (
          <View key={title} style={{ minHeight: 38, paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: row ? 1 : 0, borderTopColor: colors.line }}>
            <View style={{ width: 46 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{date}</Text>
              <Text style={{ fontSize: 12, color: colors.text2 }}>{weekday}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }} numberOfLines={1}>{title}</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>{time}</Text>
            </View>
            <Text style={{ fontSize: 12, color: soon ? colors.alert : colors.text2, fontWeight: soon ? "600" : "400" }}>{when}</Text>
          </View>
        ))}
      </Panel>
      <Panel colors={colors}>
        <View style={{ minHeight: 38, paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Icon name="pin" size={18} color={colors.alert} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>PAT</Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>Pavilhão de Aulas Teóricas</Text>
          </View>
          <Icon name="nav" size={17} color={colors.link} />
        </View>
      </Panel>
    </>
  );
}
