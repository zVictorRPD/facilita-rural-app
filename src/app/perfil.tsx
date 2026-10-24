import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Avatar, Button, Field, Hairline, NavBar, Screen, Section } from "@/components/ui";
import { useSession } from "@/session";
import { useTheme } from "@/theme";

export default function ProfileScreen() {
  const { user, refreshUser, signOut } = useSession();
  const { colors } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const saveName = async () => {
    await api("/me", { method: "PATCH", body: JSON.stringify({ name }) });
    await refreshUser();
    setMessage("Nome atualizado.");
  };
  const savePassword = async () => {
    if (password !== confirm) return setMessage("As senhas não conferem.");
    await api("/me", { method: "PATCH", body: JSON.stringify({ password }) });
    setPassword("");
    setConfirm("");
    setMessage("Senha alterada.");
  };
  const photo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled) return;
    const image = await manipulateAsync(result.assets[0].uri, [{ resize: { width: 512 } }], { base64: true, format: SaveFormat.JPEG, compress: 0.7 });
    await api("/me", { method: "PATCH", body: JSON.stringify({ avatar: `data:image/jpeg;base64,${image.base64}` }) });
    await refreshUser();
  };
  const removeGrade = () => {
    Alert.alert("Excluir grade curricular", "Sua grade, o progresso e o horário serão apagados. Atividades complementares, avaliações e eventos continuam.", [
      { text: "Cancelar" },
      { text: "Excluir grade", style: "destructive", onPress: () => api("/me/curriculum", { method: "DELETE" }).then(() => router.replace("/(tabs)/grade")) },
    ]);
  };

  return (
    <Screen>
      <NavBar title="Perfil" />
      <ScrollView>
        <Section first>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16 }}>
            <Avatar uri={user?.avatar} size={60} />
            <View>
              <Text onPress={photo} style={{ color: colors.link, fontWeight: "500" }}>Alterar foto</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>JPG, até 1 MB</Text>
            </View>
          </View>
        </Section>
        <Section title="Dados">
          <View style={{ paddingHorizontal: 16 }}>
            <Field label="Nome" value={name} onChangeText={setName} />
            <Field label="E-mail" value={user?.email ?? ""} editable={false} />
            {message ? <Text style={{ color: colors.ok, marginBottom: 8 }}>{message}</Text> : null}
            <Button label="Salvar nome" variant="sec" small onPress={saveName} />
            <View style={{ height: 12 }} />
          </View>
        </Section>
        <Section title="Trocar senha">
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <Field label="Nova senha" secureTextEntry value={password} onChangeText={setPassword} />
            <Field label="Confirmar nova senha" secureTextEntry value={confirm} onChangeText={setConfirm} />
            <Button label="Trocar senha" variant="sec" small onPress={savePassword} />
          </View>
        </Section>
        <Section title="Zona de risco">
          <Hairline first onPress={removeGrade}>
            <View>
              <Text style={{ color: colors.alert, fontWeight: "500" }}>Excluir grade curricular</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Para começar de novo ou trocar de curso</Text>
            </View>
          </Hairline>
          <Hairline onPress={() => signOut().then(() => router.replace("/(auth)/login"))}>
            <Text style={{ color: colors.alert, fontWeight: "500" }}>Sair</Text>
          </Hairline>
        </Section>
      </ScrollView>
    </Screen>
  );
}
