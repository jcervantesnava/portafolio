"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { companies, sales, type CompanyId, type Sale } from "@/lib/demo-data";
import { int, money2, sum } from "@/lib/format";
import { downloadXlsx } from "@/lib/xlsx";
import { IconAlert, IconCheck, IconDownload, IconPlay, IconRefresh } from "../icons";

type ReportType = "cuadre" | "clientes";
type Phase = "idle" | "running" | "done" | "error";

const MIN = "2025-01-01";
const MAX = "2026-09-30";

const steps = [
  { label: "Conectando a MySQL", ms: 500 },
  { label: "Ejecutando consulta", ms: 900 },
  { label: "Procesando con pandas", ms: 700 },
  { label: "Validando totales", ms: 500 },
  { label: "Preparando Excel", ms: 400 },
];

interface Diff {
  folio: string;
  fecha: string;
  cliente: string;
  cfdi: number;
  conta: number;
  motivo: string;
}

function buildCuadre(rows: Sale[]) {
  const vigentes = rows.filter((r) => r.cfdi === "Vigente");
  const registrados = rows.filter((r) => r.posted);
  const diffs: Diff[] = [];
  rows.forEach((r) => {
    if (r.cfdi === "Vigente" && !r.posted)
      diffs.push({ folio: r.folio, fecha: r.date, cliente: r.customer, cfdi: r.total, conta: 0, motivo: "Falta registrar en contabilidad" });
    else if (r.cfdi === "Cancelado" && r.posted)
      diffs.push({ folio: r.folio, fecha: r.date, cliente: r.customer, cfdi: 0, conta: r.postedAmount, motivo: "CFDI cancelado con registro contable" });
    else if (r.posted && Math.abs(r.postedAmount - r.total) > 0.009)
      diffs.push({ folio: r.folio, fecha: r.date, cliente: r.customer, cfdi: r.total, conta: r.postedAmount, motivo: "Diferencia de importe" });
  });
  const totalCfdi = sum(vigentes, (r) => r.total);
  const totalConta = sum(registrados, (r) => r.postedAmount);
  return { vigentes: vigentes.length, registrados: registrados.length, totalCfdi, totalConta, diffs };
}

