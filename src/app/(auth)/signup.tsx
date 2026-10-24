import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { api } from "@/api";
import { Avatar, Button, Field, NavBar, Screen } from "@/components/ui";
import { useTheme } from "@/theme";

export default function SignupScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Precisamos da permissão da galeria para a foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled) return;
    const image = await manipulateAsync(result.assets[0].uri, [{ resize: { width: 512 } }], { compress: 0.7, format: SaveFormat.JPEG, base64: true });
    setAvatar(`data:image/jpeg;base64,${image.base64}`);
  };

  const submit = async () => {
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api("/auth/signup", { method: "POST", auth: false, body: JSON.stringify({ name, email, password, avatar }) });
      router.replace({ pathname: "/(auth)/verify", params: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <NavBar title="" back="Entrar" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.surface }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Criar conta</Text>
          <Text style={{ fontSize: 14, color: colors.text2, marginTop: 6 }}>Leva menos de um minuto.</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginVertical: 18 }}>
            <Avatar uri={avatar} size={56} />
            <Text onPress={pickPhoto} style={{ color: colors.link, fontSize: 14, fontWeight: "500" }}>Adicionar foto</Text>
            <Text style={{ marginLeft: "auto", color: colors.muted, fontSize: 12 }}>opcional</Text>
          </View>
          <Field label="Nome" value={name} onChangeText={setName} placeholder="Como quer ser chamado" />
          <Field label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field label="Senha" secureTextEntry value={password} onChangeText={setPassword} />
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: -2 }}>Mínimo de 8 caracteres.</Text>
          <Field label="Confirmar senha" secureTextEntry value={confirm} onChangeText={setConfirm} />
          {error ? <Text style={{ color: colors.alert, marginTop: 8 }}>{error}</Text> : null}
          <View style={{ marginTop: 16 }}><Button label="Criar conta" onPress={submit} loading={loading} /></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
