import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
    },
  },
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_MAP_API_KEY,
      },
    },
  },
});