function buildClientes(rows: Sale[]) {
  const map = new Map<string, { cliente: string; facturas: number; subtotal: number; iva: number; total: number }>();
  rows
    .filter((r) => r.cfdi === "Vigente")
    .forEach((r) => {
      const m = map.get(r.customer) ?? { cliente: r.customer, facturas: 0, subtotal: 0, iva: 0, total: 0 };
      m.facturas++;
      m.subtotal += r.subtotal;
      m.iva += r.iva;
      m.total += r.total;
      map.set(r.customer, m);
    });
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export default function ReportAutomation() {
  const [company, setCompany] = useState<CompanyId>("AUR");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-09-30");
  const [type, setType] = useState<ReportType>("cuadre");
  const [failConn, setFailConn] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [ran, setRan] = useState<{ company: CompanyId; from: string; to: string; type: ReportType } | null>(null);
  const [exported, setExported] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!from || !to) e.push("Elige fecha inicial y final.");
    else {
      if (from > to) e.push("La fecha inicial debe ser anterior a la final.");
      if (from < MIN || to > MAX) e.push("Los datos de ejemplo cubren de enero 2025 a septiembre 2026.");
      const days = (new Date(to).getTime() - new Date(from).getTime()) / 86400000;
      if (days > 366) e.push("El rango máximo es de 12 meses.");
    }
    return e;
  }, [from, to]);

  const companyName = companies.find((c) => c.id === company)!.name;

  const sql =
    type === "cuadre"
      ? `SELECT c.folio, c.fecha, c.cliente, c.total, c.estado,\n       p.importe AS importe_contable\nFROM cfdi_ingresos c\nLEFT JOIN polizas_ingreso p ON p.folio = c.folio\nWHERE c.empresa = %(empresa)s\n  AND c.fecha BETWEEN %(inicio)s AND %(fin)s;`
      : `SELECT cliente, COUNT(*) AS facturas,\n       SUM(subtotal) AS subtotal, SUM(iva) AS iva,\n       SUM(total) AS total\nFROM cfdi_ingresos\nWHERE empresa = %(empresa)s AND estado = 'Vigente'\n  AND fecha BETWEEN %(inicio)s AND %(fin)s\nGROUP BY cliente ORDER BY total DESC;`;

  const rows = useMemo(
    () => (ran ? sales.filter((s) => s.company === ran.company && s.date >= ran.from && s.date <= ran.to) : []),
    [ran],
  );
  const cuadre = useMemo(() => (ran?.type === "cuadre" ? buildCuadre(rows) : null), [ran, rows]);
  const clientes = useMemo(() => (ran?.type === "clientes" ? buildClientes(rows) : null), [ran, rows]);

  const run = () => {
    if (errors.length || phase === "running") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("running");
    setStepIdx(0);
    setExported(null);
    setLog([`> generar_reporte(empresa="${company}", inicio="${from}", fin="${to}", tipo="${type}")`]);
    let t = 0;
    steps.forEach((s, i) => {
      t += s.ms;
      timers.current.push(
        window.setTimeout(() => {
          if (i === 0 && failConn) {
            setPhase("error");
            setLog((l) => [...l, "! Error 2003: no se pudo conectar al servidor MySQL (tiempo de espera agotado)."]);
            timers.current.forEach(clearTimeout);
            return;
          }
          setStepIdx(i + 1);
          setLog((l) => [...l, `  ${s.label}... ok`]);
          if (i === steps.length - 1) {
            setRan({ company, from, to, type });
            setPhase("done");
          }
        }, t),
      );
    });
  };

  const exportXlsx = () => {
    if (!ran) return;
    const name = `reporte_${ran.type}_${ran.company}_${ran.from}_${ran.to}.xlsx`;
    if (cuadre) {
      downloadXlsx(name, [
        {
          name: "Resumen",
          widths: [34, 20],
          rows: [
            ["Concepto", "Valor"],
            ["Empresa (ficticia)", companyName],
            ["Periodo", `${ran.from} a ${ran.to}`],
            ["CFDI vigentes", cuadre.vigentes],
            ["Registros contables", cuadre.registrados],
            ["Total CFDI", Math.round(cuadre.totalCfdi * 100) / 100],
            ["Total contabilidad", Math.round(cuadre.totalConta * 100) / 100],
            ["Diferencia", Math.round((cuadre.totalCfdi - cuadre.totalConta) * 100) / 100],
            ["Partidas por revisar", cuadre.diffs.length],
            ["Nota", "Datos sintéticos generados para un portafolio"],
          ],
        },
        {
          name: "Diferencias",
          widths: [14, 12, 24, 14, 14, 38],
          rows: [
            ["Folio", "Fecha", "Cliente", "Importe CFDI", "Importe contable", "Motivo"],
            ...cuadre.diffs.map((d) => [d.folio, d.fecha, d.cliente, d.cfdi, d.conta, d.motivo]),
          ],
        },
        {
          name: "Detalle",
          widths: [14, 12, 24, 14, 12, 14, 12],
          rows: [
            ["Folio", "Fecha", "Cliente", "Total", "Estado CFDI", "Importe contable", "Registrado"],
            ...rows.map((r) => [r.folio, r.date, r.customer, r.total, r.cfdi, r.postedAmount, r.posted ? "Sí" : "No"]),
          ],
        },
      ]);
    } else if (clientes) {
      downloadXlsx(name, [
        {
          name: "Ventas por cliente",
          widths: [26, 10, 16, 14, 16],
          rows: [
            ["Cliente", "Facturas", "Subtotal", "IVA", "Total"],
            ...clientes.map((c) => [c.cliente, c.facturas, +c.subtotal.toFixed(2), +c.iva.toFixed(2), +c.total.toFixed(2)]),
          ],
        },
      ]);
    }
    setExported(name);
  };

  const progress = phase === "done" ? 100 : (stepIdx / steps.length) * 100;
  const diff = cuadre ? cuadre.totalCfdi - cuadre.totalConta : 0;

  return (
    <div className="window demo-app">
      <div className="window-bar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="window-title">Generador de reportes contables</span>
        <span className="sim-flag">Datos sintéticos</span>
      </div>

      <div className="ra-body">
        <form
          className="ra-form"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          noValidate
        >
          <label className="field">
            <span>Empresa</span>
            <select value={company} onChange={(e) => setCompany(e.target.value as CompanyId)} disabled={phase === "running"}>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              <span>Fecha inicial</span>
              <input type="date" value={from} min={MIN} max={MAX} onChange={(e) => setFrom(e.target.value)} disabled={phase === "running"} />
            </label>
            <label className="field">
              <span>Fecha final</span>
              <input type="date" value={to} min={MIN} max={MAX} onChange={(e) => setTo(e.target.value)} disabled={phase === "running"} />
            </label>
          </div>
          <fieldset className="field">
            <legend>Reporte</legend>
            <div className="segmented">
              <label>
                <input type="radio" name="ra-type" checked={type === "cuadre"} onChange={() => setType("cuadre")} disabled={phase === "running"} />
                <span>Cuadre CFDI contra contabilidad</span>
              </label>
              <label>
                <input type="radio" name="ra-type" checked={type === "clientes"} onChange={() => setType("clientes")} disabled={phase === "running"} />
                <span>Ventas por cliente</span>
              </label>
            </div>
          </fieldset>
          <label className="check">
            <input type="checkbox" checked={failConn} onChange={(e) => setFailConn(e.target.checked)} disabled={phase === "running"} />
            <span>Simular falla de conexión</span>
          </label>

          {errors.length > 0 && (
            <ul className="form-errors" role="alert">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          <button className="btn btn-primary" type="submit" disabled={!!errors.length || phase === "running"}>
            {phase === "running" ? <span className="spinner" aria-hidden="true" /> : <IconPlay />}
            {phase === "running" ? "Generando..." : "Generar reporte"}
          </button>

          <details className="code-peek">
            <summary>Consulta SQL que se ejecuta</summary>
            <pre>
              <code>{sql}</code>
            </pre>
            <p className="muted-small">
              Parámetros: empresa=&quot;{company}&quot;, inicio=&quot;{from}&quot;, fin=&quot;{to}&quot;. Viajan separados de la consulta.
            </p>
          </details>
        </form>

        <div className="ra-output">
          <div className="ra-progress" aria-live="polite">
            <div className="ra-progress-head">
              <span>
                {phase === "idle" && "Listo para generar"}
                {phase === "running" && (steps[stepIdx]?.label ?? "Terminando")}
                {phase === "done" && "Reporte generado"}
                {phase === "error" && "No se pudo generar el reporte"}
              </span>
              <span>{Math.round(progress)} %</span>
            </div>
            <div className="progress" data-state={phase}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <ol className="ra-steps">
              {steps.map((s, i) => (
                <li key={s.label} data-state={i < stepIdx || phase === "done" ? "done" : i === stepIdx && phase === "running" ? "active" : phase === "error" && i === 0 ? "error" : "todo"}>
                  {s.label}
                </li>
              ))}
            </ol>
          </div>

          {log.length > 0 && (
            <pre className="ra-log" aria-label="Registro de ejecución">
              {log.join("\n")}
            </pre>
          )}

          {phase === "idle" && (
            <div className="empty-state">
              <p>Elige empresa, periodo y tipo de reporte, y presiona Generar reporte.</p>
            </div>
          )}

          {phase === "error" && (
            <div className="alert alert-error" role="alert">
              <IconAlert />
              <div>
                <strong>No se pudo conectar a la base de datos.</strong>
                <p>Verifica la red o la configuración de conexión y vuelve a intentarlo. No se generó ningún archivo.</p>
                <button
                  className="btn btn-sm"
                  type="button"
                  onClick={() => {
                    setFailConn(false);
                    setPhase("idle");
                    setLog([]);
                    setStepIdx(0);
                  }}
                >
                  <IconRefresh />
                  Quitar la falla y reintentar
                </button>
              </div>
            </div>
          )}

          {phase === "done" && cuadre && (
            <div className="ra-result">
              <div className="kpis kpis-4">
                <div className="kpi">
                  <span>CFDI vigentes</span>
                  <strong>{int(cuadre.vigentes)}</strong>
                </div>
                <div className="kpi">
                  <span>Registros contables</span>
                  <strong>{int(cuadre.registrados)}</strong>
                </div>
                <div className="kpi">
                  <span>Diferencia neta</span>
                  <strong className={Math.abs(diff) < 0.01 ? "ok" : "warn"}>{money2(diff)}</strong>
                </div>
                <div className="kpi">
                  <span>Partidas por revisar</span>
                  <strong className={cuadre.diffs.length ? "warn" : "ok"}>{cuadre.diffs.length}</strong>
                </div>
              </div>
              {cuadre.diffs.length === 0 ? (
                <div className="alert alert-ok">
                  <IconCheck />
                  <div>
                    <strong>Cuadra.</strong> Todos los CFDI vigentes tienen su registro contable con el mismo importe.
                  </div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <caption>Partidas por revisar</caption>
                    <thead>
                      <tr>
                        <th scope="col">Folio</th>
                        <th scope="col">Fecha</th>
                        <th scope="col" className="num">CFDI</th>
                        <th scope="col" className="num">Contable</th>
                        <th scope="col">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuadre.diffs.slice(0, 8).map((d) => (
                        <tr key={d.folio}>
                          <td className="mono">{d.folio}</td>
                          <td className="nowrap">{d.fecha}</td>
                          <td className="num">{money2(d.cfdi)}</td>
                          <td className="num">{money2(d.conta)}</td>
                          <td>{d.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {cuadre.diffs.length > 8 && <p className="muted-small">Se muestran 8 de {cuadre.diffs.length}. El Excel incluye todas.</p>}
                </div>
              )}
            </div>
          )}

          {phase === "done" && clientes && (
            <div className="ra-result">
              {clientes.length === 0 ? (
                <div className="empty-state">
                  <p>No hay ventas vigentes en este periodo.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <caption>Ventas por cliente, {companyName}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Cliente</th>
                        <th scope="col" className="num">Facturas</th>
                        <th scope="col" className="num">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.slice(0, 8).map((c) => (
                        <tr key={c.cliente}>
                          <td>{c.cliente}</td>
                          <td className="num">{c.facturas}</td>
                          <td className="num">{money2(c.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row">Total</th>
                        <td className="num">{sum(clientes, (c) => c.facturas)}</td>
                        <td className="num">{money2(sum(clientes, (c) => c.total))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="ra-export">
              <button className="btn" type="button" onClick={exportXlsx}>
                <IconDownload />
                Exportar a Excel
              </button>
              {exported && (
                <span className="muted-small" role="status">
                  Descargado: {exported}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
