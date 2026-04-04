interface Props {
  bearing: number;
}

export function ARCompassRose({ bearing }: Props) {
  const dirs = [
    { label: "N", angle: 0 },
    { label: "E", angle: 90 },
    { label: "S", angle: 180 },
    { label: "W", angle: 270 },
  ];

  return (
    <div className="absolute top-2 left-2 pointer-events-none">
      <svg
        viewBox="0 0 80 80"
        width="80"
        height="80"
        role="img"
        aria-labelledby="compass-rose-title"
      >
        <title id="compass-rose-title">AR Compass Rose</title>
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="black"
          fillOpacity="0.5"
          stroke="white"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        {dirs.map((d) => {
          const rad = (((d.angle - bearing + 360) % 360) * Math.PI) / 180;
          const x = 40 + 26 * Math.sin(rad);
          const y = 40 - 26 * Math.cos(rad);
          return (
            <text
              key={d.label}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={d.label === "N" ? "#ef4444" : "white"}
              fillOpacity={0.95}
            >
              {d.label}
            </text>
          );
        })}
        <line
          x1="40"
          y1="40"
          x2={40 + 18 * Math.sin((((-bearing + 360) % 360) * Math.PI) / 180)}
          y2={40 - 18 * Math.cos((((-bearing + 360) % 360) * Math.PI) / 180)}
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="40" r="3" fill="white" />
      </svg>
    </div>
  );
}
