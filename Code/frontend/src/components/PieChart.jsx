const DEFAULT_COLORS = [
  "#1e3a8a",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe"
];

const toSafeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
};

const sanitizeSlice = (item, index) => {
  const label = item?.label ?? item?.title ?? item?.name ?? item?.categoria ?? `Item ${index + 1}`;
  const value = toSafeNumber(item?.value ?? item?.count ?? item?.total ?? item?.cantidad);
  const color = item?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  return { label: String(label), value, color };
};

export default function PieChart({ data = [], title = "", size = 280 }) {
  const normalizedData = Array.isArray(data)
    ? data.map(sanitizeSlice).filter((slice) => slice.value > 0)
    : [];

  const total = normalizedData.reduce((sum, slice) => sum + slice.value, 0);

  if (!normalizedData.length || total <= 0) {
    return (
      <div style={{ margin: "1.5rem 0", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1rem", background: "#fff" }}>
        <p style={{ margin: 0, color: "#4b5563" }}>No hay datos suficientes para representar un grafico de tarta.</p>
      </div>
    );
  }

  const viewBoxSize = 120;
  const center = viewBoxSize / 2;
  const strokeWidth = 20;
  const radius = center - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div style={{ margin: "1.5rem 0", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1rem", background: "#fff" }}>
      {title ? <p style={{ margin: "0 0 1rem", fontWeight: 700, textAlign: "center" }}>{title}</p> : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} role="img" aria-label={title || "Grafico de tarta"}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
          {normalizedData.map((slice) => {
            const fraction = slice.value / total;
            const segmentLength = fraction * circumference;
            const segmentOffset = -offset;
            offset += segmentLength;

            return (
              <circle
                key={`${slice.label}-${slice.value}`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={segmentOffset}
                transform={`rotate(-90 ${center} ${center})`}
              />
            );
          })}
          <text x={center} y={center - 4} textAnchor="middle" style={{ fontSize: "8px", fontWeight: 700, fill: "#111827" }}>
            Total
          </text>
          <text x={center} y={center + 6} textAnchor="middle" style={{ fontSize: "8px", fontWeight: 700, fill: "#111827" }}>
            {total}
          </text>
        </svg>

        <div style={{ minWidth: "220px", display: "grid", gap: "0.45rem" }}>
          {normalizedData.map((slice) => {
            const percentage = ((slice.value / total) * 100).toFixed(1);
            return (
              <div key={`legend-${slice.label}-${slice.value}`} style={{ display: "grid", gridTemplateColumns: "14px 1fr auto", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "14px", height: "14px", borderRadius: "3px", background: slice.color }} />
                <span style={{ color: "#1f2937", fontSize: "0.9rem" }}>{slice.label}</span>
                <span style={{ color: "#111827", fontSize: "0.85rem", fontWeight: 600 }}>{slice.value} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
