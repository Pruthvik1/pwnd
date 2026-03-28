/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const theme = {
  colors: {
    primary: "#003087",
    accent: "#009cde",
    white: "#ffffff",
    success: "#1e6e3d",
    successBg: "#e6f4ea",
    warning: "#a05c00",
    warningBg: "#fff3e0",
    danger: "#9b2222",
    dangerBg: "#fce8e8",
    info: "#0d5ea6",
    infoBg: "#e3f2fd",
    muted: "#6b7280",
    border: "rgba(0,0,0,0.1)",
    surface: "#f9fafb",
    text: "#0f172a",
  },
  severity: {
    critical: { bg: "#fce8e8", text: "#9b2222" },
    high: { bg: "#fff3e0", text: "#a05c00" },
    medium: { bg: "#e3f2fd", text: "#0d5ea6" },
    low: { bg: "#f1efff", text: "#534ab7" },
  },
  status: {
    draft: { bg: "#f1efff", text: "#534ab7" },
    reported: { bg: "#e3f2fd", text: "#0d5ea6" },
    triaging: { bg: "#fff3e0", text: "#a05c00" },
    accepted: { bg: "#e6f4ea", text: "#1e6e3d" },
    duplicate: { bg: "#fce8e8", text: "#9b2222" },
    rejected: { bg: "#fce8e8", text: "#9b2222" },
    paid: { bg: "#e6f4ea", text: "#1e6e3d" },
  },
};
