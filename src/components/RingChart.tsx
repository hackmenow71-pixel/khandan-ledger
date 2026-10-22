"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type RingData = {
  label: string;
  value: number;
  maxValue: number;
  color: string;
};

type RingChartContextType = {
  data: RingData[];
  size: number;
  strokeWidth: number;
  ringGap: number;
  baseInnerRadius: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  animated: boolean;
};

const RingChartContext = createContext<RingChartContextType | null>(null);

export function RingChart({
  data,
  size = 200,
  animationDuration = 1000,
  animationEasing = "ease-out",
  strokeWidth = 10,
  ringGap = 5,
  baseInnerRadius = 50,
  children,
}: {
  data: RingData[];
  size?: number;
  animationDuration?: number;
  animationEasing?: string;
  strokeWidth?: number;
  ringGap?: number;
  baseInnerRadius?: number;
  children?: React.ReactNode;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Determine actual SVG size based on the number of rings
  const maxRadius = baseInnerRadius + data.length * (strokeWidth + ringGap);
  const svgSize = Math.max(size, maxRadius * 2 + strokeWidth * 2);

  return (
    <RingChartContext.Provider
      value={{
        data,
        size: svgSize,
        strokeWidth,
        ringGap,
        baseInnerRadius,
        hoveredIndex,
        setHoveredIndex,
        animated,
      }}
    >
      <div
        style={{
          position: "relative",
          width: svgSize,
          height: svgSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="text-gray-900 dark:text-white select-none overflow-visible"
          style={{ transform: "rotate(-90deg)" }}
        >
          {children}
        </svg>
      </div>
    </RingChartContext.Provider>
  );
}

export function Ring({ index }: { index: number }) {
  const ctx = useContext(RingChartContext);
  if (!ctx) return null;

  const { data, size, strokeWidth, ringGap, baseInnerRadius, hoveredIndex, setHoveredIndex, animated } = ctx;
  const item = data[index];
  if (!item) return null;

  // Calculate radius so that index 0 (highest value) is the outermost ring
  const radius = baseInnerRadius + (data.length - 1 - index) * (strokeWidth + ringGap);
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentage (clamped 0 to 1)
  const percentage = Math.min(Math.max(item.value / item.maxValue, 0), 1);
  const targetOffset = circumference - percentage * circumference;
  
  // If not animated yet, start offset at full circumference (invisible)
  const strokeDashoffset = animated ? targetOffset : circumference;

  const cx = size / 2;
  const cy = size / 2;

  const isHovered = hoveredIndex === index;
  const isAnyHovered = hoveredIndex !== null;
  const opacity = isAnyHovered && !isHovered ? 0.3 : 1;

  return (
    <g
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ transition: "opacity 0.2s ease", opacity, cursor: "pointer" }}
    >
      {/* Background Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        className="text-gray-100 dark:text-white/10"
        strokeWidth={strokeWidth}
      />
      {/* Active Ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="transparent"
        stroke={item.color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.85, 0, 0.15, 1)" }}
      />
    </g>
  );
}

export function RingCenter({ defaultLabel }: { defaultLabel?: string }) {
  const ctx = useContext(RingChartContext);
  if (!ctx) return null;

  const { data, hoveredIndex, size } = ctx;
  const cx = size / 2;
  const cy = size / 2;

  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const isHovered = hoveredIndex !== null;
  const currentItem = isHovered ? data[hoveredIndex] : null;

  // Counter-rotate the text so it's upright
  return (
    <g transform={`rotate(90, ${cx}, ${cy})`} className="pointer-events-none select-none">
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontSize="12px"
        fontWeight="600"
        fill="currentColor"
        className="text-gray-500 dark:text-gray-400 fill-gray-500 dark:fill-gray-400 uppercase tracking-wider font-sans transition-colors"
      >
        {currentItem ? currentItem.label : (defaultLabel || "Total")}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontSize="16px"
        fontWeight="700"
        fill="currentColor"
        className="text-gray-900 dark:text-white fill-gray-900 dark:fill-white font-sans transition-colors"
      >
        {currentItem ? currentItem.value.toLocaleString() : total.toLocaleString()}
      </text>
    </g>
  );
}
