export function ARInstallationPath() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        {/* Dotted line from center upward to optimal direction */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="20"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.85"
        />
        {/* Arrow head */}
        <polygon points="94,28 100,16 106,28" fill="#22c55e" opacity="0.85" />
        {/* Center dot */}
        <circle cx="100" cy="100" r="4" fill="#22c55e" opacity="0.85" />
        {/* Label */}
        <text
          x="100"
          y="14"
          textAnchor="middle"
          fontSize="8"
          fill="#22c55e"
          fontWeight="bold"
        >
          MOUNT HERE
        </text>
      </svg>
    </div>
  );
}
