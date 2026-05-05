import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import html2pdf from "html2pdf.js";
import mermaid from "mermaid";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import Popups from "../components/Popups";
import PieChart from "../components/PieChart";
import ChatbotInforme from "../components/ChatbotInforme";
import VerticalBarChart, { parseBarChartPayload } from "../components/VerticalBarChart";
import { api } from "../services/api";
import "../assets/css/GenerarInforme.css";

import Markdown from "markdown-to-jsx";
import MapLocate from "../components/MapLocate";

const preprocesarMDX = (texto) => {
  if (!texto) return "";
  let limpio = texto;

  limpio = limpio
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&amp;/gi, "&");
  
  limpio = limpio.replace(/```(?:jsx|javascript|html|xml|mdx)?\s*(<(?:MapLocate|PieChart)[\s\S]*?(?:<\/(?:MapLocate|PieChart)>|\/>))\s*```/gi, '\n$1\n');

  limpio = limpio.replace(/^[\s>*-]*["'`]?\s*(<(?:MapLocate|PieChart)[\s\S]*?(?:<\/(?:MapLocate|PieChart)>|\/>))\s*["'`]?\s*$/gim, "$1");

  limpio = limpio.replace(
    /(^|\n)\s*bar\s*[:=]\s*(\[[^\n]*\]|\{[^\n]*\})(?=\s*(?:\n|$))/gi,
    (_m, prefix, payload) => `${prefix}\n\`\`\`bar\n${payload.trim()}\n\`\`\`\n`
  );
  
  limpio = limpio.replace(/(\|[\s\S]*?\|[\s\S]*?\n)\s*(\n\s*<(?:MapLocate|PieChart|div[^>]*(?:style|class)[^>]*>)[\s\S]*?(?:<\/(?:MapLocate|PieChart|div)>|\/>))/gi, (match, table, chart) => {
    return table + "\n\n" + chart.trim() + "\n\n";
  });

  limpio = limpio.replace(/(\|[\s\S]*?\|[\s\S]*?\n)\s*(\n\s*```bar[\s\S]*?```)/gi, (match, table, chart) => {
    return table + "\n\n" + chart.trim() + "\n\n";
  });
  
  limpio = limpio.replace(/<(MapLocate|PieChart)([\s\S]*?)(?:<\/(?:MapLocate|PieChart)>|\/>)/gi, (match) => {
    return match.replace(/(\w+)=\{\s*([\s\S]*?)\s*\}(?=\s|\/|>)/g, (m, attr, content) => {
      return `${attr}='${content.replace(/'/g, '"')}'`;
    });
  });

  return limpio;
};

const formatDatosTexto = (datos) => {
  if (datos === null || datos === undefined) return "";
  if (typeof datos === "string") return datos;

  try {
    return JSON.stringify(datos, null, 2);
  } catch {
    return String(datos);
  }
};

const isJsonObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const JsonLeaf = ({ name, value }) => {
  const valueType = value === null ? "null" : typeof value;

  return (
    <div className="generar-informe__json-row">
      {name !== undefined && <span className="generar-informe__json-key">{name}:</span>}
      <span className={`generar-informe__json-value generar-informe__json-value--${valueType}`}>
        {valueType === "string" ? `"${value}"` : String(value)}
      </span>
    </div>
  );
};

const JsonNode = ({ name, value, level = 0, defaultExpandedDepth = 0 }) => {
  if (value === null || typeof value !== "object") {
    return <JsonLeaf name={name} value={value} />;
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? value.map((entry, index) => [index, entry])
    : Object.entries(value);

  if (!entries.length) {
    return <JsonLeaf name={name} value={isArray ? "[]" : "{}"} />;
  }

  return (
    <details className="generar-informe__json-node" open={level < defaultExpandedDepth}>
      <summary className="generar-informe__json-summary">
        {name !== undefined && <span className="generar-informe__json-key">{name}: </span>}
        <span className="generar-informe__json-meta">
          {isArray ? `Array(${entries.length})` : `Object(${entries.length})`}
        </span>
      </summary>

      <div className="generar-informe__json-children">
        {entries.map(([childName, childValue]) => (
          <JsonNode
            key={`${String(name ?? "root")}-${String(childName)}`}
            name={isArray ? `[${childName}]` : childName}
            value={childValue}
            level={level + 1}
            defaultExpandedDepth={defaultExpandedDepth}
          />
        ))}
      </div>
    </details>
  );
};

const JsonTreeViewer = ({ value }) => {
  if (value === null || value === undefined) {
    return <p className="generar-informe__json-empty">No se recibieron datos en la propiedad .datos</p>;
  }

  let parsedValue = value;
  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return <pre className="generar-informe__pre">{formatDatosTexto(value)}</pre>;
    }
  }

  if (!Array.isArray(parsedValue) && !isJsonObject(parsedValue)) {
    return <pre className="generar-informe__pre">{formatDatosTexto(parsedValue)}</pre>;
  }

  return (
    <div className="generar-informe__json-tree" role="tree" aria-label="Datos en formato JSON">
      <JsonNode value={parsedValue} defaultExpandedDepth={0} />
    </div>
  );
};

