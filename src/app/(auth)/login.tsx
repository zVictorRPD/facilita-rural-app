import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { ApiError, api, saveSession } from "@/api";
import { Icon } from "@/components/icon";
import { Button, Field, Logo, Screen } from "@/components/ui";
import { useSession } from "@/session";
import { useTheme } from "@/theme";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ accessToken: string; refreshToken: string; user: Parameters<typeof setUser>[0] }>(
        "/auth/login",
        { method: "POST", auth: false, body: JSON.stringify({ email, password }) },
      );
      await saveSession(data.accessToken, data.refreshToken);
      setUser(data.user);
      router.replace("/(tabs)");
    } catch (err) {
      const failure = err as ApiError;
      setError(failure.message);
      if (failure.type === "emailVerified") router.push({ pathname: "/(auth)/verify", params: { email } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.surface }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <Logo />
          <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.4, color: colors.text, marginTop: 34 }}>Entrar</Text>
          <Text style={{ fontSize: 14, color: colors.text2, marginTop: 6 }}>Use a mesma conta do site.</Text>
          <View style={{ marginTop: 20 }}>
            <Field label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <View>
              <Field label="Senha" secureTextEntry={hidden} value={password} onChangeText={setPassword} />
              <Pressable onPress={() => setHidden((value) => !value)} style={{ position: "absolute", right: 10, bottom: 16 }} hitSlop={8}>
                <Icon name="eye" color={colors.muted} size={18} />
              </Pressable>
            </View>
          </View>
          <Text onPress={() => router.push("/(auth)/forgot")} style={{ color: colors.link, fontSize: 13, textAlign: "right", marginBottom: 18 }}>Esqueci minha senha</Text>
          {error ? <Text style={{ color: colors.alert, fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}
          <Button label="Entrar" onPress={submit} loading={loading} />
          <View style={{ flex: 1, minHeight: 40 }} />
          <Text style={{ textAlign: "center", color: colors.text2, fontSize: 13 }}>
            Não tem conta? <Text onPress={() => router.push("/(auth)/signup")} style={{ color: colors.link, fontWeight: "600" }}>Criar conta</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
