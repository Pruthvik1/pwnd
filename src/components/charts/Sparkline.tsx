import React from "react";
import { View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ points, width = 180, height = 50, color = "#0070e0" }: SparklineProps) {
  if (points.length < 2) {
    return <View style={{ width, height }} />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coordinates = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={coordinates}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}