const MermaidChart = ({ text }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "default" });
    if (text && containerRef.current) {
      const renderId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(renderId, text.toString()).then(result => {
        if (containerRef.current) {
          containerRef.current.innerHTML = result.svg;
        }
      }).catch(err => {
        console.error("Error al renderizar diagrama de mermaid:", err);
      });
    }
  }, [text]);

  return <div ref={containerRef} className="mermaid-container" style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }} />;
};

const toCodeText = (children) => (Array.isArray(children) ? children.join("") : String(children || "")).trim();

const CustomCodeBlock = ({ className, children, ...props }) => {
  const normalizedClass = String(className || "").toLowerCase();
  const rawText = toCodeText(children);

  if (normalizedClass === 'lang-mermaid') {
    return <MermaidChart text={children} />;
  }

  const isBarLang = /(lang-bar|language-bar|lang-bars|lang-barchart|lang-chart|lang-vertical-bars)/.test(normalizedClass);
  const isJsonLang = /(lang-json|language-json)/.test(normalizedClass);
  const hasBarHint = /charttype\s*"?\s*:\s*"?(bar|vertical-bar|barras)/i.test(rawText) || /"data"\s*:\s*\[/i.test(rawText);

  if (isBarLang || (isJsonLang && hasBarHint)) {
    const chart = parseBarChartPayload(rawText);
    if (chart) return <VerticalBarChart chart={chart} />;
  }

  return <code className={className} {...props}>{children}</code>;
};

const parseMapLocatePayload = (value) => {
  if (typeof value !== "string") return value;

  let text = value.trim();
  if (!text) return [];

  text = text
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&");

  const unquote = (str) => {
    if (str.length < 2) return str;
    const first = str[0];
    const last = str[str.length - 1];
    if ((first === "'" && last === "'") || (first === '"' && last === '"')) {
      return str.slice(1, -1).trim();
    }
    return str;
  };

  const mapTagMatch = text.match(/<MapLocate\b([\s\S]*?)(?:\/>|>)/i);
  if (mapTagMatch?.[1]) {
    const attrs = mapTagMatch[1];
    const attrMatch =
      attrs.match(/(?:puntos|data)\s*=\s*'([\s\S]*?)'/i) ||
      attrs.match(/(?:puntos|data)\s*=\s*"([\s\S]*?)"/i) ||
      attrs.match(/(?:puntos|data)\s*=\s*\{\s*([\s\S]*?)\s*\}/i);

    if (attrMatch?.[1]) {
      text = attrMatch[1].trim();
    }
  }

  const candidates = [text, unquote(text)];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return JSON.parse(candidate);
    } catch {
    }
  }

  try {
    return new Function("return (" + unquote(text) + ")")();
  } catch {
    return value;
  }
};

