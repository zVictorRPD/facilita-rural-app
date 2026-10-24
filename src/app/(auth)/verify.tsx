import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { api } from "@/api";
import { Button, NavBar, Screen } from "@/components/ui";
import { useTheme } from "@/theme";

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useTheme();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (code.length !== 8) {
      setMessage("O código tem 8 dígitos.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api("/auth/verify-email", { method: "POST", auth: false, body: JSON.stringify({ email, code }) });
      router.replace("/(auth)/login");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await api("/auth/resend-verification", { method: "POST", auth: false, body: JSON.stringify({ email }) });
      setMessage("Enviamos um novo código.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível reenviar");
    }
  };

  return (
    <Screen>
      <NavBar title="" />
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingHorizontal: 24, paddingTop: 18 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Confirme seu e-mail</Text>
        <Text style={{ fontSize: 14, color: colors.text2, marginTop: 6, lineHeight: 21 }}>Enviamos um código de 8 dígitos para {email}. Ele vale por 1 hora.</Text>
        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 8))}
          keyboardType="number-pad"
          maxLength={8}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          style={{ marginTop: 24, height: 54, borderWidth: 1, borderColor: colors.line, borderRadius: 8, textAlign: "center", fontSize: 26, fontWeight: "600", letterSpacing: 8, color: colors.text }}
        />
        {message ? <Text style={{ color: colors.alert, marginTop: 8 }}>{message}</Text> : null}
        <Text onPress={resend} style={{ color: colors.link, marginTop: 14, marginBottom: 22 }}>Reenviar código</Text>
        <Button label="Confirmar" onPress={confirm} loading={loading} />
      </View>
    </Screen>
  );
}
