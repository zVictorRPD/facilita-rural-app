import { Tabs } from "expo-router";
import { TabBar } from "@/components/tab-bar";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="grade" options={{ title: "Grade" }} />
      <Tabs.Screen name="horario" options={{ title: "Horário" }} />
      <Tabs.Screen name="agenda" options={{ title: "Agenda" }} />
      <Tabs.Screen name="mais" options={{ title: "Mais" }} />
    </Tabs>
  );
}