const parsePieChartPayload = (value) => {
  if (value === null || value === undefined) return { data: [], title: "" };

  let parsed = value;
  if (typeof parsed === "string") {
    const asMapPayload = parseMapLocatePayload(parsed);
    parsed = asMapPayload;
  }

  let data = [];
  let title = "";

  if (Array.isArray(parsed)) {
    data = parsed;
  } else if (parsed && typeof parsed === "object") {
    title = parsed.title || "";
    if (Array.isArray(parsed.data)) {
      data = parsed.data;
    }
  }

  const normalized = data
    .map((item, index) => {
      const label = item?.label ?? item?.title ?? item?.name ?? item?.categoria ?? item?.estado ?? `Item ${index + 1}`;
      const value = Number(item?.value ?? item?.count ?? item?.total ?? item?.cantidad);
      const color = item?.color;
      return {
        label: String(label),
        value,
        ...(color ? { color: String(color) } : {})
      };
    })
    .filter((item) => Number.isFinite(item.value) && item.value > 0);

  return { data: normalized, title: String(title || "") };
};

const MapLocateAdapter = ({ puntos, data, width, height, children, ...rest }) => {
  try {
    let parsedData = puntos || data || rest.puntos || rest.data;

    if (!parsedData && children) {
      parsedData = Array.isArray(children) ? children.join("") : children;
    }

    if (typeof parsedData === "string") {
      parsedData = parseMapLocatePayload(parsedData);
    }
    
    if (!Array.isArray(parsedData) && parsedData) {
      parsedData = [parsedData];
    } else if (!parsedData) {
      parsedData = [];
    }

    const puntosNormalizados = parsedData.map((p, i) => ({
      lat: parseFloat(p?.latitud || p?.lat),
      lng: parseFloat(p?.longitud || p?.lng || p?.lon),
      id: p?.id || i,
      title: p?.title || p?.titulo || p?.nombre || `Incidencia ${i + 1}`
    })).filter(p => !isNaN(p.lat) && !isNaN(p.lng));

    return (
      <div style={{ margin: "2rem 0", borderRadius: "12px", overflow: "hidden", border: "1px solid #ddd" }}>
        <MapLocate width={width || "100%"} height={height || "400px"} puntos={puntosNormalizados} />
      </div>
    );
  } catch (err) {
    console.error("Error al renderizar MapLocate:", err);
    return <div style={{ padding: "1rem", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "8px" }}>Error al cargar mapa interactivo. Los datos del informe no tienen el formato esperado.</div>;
  }
};

const PieChartAdapter = ({ data, valores, points, title, titulo, children, ...rest }) => {
  try {
    let parsed = data ?? valores ?? points ?? rest.data ?? rest.valores ?? rest.points;

    if (!parsed && children) {
      parsed = Array.isArray(children) ? children.join("") : children;
    }

    const payload = parsePieChartPayload(parsed);
    const chartTitle = title || titulo || rest.title || rest.titulo || payload.title || "";

    return <PieChart data={payload.data} title={String(chartTitle)} />;
  } catch (err) {
    console.error("Error al renderizar PieChart:", err);
    return <div style={{ padding: "1rem", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "8px" }}>Error al cargar grafico de tarta. Los datos no tienen el formato esperado.</div>;
  }
};

const EJEMPLOS = [
  "Muéstrame todas las incidencias abiertas de esta semana",
  "¿Qué técnicos tienen más carga de trabajo actualmente?",
  "Resumen de incidencias en el último mes agrupadas por estado",
];

