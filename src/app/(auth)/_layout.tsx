import { Stack } from "expo-router";
import { useTheme } from "@/theme";

export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="forgot" />
    </Stack>
  );
}
