"use client";

import { useMemo, useState } from "react";
import { categories, companies, monthLabel, regions, sales, type CompanyId, type Sale } from "@/lib/demo-data";
import { int, money, pct, short, sum } from "@/lib/format";
import { downloadXlsx } from "@/lib/xlsx";
import { BarChart, LineChart } from "../charts/Charts";
import { IconDownload } from "../icons";

const periods = {
  q1: { label: "1er trimestre 2026", months: ["2026-01", "2026-02", "2026-03"] },
  q2: { label: "2º trimestre 2026", months: ["2026-04", "2026-05", "2026-06"] },
  q3: { label: "3er trimestre 2026", months: ["2026-07", "2026-08", "2026-09"] },
  ytd: { label: "Enero a septiembre 2026", months: ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"] },
} as const;
type PeriodKey = keyof typeof periods;
type Compare = "anio" | "anterior";

const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

type SortKey = "month" | "cur" | "prev" | "var";

export default function BIDashboard() {
  const [company, setCompany] = useState<CompanyId | "todas">("todas");
  const [period, setPeriod] = useState<PeriodKey>("q3");
  const [compare, setCompare] = useState<Compare>("anio");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "month", dir: 1 });

  const cur = periods[period].months as readonly string[];
  const offset = compare === "anio" ? -12 : -cur.length;
  const prev = cur.map((m) => shiftMonth(m, offset));
  const compareLabel = compare === "anio" ? "mismo periodo 2025" : "periodo anterior";

  const base = useMemo(() => sales.filter((s) => company === "todas" || s.company === company), [company]);
  const inMonths = (ms: readonly string[]) => base.filter((s) => ms.includes(s.month));
  const curRows = useMemo(() => inMonths(cur), [base, period]); // eslint-disable-line react-hooks/exhaustive-deps
  const prevRows = useMemo(() => inMonths(prev), [base, period, compare]); // eslint-disable-line react-hooks/exhaustive-deps

  const kpi = (rows: Sale[]) => {
    const vig = rows.filter((r) => r.cfdi === "Vigente");
    const ventas = sum(vig, (r) => r.subtotal);
    return {
      ventas,
      facturas: vig.length,
      ticket: vig.length ? ventas / vig.length : 0,
      cancel: rows.length ? rows.filter((r) => r.cfdi === "Cancelado").length / rows.length : 0,
    };
  };
  const k = kpi(curRows);
  const kp = kpi(prevRows);
  const delta = (a: number, b: number) => (b ? a / b - 1 : 0);

  const vigentes = (rows: Sale[]) => rows.filter((r) => r.cfdi === "Vigente");
  const monthly = cur.map((m, i) => ({
    month: m,
    cur: sum(vigentes(curRows).filter((r) => r.month === m), (r) => r.subtotal),
    prev: sum(vigentes(prevRows).filter((r) => r.month === prev[i]), (r) => r.subtotal),
  }));
  const byCat = categories
    .map((c) => ({
      label: c,
      value: sum(vigentes(curRows).filter((r) => r.category === c), (r) => r.subtotal),
      prev: sum(vigentes(prevRows).filter((r) => r.category === c), (r) => r.subtotal),
    }))
    .sort((a, b) => b.value - a.value);
  const byRegion = regions
    .map((r) => ({
      label: r,
      value: sum(vigentes(curRows).filter((x) => x.region === r), (x) => x.subtotal),
      prev: sum(vigentes(prevRows).filter((x) => x.region === r), (x) => x.subtotal),
    }))
    .sort((a, b) => b.value - a.value);

  const best = [...byCat].sort((a, b) => delta(b.value, b.prev) - delta(a.value, a.prev));
  const top = best[0];
  const low = best[best.length - 1];

  const table = [...monthly].sort((a, b) => {
    const v = (r: typeof a) => (sort.key === "month" ? r.month : sort.key === "var" ? delta(r.cur, r.prev) : r[sort.key]);
    return (v(a) > v(b) ? 1 : v(a) < v(b) ? -1 : 0) * sort.dir;
  });
  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === "month" ? 1 : -1 }));
  const ariaSort = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none");

  const kpis = [
    { label: "Ventas sin IVA", v: money(k.ventas), d: delta(k.ventas, kp.ventas), good: 1 },
    { label: "Facturas vigentes", v: int(k.facturas), d: delta(k.facturas, kp.facturas), good: 1 },
    { label: "Ticket promedio", v: money(k.ticket), d: delta(k.ticket, kp.ticket), good: 1 },
    { label: "CFDI cancelados", v: `${(k.cancel * 100).toFixed(1)} %`, d: k.cancel - kp.cancel, good: -1, points: true },
  ];

  const exportData = () =>
    downloadXlsx(`dashboard_${period}_${company}.xlsx`, [
      {
        name: "Mensual",
        widths: [12, 16, 16, 12],
        rows: [["Mes", "Actual", "Comparación", "Variación %"], ...monthly.map((m) => [m.month, +m.cur.toFixed(2), +m.prev.toFixed(2), m.prev ? +((m.cur / m.prev - 1) * 100).toFixed(2) : null])],
      },
      {
        name: "Categorías",
        widths: [16, 16, 16],
        rows: [["Categoría", "Actual", "Comparación"], ...byCat.map((c) => [c.label, +c.value.toFixed(2), +(c.prev ?? 0).toFixed(2)])],
      },
    ]);

  return (
    <div className="window demo-app">
      <div className="window-bar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="window-title">Tablero de ventas</span>
        <span className="sim-flag">Datos sintéticos</span>
      </div>

      <div className="bi">
        <div className="bi-filters" role="group" aria-label="Filtros del tablero">
          <label className="field">
            <span>Empresa</span>
            <select value={company} onChange={(e) => setCompany(e.target.value as CompanyId | "todas")}>
              <option value="todas">Todas las empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Periodo</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)}>
              {(Object.keys(periods) as PeriodKey[]).map((p) => (
                <option key={p} value={p}>
                  {periods[p].label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="field">
            <legend>Comparar contra</legend>
            <div className="segmented">
              <label>
                <input type="radio" name="bi-cmp" checked={compare === "anio"} onChange={() => setCompare("anio")} />
                <span>Mismo periodo 2025</span>
              </label>
              <label>
                <input type="radio" name="bi-cmp" checked={compare === "anterior"} onChange={() => setCompare("anterior")} />
                <span>Periodo anterior</span>
              </label>
            </div>
          </fieldset>
          <button className="btn btn-sm bi-export" onClick={exportData}>
            <IconDownload /> Exportar
          </button>
        </div>

        <div className="kpis kpis-4">
          {kpis.map((x) => {
            const tone = Math.abs(x.d) < 0.0005 ? "flat" : x.d * x.good > 0 ? "up" : "down";
            return (
              <div className="kpi" key={x.label}>
                <span>{x.label}</span>
                <strong>{x.v}</strong>
                <em className={`delta ${tone}`}>
                  {x.points ? `${x.d > 0 ? "+" : ""}${(x.d * 100).toFixed(1)} pts` : pct(x.d)} vs {compareLabel}
                </em>
              </div>
            );
          })}
        </div>

        <div className="bi-grid">
          <div className="bi-card bi-wide">
            <h4>Tendencia mensual</h4>
            <LineChart
              title={`Ventas mensuales sin IVA, ${periods[period].label} contra ${compareLabel}`}
              labels={cur.map(monthLabel)}
              series={[
                { name: "Actual", values: monthly.map((m) => m.cur), color: "#4c8dff" },
                { name: compare === "anio" ? "2025" : "Periodo anterior", values: monthly.map((m) => m.prev), color: "#95a2b9", dashed: true },
              ]}
              format={(n) => short(n)}
              height={220}
            />
          </div>
          <div className="bi-card">
            <h4>Por categoría</h4>
            <BarChart title="Ventas por categoría" data={byCat} format={short} compare />
            <p className="muted-small">La marca vertical indica el {compareLabel}.</p>
          </div>
          <div className="bi-card">
            <h4>Por región</h4>
            <BarChart title="Ventas por región" data={byRegion} format={short} color="#3ad6e0" compare />
          </div>
          <div className="bi-card bi-wide">
            <h4>Detalle mensual</h4>
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Detalle mensual con comparación; selecciona un encabezado para ordenar</caption>
                <thead>
                  <tr>
                    {(
                      [
                        ["month", "Mes", ""],
                        ["cur", "Actual", "num"],
                        ["prev", "Comparación", "num"],
                        ["var", "Variación", "num"],
                      ] as [SortKey, string, string][]
                    ).map(([key, label, cls]) => (
                      <th key={key} scope="col" className={cls} aria-sort={ariaSort(key)}>
                        <button className="th-sort" onClick={() => sortBy(key)}>
                          {label}
                          <span aria-hidden="true">{sort.key === key ? (sort.dir === 1 ? "▲" : "▼") : ""}</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.map((m) => {
                    const d = delta(m.cur, m.prev);
                    return (
                      <tr key={m.month}>
                        <td className="nowrap">{monthLabel(m.month)}</td>
                        <td className="num">{money(m.cur)}</td>
                        <td className="num">{money(m.prev)}</td>
                        <td className={`num delta ${d > 0 ? "up" : d < 0 ? "down" : "flat"}`}>{pct(d)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">Total</th>
                    <td className="num">{money(sum(monthly, (m) => m.cur))}</td>
                    <td className="num">{money(sum(monthly, (m) => m.prev))}</td>
                    <td className="num">{pct(delta(sum(monthly, (m) => m.cur), sum(monthly, (m) => m.prev)))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="bi-card bi-wide bi-read">
            <h4>Cómo leer este tablero</h4>
            <p>
              Con estos filtros, {top.label.toLowerCase()} es la categoría que más creció ({pct(delta(top.value, top.prev))}) y{" "}
              {low.label.toLowerCase()} la que menos ({pct(delta(low.value, low.prev))}) contra el {compareLabel}. Comparar
              contra el mismo periodo del año anterior separa la estacionalidad de un cambio real; comparar contra el periodo
              inmediato anterior muestra el ritmo reciente. El detalle mensual permite verificar cada número del resumen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