export default function GenerarInforme() {
  const [userMessage, setUserMessage] = useState("");
  const [informe, setInforme] = useState("");
  const [datos, setDatos] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("informe");
  const [loading, setLoading] = useState(false);
  const [popupList, setPopupList] = useState([]);
  const reportRef = useRef(null);

  const vistaIndex = vistaActiva === "datos" ? 1 : 0;

  const navigate = useNavigate();
      useEffect(() => {
        const raw = localStorage.getItem('user');
        if (!raw || !JSON.parse(raw).rol || JSON.parse(raw).rol !== 'OPERADOR') {
          navigate('/incidencias-urbanas');
        }
      }, [navigate]);

  const addPopup = (id, message, type, autoDismiss = false, extra = {}) => {
    setPopupList((prev) => [
      ...prev.filter((p) => p.id !== id),
      { id, message, type, ...extra },
    ]);
    if (autoDismiss) {
      setTimeout(() => {
        setPopupList((prev) => prev.filter((p) => p.id !== id));
      }, 5000);
    }
  };

  const removePopup = (id) => {
    setPopupList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleGenerar = async (e) => {
    e.preventDefault();

    const msg = userMessage.trim();
    if (!msg) {
      addPopup("error", "Introduce una consulta antes de generar el informe.", "error", true);
      return;
    }

    setInforme("");
    setDatos(null);
    setVistaActiva("informe");
    setLoading(true);
    addPopup("loading", "Generando informe...", "waiting", false, { progress: 5 });

    try {
      const data = await api.generateReport(msg, (chunk) => {
        addPopup(
          "loading",
          "Generando informe...",
          "waiting",
          false,
          { progress: chunk?.progress ?? 10 }
        );
      });
      let texto = data?.informe || "";
      const datosRespuesta = data?.datos ?? null;

      if (!texto) {
        texto = JSON.stringify(data, null, 2);
      }
      
      texto = preprocesarMDX(texto);
      
      setInforme(texto);
      setDatos(datosRespuesta);
      setVistaActiva("informe");
      removePopup("loading");
      addPopup("success", "Informe generado correctamente.", "success", true);
    } catch (err) {
      console.error("Error al generar informe:", err);
      removePopup("loading");
      addPopup("error", err.message || "No se pudo generar el informe. Inténtalo de nuevo.", "error", true);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setInforme("");
    setDatos(null);
    setVistaActiva("informe");
    setUserMessage("");
    setPopupList([]);
    setLoading(false);
  };

  const handleDescargarPDF = () => {
    if (!informe || !reportRef.current || vistaActiva !== "informe") return;
    
    addPopup("loading-pdf", "Generando PDF...", "waiting");

    const match = informe.match(/^#+\s+(.*)$/m);
    let filename = 'informe.pdf';
    if (match && match[1]) {
      const safeTitle = match[1].replace(/[/\\?%*:|"<>]/g, '').trim();
      if (safeTitle) {
        filename = `${safeTitle}.pdf`;
      }
    }
    
    const element = reportRef.current;

    const style = document.createElement("style");
    style.innerHTML = `
      .generar-informe__output, 
      .generar-informe__card, 
      .generar-informe__card--result, 
      .generar-informe__content,
      .generar-informe__layout,
      body, html {
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);

    const opt = {
      margin: 15,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      document.head.removeChild(style);

      removePopup("loading-pdf");
      addPopup("pdf-success", "PDF descargado correctamente.", "success", true);
    }).catch(err => {
      document.head.removeChild(style);

      console.error("Error al generar PDF:", err);
      removePopup("loading-pdf");
      addPopup("pdf-error", "Hubo un error al generar el PDF.", "error", true);
    });
  };

  return (
    <>
      <Popups list={popupList} />
      <Hero />

      <main className="generar-informe__layout">
        <Sidebar />

        <section className="generar-informe__content">

          <div className="generar-informe__header">
            <h2 className="generar-informe__title">Generar informe</h2>
            <p className="generar-informe__subtitle">
              Describe en lenguaje natural qué información quieres consultar.
              La IA analizará los datos y generará un informe completo.
            </p>
          </div>

          <div className="generar-informe__top">

            <div className="generar-informe__left-column">
              <div className="generar-informe__card">
                <h3 className="generar-informe__section-title">Consulta</h3>

                <form className="generar-informe__form" onSubmit={handleGenerar}>
                  <div className="generar-informe__form-group">
                    <label htmlFor="user-message">¿Qué quieres saber?</label>
                    <textarea
                      id="user-message"
                      placeholder="Ej: Muéstrame las incidencias con prioridad alta de esta semana…"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      disabled={loading}
                      rows={5}
                    />
                  </div>

                  <div className="generar-informe__actions">
                    <button
                      type="submit"
                      className="generar-informe__btn generar-informe__btn--dark"
                      disabled={loading || !userMessage.trim()}
                      id="btn-generar-informe"
                    >
                      Generar informe
                    </button>

                    <button
                      type="button"
                      className="generar-informe__btn generar-informe__btn--light"
                      onClick={handleLimpiar}
                      disabled={!informe && !userMessage && !loading}
                      id="btn-limpiar-informe"
                    >
                      Limpiar
                    </button>
                  </div>
                </form>

                <div className="generar-informe__ejemplos">
                  <p className="generar-informe__ejemplos-label">Ejemplos:</p>
                  {EJEMPLOS.map((ej, i) => (
                    <button
                      key={i}
                      type="button"
                      className="generar-informe__ejemplo-chip"
                      onClick={() => setUserMessage(ej)}
                      disabled={loading}
                    >
                      {ej}
                    </button>
                  ))}
                </div>

              </div>

              {informe && (
                <ChatbotInforme
                  informe={informe}
                  datos={datos}
                  disabled={loading}
                  onError={(message) => addPopup("chat-error", message, "error", true)}
                />
              )}
            </div>

            <div className="generar-informe__card generar-informe__card--result">
              <div className="generar-informe__result-header">
                <h3 className="generar-informe__section-title" >Informe</h3>
                
              </div>

              {informe && (
                <div className="generar-informe__result-controls">
                    <div
                      className="generar-informe__view-switch"
                      role="tablist"
                      aria-label="Vista del resultado"
                    >
                      <span
                        className="generar-informe__view-thumb"
                        aria-hidden="true"
                        style={{
                          transform: `translateX(${vistaIndex * 100}%)`,
                          transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)"
                        }}
                      />
                      <button
                        type="button"
                        role="tab"
                        aria-selected={vistaActiva === "informe"}
                        className={`generar-informe__view-btn ${vistaActiva === "informe" ? "generar-informe__view-btn--active" : ""}`}
                        onClick={() => setVistaActiva("informe")}
                        id="btn-vista-informe"
                      >
                        Informe
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={vistaActiva === "datos"}
                        className={`generar-informe__view-btn ${vistaActiva === "datos" ? "generar-informe__view-btn--active" : ""}`}
                        onClick={() => setVistaActiva("datos")}
                        id="btn-vista-datos"
                      >
                        Datos
                      </button>
                    </div>

                    <button
                      className="generar-informe__copy-btn"
                      onClick={handleDescargarPDF}
                      title={vistaActiva === "informe" ? "Descargar PDF" : "Cambia a Informe para descargar PDF"}
                      id="btn-descargar-informe"
                      disabled={vistaActiva !== "informe"}
                    >
                      📄 Descargar PDF
                    </button>
                  </div>
                  
              )}

              {!informe && (
                
                <div className="generar-informe__placeholder">
                  <div className="generar-informe__placeholder-icon">📄</div>
                  <p>El informe aparecerá aquí una vez generado.</p>
                </div>
                
              )}

              

              {informe && vistaActiva === "informe" && (
                <div className="generar-informe__output" style={{height: 'fit-content'}} ref={reportRef}>
                  <Markdown
                    className="generar-informe__markdown"
                    options={{
                      overrides: {
                        MapLocate: {
                          component: MapLocateAdapter,
                        },
                        PieChart: {
                          component: PieChartAdapter,
                        },
                        code: {
                          component: CustomCodeBlock,
                        },
                      },
                    }}
                  >
                    {informe}
                  </Markdown>
                </div>
              )}

              {informe && vistaActiva === "datos" && (
                <div className="generar-informe__output" style={{height: 'fit-content'}}>
                  <JsonTreeViewer value={datos} />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
