import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider } from "@/session";
import { ThemeProvider, useTheme } from "@/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function Navigation() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="materias" />
      <Stack.Screen name="professores" />
      <Stack.Screen name="mapa" />
      <Stack.Screen name="ranking" />
      <Stack.Screen name="avisos" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="contato" />
      <Stack.Screen name="resumo" />
      <Stack.Screen name="criar-grade" />
      <Stack.Screen name="materia/[id]" />
      <Stack.Screen name="adicionar-horario" />
      <Stack.Screen name="adicionar-materia" />
      <Stack.Screen name="evento" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SessionProvider>
            <BottomSheetModalProvider>
              <Navigation />
            </BottomSheetModalProvider>
          </SessionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
