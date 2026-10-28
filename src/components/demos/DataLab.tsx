"use client";

import { useMemo, useState } from "react";
import { categories, companies, monthLabel, months, regions, sales, type CompanyId } from "@/lib/demo-data";
import { int, money, short, sum } from "@/lib/format";
import { LineChart } from "../charts/Charts";

type Dim = "company" | "category" | "region" | "customer";
const dimLabel: Record<Dim, string> = { company: "Empresa", category: "Categoría", region: "Región", customer: "Cliente" };
const dimCol: Record<Dim, string> = { company: "empresa", category: "categoria", region: "region", customer: "cliente" };

export default function DataLab() {
  const [sel, setSel] = useState<CompanyId[]>(["AUR", "NOR", "PAC"]);
  const [from, setFrom] = useState("2026-01");
  const [to, setTo] = useState("2026-09");
  const [cat, setCat] = useState<string>("todas");
  const [dim, setDim] = useState<Dim>("category");
  const [tab, setTab] = useState<"sql" | "python">("sql");

  const rangeError = from > to ? "El mes inicial debe ser anterior o igual al final." : null;

  const rows = useMemo(
    () =>
      rangeError
        ? []
        : sales.filter(
            (s) =>
              s.cfdi === "Vigente" &&
              sel.includes(s.company) &&
              s.month >= from &&
              s.month <= to &&
              (cat === "todas" || s.category === cat),
          ),
    [sel, from, to, cat, rangeError],
  );

  const span = months.filter((m) => m >= from && m <= to);
  const byMonth = span.map((m) => sum(rows.filter((r) => r.month === m), (r) => r.subtotal));
  const total = sum(rows, (r) => r.subtotal);
  const clients = new Set(rows.map((r) => r.customer)).size;

  const grouped = useMemo(() => {
    const map = new Map<string, { key: string; n: number; total: number }>();
    rows.forEach((r) => {
      const k = dim === "company" ? companies.find((c) => c.id === r.company)!.name : String(r[dim]);
      const g = map.get(k) ?? { key: k, n: 0, total: 0 };
      g.n++;
      g.total += r.subtotal;
      map.set(k, g);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [rows, dim]);

  const toggle = (id: CompanyId) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const inList = sel.map((s) => `'${s}'`).join(", ") || "NULL";
  const sqlText = `SELECT ${dimCol[dim]},
       COUNT(*)      AS facturas,
       SUM(subtotal) AS ventas
FROM ventas
WHERE estado = 'Vigente'
  AND empresa IN (${inList})
  AND DATE_FORMAT(fecha, '%Y-%m') BETWEEN '${from}' AND '${to}'${cat !== "todas" ? `\n  AND categoria = '${cat}'` : ""}
GROUP BY ${dimCol[dim]}
ORDER BY ventas DESC;`;

  const pyText = `import pandas as pd
from sqlalchemy import create_engine, text

engine = create_engine(DB_URL)  # la URL vive en una variable de entorno

consulta = text("""
    SELECT empresa, fecha, categoria, region, cliente, subtotal
    FROM ventas
    WHERE estado = 'Vigente'
      AND fecha BETWEEN :inicio AND :fin
""")
df = pd.read_sql(consulta, engine,
                 params={"inicio": "${from}-01", "fin": "${to}-${new Date(+to.slice(0, 4), +to.slice(5), 0).getDate()}"})

df = df[df["empresa"].isin([${sel.map((s) => `"${s}"`).join(", ")}])]${cat !== "todas" ? `\ndf = df[df["categoria"] == "${cat}"]` : ""}

resumen = (df.groupby("${dimCol[dim]}")
             .agg(facturas=("subtotal", "size"), ventas=("subtotal", "sum"))
             .sort_values("ventas", ascending=False))

mensual = df.resample("MS", on="fecha")["subtotal"].sum()
crecimiento = mensual.pct_change()  # comparación mes contra mes`;

  return (
    <div className="window demo-app">
      <div className="window-bar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="window-title">laboratorio_ventas.ipynb</span>
        <span className="sim-flag">Datos sintéticos</span>
      </div>

      <div className="lab">
        <div className="lab-filters" role="group" aria-label="Filtros">
          <fieldset className="field">
            <legend>Empresas</legend>
            {companies.map((c) => (
              <label className="check" key={c.id}>
                <input type="checkbox" checked={sel.includes(c.id)} onChange={() => toggle(c.id)} />
                <span>{c.name}</span>
              </label>
            ))}
          </fieldset>
          <div className="field-row">
            <label className="field">
              <span>Desde</span>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Hasta</span>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Categoría</span>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="todas">Todas</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Agrupar por</span>
            <select value={dim} onChange={(e) => setDim(e.target.value as Dim)}>
              {(Object.keys(dimLabel) as Dim[]).map((d) => (
                <option key={d} value={d}>
                  {dimLabel[d]}
                </option>
              ))}
            </select>
          </label>
          {rangeError && (
            <p className="form-errors" role="alert">
              {rangeError}
            </p>
          )}
          <p className="muted-small">
            {int(rows.length)} filas de {int(sales.length)} en la tabla de ejemplo. Regiones: {regions.join(", ")}.
          </p>
        </div>

        <div className="lab-main">
          {rows.length === 0 ? (
            <div className="empty-state">
              <p>{rangeError ? "Corrige el rango de meses para ver resultados." : "Ningún registro coincide. Selecciona al menos una empresa o amplía el periodo."}</p>
            </div>
          ) : (
            <>
              <div className="kpis kpis-4">
                <div className="kpi">
                  <span>Ventas sin IVA</span>
                  <strong>{money(total)}</strong>
                </div>
                <div className="kpi">
                  <span>Facturas</span>
                  <strong>{int(rows.length)}</strong>
                </div>
                <div className="kpi">
                  <span>Ticket promedio</span>
                  <strong>{money(total / rows.length)}</strong>
                </div>
                <div className="kpi">
                  <span>Clientes</span>
                  <strong>{clients}</strong>
                </div>
              </div>
              <LineChart
                title="Ventas sin IVA por mes"
                labels={span.map(monthLabel)}
                series={[{ name: "Ventas sin IVA", values: byMonth, color: "#4c8dff" }]}
                format={(n) => short(n)}
                height={210}
              />
              <div className="table-wrap">
                <table className="table">
                  <caption>Resultado agrupado por {dimLabel[dim].toLowerCase()}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{dimLabel[dim]}</th>
                      <th scope="col" className="num">Facturas</th>
                      <th scope="col" className="num">Ventas</th>
                      <th scope="col" className="num">Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.slice(0, 10).map((g) => (
                      <tr key={g.key}>
                        <td>{g.key}</td>
                        <td className="num">{int(g.n)}</td>
                        <td className="num">{money(g.total)}</td>
                        <td className="num">
                          <span className="share">
                            <span style={{ width: `${(g.total / total) * 100}%` }} />
                          </span>
                          {((g.total / total) * 100).toFixed(1)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Total de control</th>
                      <td className="num">{int(rows.length)}</td>
                      <td className="num">{money(total)}</td>
                      <td className="num">100 %</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}

          <div className="code-tabs">
            <div role="tablist" aria-label="Código equivalente" className="code-tabs-bar">
              <button role="tab" aria-selected={tab === "sql"} onClick={() => setTab("sql")}>
                SQL
              </button>
              <button role="tab" aria-selected={tab === "python"} onClick={() => setTab("python")}>
                Python
              </button>
              <span className="muted-small">Se actualiza con los filtros</span>
            </div>
            <pre role="tabpanel">
              <code>{tab === "sql" ? sqlText : pyText}</code>
            </pre>
          </div>
          <p className="lab-explain">
            SQL filtra y agrega donde viven los datos, para traer solo lo necesario. Python con pandas se encarga de
            lo que en SQL resulta incómodo: comparar periodos, combinar fuentes y exportar. La fila de total de control
            permite comprobar que ningún filtro dejó registros fuera.
          </p>
        </div>
      </div>
    </div>
  );
}
