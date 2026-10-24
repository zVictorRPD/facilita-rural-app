import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { api } from "@/api";
import { Button, Field, NavBar, Screen } from "@/components/ui";
import { useTheme } from "@/theme";

export default function ForgotScreen() {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setMessage("");
    try {
      await api("/auth/forgot-password", { method: "POST", auth: false, body: JSON.stringify({ email }) });
      setStep(2);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível enviar");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (password !== confirm) {
      setMessage("As senhas não conferem.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api("/auth/reset-password", { method: "POST", auth: false, body: JSON.stringify({ email, code, password }) });
      router.replace("/(auth)/login");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível alterar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <NavBar title="" back={step === 1 ? "Entrar" : "Voltar"} onBack={() => (step === 1 ? router.back() : setStep(step - 1))} />
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingHorizontal: 24, paddingTop: 18 }}>
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 22 }}>
          {[1, 2, 3].map((item) => <View key={item} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: item <= step ? colors.primary : colors.track }} />)}
        </View>
        {step === 1 ? (
          <>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Recuperar senha</Text>
            <Text style={{ fontSize: 14, color: colors.text2, marginTop: 6 }}>Informe o e-mail da conta. Vamos enviar um código de 8 dígitos.</Text>
            <Field label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <View style={{ marginTop: 14 }}><Button label="Enviar código" onPress={send} loading={loading} /></View>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Digite o código</Text>
            <Text style={{ fontSize: 14, color: colors.text2, marginTop: 6 }}>Enviado para {email}. Vale por 1 hora.</Text>
            <TextInput value={code} onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 8))} keyboardType="number-pad" maxLength={8} style={{ marginTop: 22, height: 54, borderWidth: 1, borderColor: colors.line, borderRadius: 8, textAlign: "center", fontSize: 26, fontWeight: "600", letterSpacing: 8, color: colors.text }} />
            <View style={{ marginTop: 22 }}><Button label="Continuar" onPress={() => (code.length === 8 ? setStep(3) : setMessage("O código tem 8 dígitos."))} /></View>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Nova senha</Text>
            <Text style={{ fontSize: 14, color: colors.text2, marginTop: 6 }}>Mínimo de 8 caracteres.</Text>
            <Field label="Nova senha" secureTextEntry value={password} onChangeText={setPassword} />
            <Field label="Confirmar nova senha" secureTextEntry value={confirm} onChangeText={setConfirm} />
            <View style={{ marginTop: 14 }}><Button label="Salvar senha" onPress={save} loading={loading} /></View>
          </>
        ) : null}
        {message ? <Text style={{ color: colors.alert, marginTop: 12 }}>{message}</Text> : null}
      </View>
    </Screen>
  );
}
