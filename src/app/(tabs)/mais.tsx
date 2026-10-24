import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Icon } from "@/components/icon";
import { AppBar, Avatar, Hairline, Screen, Section } from "@/components/ui";
import { useSession } from "@/session";
import { useTheme } from "@/theme";

const university = [
  ["book", "Matérias", "/materias"],
  ["user", "Professores", "/professores"],
  ["pin", "Mapa do campus", "/mapa"],
  ["trophy", "Ranking de cursos", "/ranking"],
] as const;

export default function MoreScreen() {
  const { colors, mode, setMode } = useTheme();
  const { user, signOut } = useSession();
  const leave = () => {
    Alert.alert("Sair", "Sair da sua conta neste aparelho?", [
      { text: "Cancelar" },
      { text: "Sair", onPress: () => signOut().then(() => router.replace("/(auth)/login")) },
    ]);
  };
  return (
    <Screen>
      <AppBar title="Mais" />
      <ScrollView>
        <Section first>
          <Hairline first onPress={() => router.push("/perfil")}>
            <Avatar uri={user?.avatar} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{user?.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{user?.email}</Text>
            </View>
            <Icon name="chev" size={18} color={colors.muted} />
          </Hairline>
        </Section>
        <Section title="Universidade">
          {university.map(([icon, label, href], index) => (
            <Hairline key={href} first={index === 0} onPress={() => router.push(href)}>
              <Icon name={icon} size={20} color={colors.text2} />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text }}>{label}</Text>
              <Icon name="chev" size={18} color={colors.muted} />
            </Hairline>
          ))}
          <Hairline onPress={() => router.push({ pathname: "/(tabs)/agenda", params: { aba: "academico" } })}>
            <Icon name="calacad" size={20} color={colors.text2} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text }}>Calendário acadêmico</Text>
            <Icon name="chev" size={18} color={colors.muted} />
          </Hairline>
        </Section>
        <Section title="App">
          <Hairline first onPress={() => router.push("/avisos")}>
            <Icon name="news" size={20} color={colors.text2} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text }}>Novidades</Text>
            <Icon name="chev" size={18} color={colors.muted} />
          </Hairline>
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
            <Icon name={mode === "dark" ? "moon" : "sun"} size={20} color={colors.text2} />
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>Aparência</Text>
            <View style={{ marginLeft: "auto", flexDirection: "row", borderWidth: 1, borderColor: colors.line, borderRadius: 8, overflow: "hidden" }}>
              {(["light", "dark", "system"] as const).map((item) => (
                <Pressable key={item} onPress={() => setMode(item)} style={{ paddingHorizontal: 8, paddingVertical: 5, backgroundColor: mode === item ? colors.track : "transparent" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: mode === item ? colors.text : colors.muted }}>{item === "light" ? "Claro" : item === "dark" ? "Escuro" : "Sistema"}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Hairline onPress={() => router.push("/contato")}>
            <Icon name="chat" size={20} color={colors.text2} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text }}>Contato</Text>
            <Icon name="chev" size={18} color={colors.muted} />
          </Hairline>
        </Section>
        <Section>
          <Hairline first onPress={leave}>
            <Icon name="logout" size={20} color={colors.alert} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.alert }}>Sair</Text>
          </Hairline>
        </Section>
        <Text style={{ textAlign: "center", color: colors.muted, fontSize: 12, padding: 16 }}>Facilita Rural</Text>
      </ScrollView>
    </Screen>
  );
}
