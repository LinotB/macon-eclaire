// src/components/game/RadarChart.jsx
import { motion } from "framer-motion";

export default function RadarChart({ data, size = 300 }) {
  const themes = Object.keys(data);
  const numAxes = themes.length;
  const angleSlice = (Math.PI * 2) / numAxes;
  const radius = size / 2 - 40;
  const center = size / 2;

  const dataPoints = themes.map((theme, i) => {
    const value = (data[theme] || 0) / 100;
    const angle = angleSlice * i - Math.PI / 2;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle),
      label: theme,
      value: data[theme] || 0,
    };
  });

  const polygonPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {gridLevels.map((level, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="rgba(212, 175, 55, 0.15)"
            strokeWidth="1"
          />
        ))}

        {themes.map((_, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(212, 175, 55, 0.2)"
              strokeWidth="1"
            />
          );
        })}

        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          points={polygonPath}
          fill="rgba(212, 175, 55, 0.2)"
          stroke="#D4AF37"
          strokeWidth="2"
          style={{ transformOrigin: "center" }}
        />

        {dataPoints.map((point, i) => (
          <motion.circle
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
            cx={point.x}
            cy={point.y}
            r="6"
            fill="#D4AF37"
            stroke="#0B1120"
            strokeWidth="2"
          />
        ))}

        {themes.map((theme, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelRadius = radius + 30;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          const value = data[theme] || 0;

          return (
            <g key={i}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-amber-200 font-medium"
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </text>
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-bold ${
                  value >= 60
                    ? "fill-amber-400"
                    : value >= 40
                    ? "fill-amber-200/70"
                    : "fill-amber-200/40"
                }`}
              >
                {value}%
              </text>
            </g>
          );
        })}

        <circle cx={center} cy={center} r="8" fill="#D4AF37" opacity="0.3" />
        <circle cx={center} cy={center} r="4" fill="#D4AF37" />
      </svg>
    </div>
  );
}
