import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

type IconName = "dashboard" | "bounties" | "emails" | "freelance" | "earnings" | "profile";

interface AppTabIconProps {
  name: IconName;
  color: string;
  size?: number;
}

export function AppTabIcon({ name, color, size = 20 }: AppTabIconProps) {
  switch (name) {
    case "dashboard":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
          <Rect x="13" y="3" width="8" height="5" rx="2" stroke={color} strokeWidth="2" />
          <Rect x="13" y="10" width="8" height="11" rx="2" stroke={color} strokeWidth="2" />
          <Rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
        </Svg>
      );
    case "bounties":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3L14.5 8.5L21 9.3L16 13.5L17.5 20L12 16.8L6.5 20L8 13.5L3 9.3L9.5 8.5L12 3Z"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "emails":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" />
          <Path d="M4 7L12 13L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case "freelance":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="2" />
          <Path
            d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7"
            stroke={color}
            strokeWidth="2"
          />
        </Svg>
      );
    case "earnings":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 19H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M7 16L11 12L14 14L19 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M19 12V9H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case "profile":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z"
            stroke={color}
            strokeWidth="2"
          />
          <Path
            d="M4 20C4 17.33 7.58 15 12 15C16.42 15 20 17.33 20 20"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}
