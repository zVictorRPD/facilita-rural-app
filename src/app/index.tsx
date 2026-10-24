import { useSession } from "@/session";
import { useTheme } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Gate() {
  const { user, ready } = useSession();
  const { colors } = useTheme();
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("facilita.onboard").then((value) => setSeen(value === "1"));
  }, []);

  if (!ready || seen === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  if (!user && !seen) return <Redirect href="/(auth)/onboarding" />;
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
