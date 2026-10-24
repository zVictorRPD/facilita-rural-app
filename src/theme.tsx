import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

const palette = {
  light: {
    bg: "#F4F5F7",
    surface: "#FFFFFF",
    surface2: "#F7F8FA",
    text: "#171923",
    text2: "#4A5568",
    muted: "#8A94A6",
    line: "#E6E8EC",
    track: "#EDF0F3",
    brand: "#2A4365",
    link: "#2B6CB0",
    alert: "#C53030",
    ok: "#2F855A",
    primary: "#2A4365",
    primaryInk: "#FFFFFF",
    todo: "#A0AEC0",
    doing: "#3182CE",
    done: "#38A169",
    overlay: "rgba(15,18,24,0.38)",
    background: "#F4F5F7",
    card: "#FFFFFF",
    accent: "#2A4365",
    accentText: "#FFFFFF",
    danger: "#C53030",
  },
  dark: {
    bg: "#0E1014",
    surface: "#171A20",
    surface2: "#1D2128",
    text: "#EDF0F4",
    text2: "#B4BCC8",
    muted: "#7C8594",
    line: "#262A32",
    track: "#262A32",
    brand: "#90CDF4",
    link: "#90CDF4",
    alert: "#FC8181",
    ok: "#68D391",
    primary: "#3C6098",
    primaryInk: "#FFFFFF",
    todo: "#718096",
    doing: "#63B3ED",
    done: "#68D391",
    overlay: "rgba(0,0,0,0.55)",
    background: "#0E1014",
    card: "#171A20",
    accent: "#90CDF4",
    accentText: "#102117",
    danger: "#FC8181",
  },
} as const;

export type Palette = { [K in keyof (typeof palette)["light"]]: string };
type Mode = "system" | "light" | "dark";

const ThemeContext = createContext<{
  colors: Palette;
  mode: Mode;
  setMode: (mode: Mode) => void;
  dark: boolean;
}>({
  colors: palette.light,
  mode: "system",
  setMode: () => undefined,
  dark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<Mode>("system");

  useEffect(() => {
    AsyncStorage.getItem("facilita.theme").then((value) => {
      if (value === "light" || value === "dark" || value === "system") setModeState(value);
    });
  }, []);

  const setMode = (next: Mode) => {
    setModeState(next);
    AsyncStorage.setItem("facilita.theme", next);
  };

  const dark = mode === "system" ? system === "dark" : mode === "dark";
  const value = useMemo(
    () => ({ colors: (dark ? palette.dark : palette.light) as Palette, mode, setMode, dark }),
    [dark, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
