"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Composición del hero: cómo se conectan datos, código, automatización e IA.
 * Los nodos son botones: al elegir uno, la consola muestra qué pasa en esa etapa.
 * La consola inferior reproduce un cuadre ilustrativo (no consulta nada real).
 */

type NodeId = "mysql" | "cfdi" | "python" | "ia" | "excel" | "bi" | "app";

const nodes: {
  id: NodeId;
  label: string;
  sub: string;
  x: number;
  y: number;
  tone: "data" | "code" | "ai" | "out";
}[] = [
  { id: "mysql", label: "MySQL", sub: "pólizas y ventas", x: 70, y: 96, tone: "data" },
  { id: "cfdi", label: "CFDI", sub: "información fiscal", x: 70, y: 268, tone: "data" },
  { id: "ia", label: "Asistente IA", sub: "apoyo al desarrollo", x: 290, y: 44, tone: "ai" },
  { id: "python", label: "Python", sub: "SQL + pandas", x: 290, y: 182, tone: "code" },
  { id: "excel", label: "Excel", sub: "reporte de cuadre", x: 510, y: 82, tone: "out" },
  { id: "bi", label: "Power BI", sub: "indicadores", x: 510, y: 182, tone: "out" },
  { id: "app", label: "App .exe", sub: "para el usuario", x: 510, y: 282, tone: "out" },
];

const edges: { from: NodeId; to: NodeId; assist?: boolean }[] = [
  { from: "mysql", to: "python" },
  { from: "cfdi", to: "python" },
  { from: "ia", to: "python", assist: true },
  { from: "python", to: "excel" },
  { from: "python", to: "bi" },
  { from: "python", to: "app" },
];

const snippets: Record<NodeId, { title: string; code: string }> = {
  mysql: {
    title: "Consulta parametrizada",
    code: `SELECT folio, fecha, total\nFROM polizas_ingreso\nWHERE empresa = %s\n  AND fecha BETWEEN %s AND %s;`,
  },
  cfdi: {
    title: "Fuente fiscal",
    code: `cfdi = pd.read_sql(\n    q_cfdi, conn,\n    params=(empresa, ini, fin))\ncfdi = cfdi[cfdi.estado == "Vigente"]`,
  },
  python: {
    title: "Cruce y validación",
    code: `cuadre = cfdi.merge(\n    conta, on="folio", how="outer")\ndif = (cuadre.total_cfdi.sum()\n       - cuadre.total_conta.sum())\nassert abs(dif) < 0.01, "No cuadra"`,
  },
  ia: {
    title: "Apoyo, no piloto automático",
    code: `# La IA propone un borrador.\n# Yo lo reviso, lo pruebo contra\n# la fuente y decido si entra.`,
  },
  excel: {
    title: "Entrega",
    code: `with pd.ExcelWriter("cuadre.xlsx") as xl:\n    resumen.to_excel(xl, "Resumen")\n    difs.to_excel(xl, "Diferencias")`,
  },
  bi: {
    title: "Visualización",
    code: `# Modelo limpio y con fecha de corte\n# para que Power BI muestre un solo\n# número correcto para todos.`,
  },
  app: {
    title: "Herramienta para el área",
    code: `pyinstaller --onefile --windowed \\\n    reporte_cuadre.py\n# El usuario elige empresa y fechas.`,
  },
};

const log = [
  { t: "conectando a MySQL", r: "ok" },
  { t: "CFDI vigentes leídos", r: "1 284" },
  { t: "pólizas leídas", r: "1 284" },
  { t: "cruce por folio", r: "1 284 / 1 284" },
  { t: "diferencia", r: "$0.00", ok: true },
  { t: "exportando cuadre.xlsx", r: "listo" },
];

function edgePath(a: (typeof nodes)[number], b: (typeof nodes)[number]) {
  const ax = a.x + 58;
  const bx = b.x - 58;
  if (a.x === b.x) return `M${a.x} ${a.y + 24} L${b.x} ${b.y - 24}`;
  const mx = (ax + bx) / 2;
  return `M${ax} ${a.y} C${mx} ${a.y}, ${mx} ${b.y}, ${bx} ${b.y}`;
}

export default function Pipeline() {
  const [selected, setSelected] = useState<NodeId>("python");
  const [step, setStep] = useState(log.length);
  const [motion, setMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pausa la animación cuando el hero no está en pantalla (rendimiento).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!motion) {
      setStep(log.length);
      return;
    }
    setStep(0);
    let i = 0;
    const id = window.setInterval(() => {
      if (!visible.current || document.hidden) return;
      i = i >= log.length + 4 ? 0 : i + 1; // pausa al final antes de reiniciar
      setStep(Math.min(i, log.length));
    }, 650);
    return () => window.clearInterval(id);
  }, [motion]);

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<NodeId, (typeof nodes)[number]>;
  const isLinked = (e: (typeof edges)[number]) => e.from === selected || e.to === selected;
  const snip = snippets[selected];

  return (
    <div className="pipeline window" ref={rootRef}>
      <div className="window-bar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="window-title">flujo_de_datos.py</span>
        <span className="sim-flag">Ilustrativo</span>
      </div>

      <div className="pipeline-canvas">
        <svg viewBox="0 0 580 330" role="group" aria-label="Flujo: fuentes de datos, procesamiento en Python con apoyo de IA y entregables">
          <defs>
            <linearGradient id="edge-grad" x1="0" x2="1">
              <stop offset="0" stopColor="#4c8dff" stopOpacity="0.15" />
              <stop offset="1" stopColor="#3ad6e0" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          {edges.map((e, i) => {
            const d = edgePath(byId[e.from], byId[e.to]);
            const id = `edge-${i}`;
            const linked = isLinked(e);
            return (
              <g key={id} className={`edge${e.assist ? " assist" : ""}${linked ? " linked" : ""}`}>
                <path id={id} d={d} />
                {motion && (
                  <circle r={e.assist ? 2.6 : 3.2} className="packet">
                    <animateMotion dur={`${e.assist ? 3.2 : 2.4 + (i % 3) * 0.35}s`} repeatCount="indefinite" begin={`${i * 0.4}s`}>
                      <mpath href={`#${id}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}
          {nodes.map((n) => (
            <g
              key={n.id}
              className={`node tone-${n.tone}${selected === n.id ? " selected" : ""}`}
              transform={`translate(${n.x} ${n.y})`}
              role="button"
              tabIndex={0}
              aria-pressed={selected === n.id}
              aria-label={`${n.label}: ${n.sub}`}
              onClick={() => setSelected(n.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  setSelected(n.id);
                }
              }}
            >
              <rect x={-58} y={-24} width={116} height={48} rx={10} />
              <text y={-3} textAnchor="middle" className="node-label">
                {n.label}
              </text>
              <text y={13} textAnchor="middle" className="node-sub">
                {n.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="pipeline-console">
        <div className="pipeline-snippet" aria-live="polite">
          <div className="pipeline-snippet-title">{snip.title}</div>
          <pre>
            <code>{snip.code}</code>
          </pre>
        </div>
        <ol className="pipeline-log" aria-label="Registro de un cuadre ilustrativo">
          {log.map((l, i) => (
            <li key={l.t} data-on={i < step} data-ok={l.ok ? "true" : undefined}>
              <span className="log-t">{l.t}</span>
              <span className="log-r">{l.r}</span>
            </li>
          ))}
          <li className="log-verdict" data-on={step >= log.length}>
            Cuadra
          </li>
        </ol>
      </div>
    </div>
  );
}
