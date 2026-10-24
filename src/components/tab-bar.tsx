import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme";

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigateToTab: (routeKey: string) => void;
};

const icons = {
  index: "home",
  grade: "grade",
  horario: "clock",
  agenda: "cal",
  mais: "menu",
} as const;

export function TabBar({ state, descriptors, navigateToTab }: TabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 7, paddingBottom: Math.max(insets.bottom, 10) }}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icon = icons[route.name as keyof typeof icons] ?? "menu";
        const label = descriptors[route.key].options.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              if (!focused) navigateToTab(route.key);
            }}
            style={{ flex: 1, alignItems: "center", gap: 3 }}
          >
            <Icon name={icon} size={22} color={focused ? colors.brand : colors.muted} strokeWidth={focused ? 2 : 1.8} />
            <Text style={{ fontSize: 10, fontWeight: focused ? "600" : "500", color: focused ? colors.brand : colors.muted }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
