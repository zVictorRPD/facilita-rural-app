import { Image } from "expo-image";
import { router } from "expo-router";
import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme";

export function Screen({ children, padded = false }: { children: ReactNode; padded?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: padded ? insets.bottom : 0 }}>
      {children}
    </View>
  );
}

export function AppBar({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "500" }} numberOfLines={1}>{subtitle}</Text> : null}
        <Text style={{ fontSize: 22, fontWeight: "700", letterSpacing: -0.3, color: colors.text, marginTop: subtitle ? 1 : 0 }}>{title}</Text>
      </View>
      {right ? <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>{right}</View> : null}
    </View>
  );
}

export function NavBar({ title, back = "Voltar", onBack, right }: { title: string; back?: string; onBack?: () => void; right?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ height: 46, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 }}>
      <Pressable onPress={onBack ?? (() => router.back())} style={{ flex: 1, flexDirection: "row", alignItems: "center" }} hitSlop={8}>
        <Icon name="back" color={colors.link} size={22} />
        <Text style={{ color: colors.link, fontSize: 15 }} numberOfLines={1}>{back}</Text>
      </Pressable>
      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, maxWidth: 180 }} numberOfLines={1}>{title}</Text>
      <View style={{ flex: 1, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

export function Section({ title, action, children, first = false }: { title?: string; action?: ReactNode; children: ReactNode; first?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface, marginTop: first ? 0 : 10, borderTopWidth: first ? 0 : 1, borderBottomWidth: 1, borderColor: colors.line }}>
      {title || action ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 0.7, color: colors.muted, textTransform: "uppercase" }}>{title}</Text>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Hairline({ children, onPress, onLongPress, first, style }: { children: ReactNode; onPress?: () => void; onLongPress?: () => void; first?: boolean; style?: object }) {
  const { colors } = useTheme();
  const body = (
    <View style={[{ minHeight: 44, paddingHorizontal: 16, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: first ? 0 : 1, borderTopColor: colors.line }, style]}>
      {children}
    </View>
  );
  if (!onPress && !onLongPress) return <View style={{ marginTop: -1 }}>{body}</View>;
  return <Pressable onPress={onPress} onLongPress={onLongPress} style={{ marginTop: -1 }}>{body}</Pressable>;
}

export function LinkText({ children, onPress }: { children: string; onPress: () => void }) {
  const { colors } = useTheme();
  return <Text onPress={onPress} style={{ color: colors.link, fontSize: 12, fontWeight: "500" }}>{children}</Text>;
}

export function Muted({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>{children}</Text>;
}

export function Hint({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 17, paddingHorizontal: 16, paddingTop: 8 }}>{children}</Text>;
}

export function Empty({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center", paddingHorizontal: 24, paddingVertical: 22 }}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  loading,
  variant = "solid",
  small,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "solid" | "sec" | "danger";
  small?: boolean;
}) {
  const { colors } = useTheme();
  const background = variant === "solid" ? colors.primary : variant === "danger" ? colors.alert : colors.surface;
  const color = variant === "sec" ? colors.text : colors.primaryInk;
  const border = variant === "sec" ? colors.line : background;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={{ height: small ? 34 : 44, borderRadius: 8, backgroundColor: background, borderWidth: 1, borderColor: border, alignItems: "center", justifyContent: "center", paddingHorizontal: small ? 14 : 16, alignSelf: small ? "flex-start" : "stretch", opacity: loading ? 0.6 : 1 }}
    >
      {loading ? <ActivityIndicator color={color} /> : <Text style={{ color, fontSize: small ? 13 : 15, fontWeight: "600" }}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 7, gap: 5 }}>
      <Text style={{ fontSize: 12, fontWeight: "500", color: colors.text2 }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={{ height: props.multiline ? undefined : 40, minHeight: props.multiline ? 96 : undefined, borderWidth: 1, borderColor: error ? colors.alert : colors.line, borderRadius: 8, paddingHorizontal: 11, paddingVertical: props.multiline ? 10 : 0, color: colors.text, backgroundColor: colors.surface, fontSize: 14 }}
        {...props}
      />
      {error ? <Text style={{ color: colors.alert, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}

export function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ height: 36, borderRadius: 8, backgroundColor: colors.track, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon name="search" size={16} color={colors.muted} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, fontSize: 14, paddingVertical: 0 }} />
    </View>
  );
}

export function Seg({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", borderWidth: 1, borderColor: colors.line, borderRadius: 8, overflow: "hidden", backgroundColor: colors.surface }}>
      {options.map((option, index) => {
        const on = option.id === value;
        return (
          <Pressable key={option.id} onPress={() => onChange(option.id)} style={{ flex: 1, paddingVertical: 7, alignItems: "center", backgroundColor: on ? colors.track : "transparent", borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.line }}>
            <Text style={{ fontSize: 13, fontWeight: on ? "600" : "500", color: on ? colors.text : colors.text2 }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StatusPill({ status, onPress }: { status: "todo" | "doing" | "done"; onPress?: () => void }) {
  const { colors } = useTheme();
  const label = status === "todo" ? "Pendente" : status === "doing" ? "Cursando" : "Aprovado";
  const dot = status === "todo" ? colors.todo : status === "doing" ? colors.doing : colors.done;
  return (
    <Pressable onPress={onPress} style={{ width: 92, flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.line, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.surface }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} />
      <Text style={{ fontSize: 12, fontWeight: "500", color: status === "todo" ? colors.muted : colors.text2 }}>{label}</Text>
    </Pressable>
  );
}

export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: colors.overlay }} />
      <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 14, borderTopRightRadius: 14, maxHeight: "82%", paddingBottom: insets.bottom + 12 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: "center", marginTop: 8 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8}><Icon name="x" color={colors.text2} size={18} /></Pressable>
        </View>
        <ScrollView>{children}</ScrollView>
      </View>
    </Modal>
  );
}

export function SheetRow({ label, onPress, danger, selected }: { label: string; onPress: () => void; danger?: boolean; selected?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ minHeight: 48, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.line, marginTop: -1 }}>
      <Text style={{ flex: 1, fontSize: 15, color: danger ? colors.alert : colors.text }}>{label}</Text>
      {selected ? <Icon name="check" color={colors.link} size={18} strokeWidth={2.2} /> : null}
    </Pressable>
  );
}

export function Avatar({ uri, size = 30 }: { uri?: string | null; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", backgroundColor: colors.track, alignItems: "center", justifyContent: "center" }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" /> : <Icon name="user" color={colors.muted} size={size - 6} />}
    </View>
  );
}

export function Logo() {
  const { dark } = useTheme();
  return (
    <Image
      source={dark ? require("../../assets/images/white-logo.png") : require("../../assets/images/logo.png")}
      style={{ width: 196, height: 34 }}
      contentFit="contain"
      contentPosition="left"
    />
  );
}
