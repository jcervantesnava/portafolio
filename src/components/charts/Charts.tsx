"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Gráficos SVG ligeros, sin librerías: escalan con el contenedor,
 * muestran valores al pasar el cursor o enfocar con teclado, y tienen
 * descripción accesible.
 */

export interface Series {
  name: string;
  values: number[];
  color: string;
  dashed?: boolean;
}

const niceMax = (v: number) => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * p;
};

export function LineChart({
  labels,
  series,
  format,
  height = 240,
  title,
}: {
  labels: string[];
  series: Series[];
  format: (n: number) => string;
  height?: number;
  title: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId();
  const ref = useRef<HTMLElement>(null);
  const [W, setW] = useState(640);
  // El ancho del SVG sigue al contenedor para que el texto conserve su tamaño.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 480 ? Math.round(height * 0.9) : height;
  const pad = { l: 56, r: 16, t: 14, b: 28 };
  const all = series.flatMap((s) => s.values.filter((v) => Number.isFinite(v)));
  const max = niceMax(Math.max(...all, 0) * 1.05);
  const n = labels.length;
  const x = (i: number) => pad.l + (n <= 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (n - 1));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const every = Math.ceil(n / (W < 480 ? 4 : 8));

  if (!n) return <div className="chart-empty">Sin datos para este filtro.</div>;

  return (
    <figure className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${uid}-t`} onMouseLeave={() => setHover(null)}>
        <title id={`${uid}-t`}>{title}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="axis">
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % every === 0 || i === n - 1 ? (
            <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" className="axis">
              {l}
            </text>
          ) : null,
        )}
        {series.map((s) => {
          const pts = s.values.map((v, i) => (Number.isFinite(v) ? `${x(i)},${y(v)}` : null)).filter(Boolean);
          return (
            <g key={s.name}>
              {!s.dashed && (
                <polygon
                  points={`${x(0)},${y(0)} ${pts.join(" ")} ${x(s.values.length - 1)},${y(0)}`}
                  fill={s.color}
                  opacity={0.08}
                />
              )}
              <polyline
                points={pts.join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? "5 5" : undefined}
                strokeLinejoin="round"
              />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="crosshair" />
            {series.map((s) =>
              Number.isFinite(s.values[hover]) ? (
                <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r={4} fill={s.color} stroke="#0d1524" strokeWidth={2} />
              ) : null,
            )}
          </g>
        )}
        {labels.map((l, i) => (
          <rect
            key={`hit-${l}-${i}`}
            x={x(i) - (W - pad.l - pad.r) / (2 * Math.max(n - 1, 1))}
            y={pad.t}
            width={(W - pad.l - pad.r) / Math.max(n - 1, 1)}
            height={H - pad.t - pad.b}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={i % every === 0 ? 0 : -1}
            aria-label={`${l}: ${series.map((s) => `${s.name} ${Number.isFinite(s.values[i]) ? format(s.values[i]) : "sin dato"}`).join(", ")}`}
          />
        ))}
      </svg>
      <figcaption className="chart-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color, opacity: s.dashed ? 0.6 : 1 }} />
            {s.name}
          </span>
        ))}
        {hover !== null && (
          <span className="chart-readout">
            <strong>{labels[hover]}</strong>{" "}
            {series.map((s) => `${s.name}: ${Number.isFinite(s.values[hover]) ? format(s.values[hover]) : "sin dato"}`).join("  /  ")}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function BarChart({
  data,
  format,
  title,
  color = "#4c8dff",
  compare,
}: {
  data: { label: string; value: number; prev?: number }[];
  format: (n: number) => string;
  title: string;
  color?: string;
  /** Muestra una marca con el valor anterior */
  compare?: boolean;
}) {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.prev ?? 0)), 1);
  if (!data.length) return <div className="chart-empty">Sin datos para este filtro.</div>;
  return (
    <figure className="bars" aria-label={title}>
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <span className="bar-label">{d.label}</span>
          <span className="bar-track" aria-hidden="true">
            <span className="bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
            {compare && d.prev !== undefined && (
              <span className="bar-prev" style={{ left: `${(d.prev / max) * 100}%` }} title="Periodo anterior" />
            )}
          </span>
          <span className="bar-value">{format(d.value)}</span>
        </div>
      ))}
    </figure>
  );
}
