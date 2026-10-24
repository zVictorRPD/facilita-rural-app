import { Linking, Text, View } from "react-native";
import { Icon } from "@/components/icon";
import { Hairline, Hint, NavBar, Screen, Section } from "@/components/ui";
import { useTheme } from "@/theme";

export default function ContactScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <NavBar title="Contato" back="Mais" />
      <Section first>
        <Text style={{ paddingHorizontal: 16, paddingVertical: 12, color: colors.text2, lineHeight: 21 }}>Dúvidas, sugestões ou problemas? Fale com o desenvolvedor do Facilita Rural.</Text>
      </Section>
      <Section title="Canais">
        <Hairline first onPress={() => Linking.openURL("mailto:victor2007azevedo@hotmail.com")}>
          <Icon name="mail" color={colors.text2} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "500", color: colors.text }}>E-mail</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Resposta em até 2 dias úteis</Text>
          </View>
          <Icon name="chev" size={18} color={colors.muted} />
        </Hairline>
        <Hairline onPress={() => Linking.openURL("https://www.instagram.com/zvictor_rpd/")}>
          <Icon name="image" color={colors.text2} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "500", color: colors.text }}>Instagram</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Novidades do projeto</Text>
          </View>
          <Icon name="chev" size={18} color={colors.muted} />
        </Hairline>
      </Section>
      <Hint>Facilita Rural · UFRRJ</Hint>
    </Screen>
  );
}
