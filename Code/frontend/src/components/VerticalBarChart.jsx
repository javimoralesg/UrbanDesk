const WEEK_ORDER = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

const normalizeWeekLabel = (label) => {
  const raw = String(label || "").trim();
  const normalized = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const map = {
    monday: "Lunes",
    lunes: "Lunes",
    tuesday: "Martes",
    martes: "Martes",
    wednesday: "Miercoles",
    miercoles: "Miercoles",
    thursday: "Jueves",
    jueves: "Jueves",
    friday: "Viernes",
    viernes: "Viernes",
    saturday: "Sabado",
    sabado: "Sabado",
    sunday: "Domingo",
    domingo: "Domingo"
  };

  if (map[normalized]) return map[normalized];

  const numeric = Number(raw);
  if (Number.isInteger(numeric)) {
    if (numeric >= 1 && numeric <= 7) return WEEK_ORDER[numeric - 1] || null;
    if (numeric >= 0 && numeric <= 6) return ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"][numeric] || null;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"][parsed.getDay()] || null;
  }

  return null;
};

const isWeeklyChart = (title, items) => {
  const basis = String(title || "").toLowerCase();
  if (/(semana|semanal|diario|daily|por dia|por día|dias de la semana)/i.test(basis)) return true;
  if (!Array.isArray(items) || !items.length) return false;
  const matchCount = items.filter((item) => normalizeWeekLabel(item?.label) !== null).length;
  return matchCount / items.length >= 0.7;
};

const fillWeeklySeries = (chart) => {
  if (!chart || !Array.isArray(chart.data) || !chart.data.length) return chart;

  const bucket = new Map();
  for (const item of chart.data) {
    const canon = normalizeWeekLabel(item?.label);
    if (!canon) continue;
    const current = bucket.get(canon) || { label: canon, value: 0, color: item?.color };
    current.value += Number(item?.value) || 0;
    if (!current.color && item?.color) current.color = item.color;
    bucket.set(canon, current);
  }

  if (!bucket.size) return chart;

  return {
    ...chart,
    data: WEEK_ORDER.map((day) => bucket.get(day) || { label: day, value: 0 })
  };
};

export const parseBarChartPayload = (rawText) => {
  try {
    let payloadText = String(rawText || "").trim();

    payloadText = payloadText
      .replace(/^`+|`+$/g, "")
      .replace(/^bar\s*[:=]\s*/i, "")
      .trim();

    const fencedMatch = payloadText.match(/^```(?:bar|json)?\s*([\s\S]*?)\s*```$/i);
    if (fencedMatch?.[1]) {
      payloadText = fencedMatch[1].trim();
    }

    const parsed = JSON.parse(payloadText);

    let title = "Grafico";
    let items = [];

    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && Array.isArray(parsed.bar)) {
      title = parsed.title || "Grafico";
      items = parsed.bar;
    } else if (parsed && Array.isArray(parsed.data)) {
      title = parsed.title || "Grafico";
      items = parsed.data;
    }

    const normalized = items
      .map((item, index) => {
        const label = item?.title ?? item?.label ?? item?.name ?? item?.categoria ?? item?.estado ?? `Item ${index + 1}`;
        const valueRaw = item?.value ?? item?.count ?? item?.total ?? item?.cantidad;
        const value = Number(valueRaw);
        const color = item?.color || "#1f6feb";
        return { label: String(label), value, color };
      })
      .filter((item) => Number.isFinite(item.value) && item.value >= 0);

    if (!normalized.length) return null;
    const chart = { title, data: normalized };

    if (isWeeklyChart(title, normalized)) {
      return fillWeeklySeries(chart);
    }

    return chart;
  } catch {
    return null;
  }
};

export default function VerticalBarChart({ chart }) {
  const maxValue = Math.max(...chart.data.map((d) => d.value), 1);

  const itemCount = chart.data.length;
  const hasLongLabels = chart.data.some((item) => item.label.length > 20);
  const maxLabelLength = Math.max(...chart.data.map((item) => item.label.length));

  const dynamicMinWidth = hasLongLabels
    ? Math.max(56, Math.min(Math.floor(520 / Math.max(itemCount, 1)), 96))
    : Math.max(48, Math.min(Math.floor(560 / Math.max(itemCount, 1)), 88));

  const barAreaHeight = maxLabelLength > 40 ? 210 : maxLabelLength > 25 ? 185 : 165;
  const chartContentWidth = itemCount * dynamicMinWidth + Math.max(itemCount - 1, 0) * 12;

  return (
    <div style={{ 
      margin: "1.5rem 0", 
      border: "1px solid #e5e7eb", 
      borderRadius: "12px", 
      padding: "1rem", 
      background: "#fff",
      width: "fit-content",
      maxWidth: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      marginLeft: "auto",
      marginRight: "auto"
    }}>
      <p style={{ margin: "0 0 1rem", fontWeight: 700, textAlign: "center", wordBreak: "break-word" }}>
        {chart.title !== "Grafico" ? chart.title : ""}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${itemCount}, minmax(${dynamicMinWidth}px, ${dynamicMinWidth}px))`,
          gridTemplateRows: `${barAreaHeight}px auto auto`,
          columnGap: "12px",
          rowGap: "6px",
          alignItems: "end",
          justifyContent: "center",
          width: `${chartContentWidth}px`,
          maxWidth: "100%",
          margin: "0 auto"
        }}
      >
        {chart.data.map((item, index) => {
          const barHeight = Math.max((item.value / maxValue) * 180, 8);
          return (
            <div key={`${item.label}-${item.value}-${index}`} style={{ display: "contents" }}>
              <div style={{ 
                gridColumn: index + 1,
                gridRow: 1,
                height: `${barAreaHeight}px`,
                display: "flex", 
                alignItems: "flex-end",
                justifyContent: "center",
                width: "100%",
                minWidth: 0
              }}>
                <div
                  title={`${item.label}: ${item.value}`}
                  style={{
                    height: `${barHeight}px`,
                    borderRadius: "8px 8px 0 0",
                    background: item.color,
                    transition: "height 0.25s ease",
                    width: "100%",
                    maxWidth: "86px"
                  }}
                />
              </div>
              <div style={{
                gridColumn: index + 1,
                gridRow: 2,
                fontSize: "0.75rem",
                color: "#333",
                fontWeight: "600",
                textAlign: "center"
              }}>
                {item.value}
              </div>
              <div 
                style={{ 
                  gridColumn: index + 1,
                  gridRow: 3,
                  fontSize: "0.7rem", 
                  color: "#333", 
                  wordBreak: "break-word",
                  maxWidth: "100%",
                  lineHeight: "1.25",
                  fontWeight: "500",
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "clip",
                  hyphens: "auto",
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  textAlign: "center",
                  minWidth: 0
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
