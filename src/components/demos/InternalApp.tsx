"use client";

import { useMemo, useState } from "react";
import { costCenters, suppliers } from "@/lib/demo-data";
import { money2 } from "@/lib/format";
import { downloadXlsx } from "@/lib/xlsx";
import { IconCheck, IconDownload, IconRefresh } from "../icons";

type Status = "Borrador" | "En revisión" | "Aprobada" | "Rechazada";
const statuses: Status[] = ["Borrador", "En revisión", "Aprobada", "Rechazada"];
const statusClass: Record<Status, string> = {
  Borrador: "st-draft",
  "En revisión": "st-review",
  Aprobada: "st-ok",
  Rechazada: "st-bad",
};

interface Req {
  id: string;
  date: string;
  supplier: string;
  cc: string;
  description: string;
  qty: number;
  price: number;
  status: Status;
  justification?: string;
}

const seed: Req[] = [
  { id: "REQ-0412", date: "2026-10-02", supplier: "P-104", cc: "CC-2100", description: "Resina base para pruebas de laboratorio", qty: 40, price: 860, status: "Aprobada" },
  { id: "REQ-0413", date: "2026-10-03", supplier: "P-145", cc: "CC-1100", description: "Carpetas y papelería de cierre mensual", qty: 120, price: 38.5, status: "Aprobada" },
  { id: "REQ-0414", date: "2026-10-07", supplier: "P-162", cc: "CC-2100", description: "Mantenimiento preventivo de mezcladora", qty: 1, price: 18400, status: "En revisión" },
  { id: "REQ-0415", date: "2026-10-09", supplier: "P-131", cc: "CC-3100", description: "Flete de reabastecimiento a sucursal norte", qty: 3, price: 6200, status: "En revisión" },
  { id: "REQ-0416", date: "2026-10-12", supplier: "P-118", cc: "CC-3100", description: "Envases de 4 litros con tapa", qty: 2500, price: 21.4, status: "En revisión", justification: "Pedido de temporada alta" },
  { id: "REQ-0417", date: "2026-10-14", supplier: "P-145", cc: "CC-4100", description: "Etiquetas para impresora térmica", qty: 30, price: 145, status: "Rechazada" },
  { id: "REQ-0418", date: "2026-10-20", supplier: "P-104", cc: "CC-2100", description: "Solvente para limpieza de equipo", qty: 60, price: 310, status: "Borrador" },
  { id: "REQ-0419", date: "2026-10-22", supplier: "P-162", cc: "CC-1200", description: "Revisión de caja fuerte", qty: 1, price: 2900, status: "Borrador" },
];

const LIMIT = 50000;
const empty = { supplier: "", cc: "", description: "", qty: "", price: "", justification: "" };

const supName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;
const ccName = (id: string) => costCenters.find((c) => c.id === id)?.name ?? id;

export default function InternalApp() {
  const [view, setView] = useState<"lista" | "nueva" | "catalogos">("lista");
  const [reqs, setReqs] = useState<Req[]>(seed);
  const [filter, setFilter] = useState<Status | "Todas">("Todas");
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast((t) => (t === m ? null : t)), 2600);
  };

  const counts = useMemo(() => Object.fromEntries(statuses.map((s) => [s, reqs.filter((r) => r.status === s).length])) as Record<Status, number>, [reqs]);

  const visible = reqs.filter(
    (r) =>
      (filter === "Todas" || r.status === filter) &&
      (!q.trim() ||
        `${r.id} ${r.description} ${supName(r.supplier)} ${ccName(r.cc)}`.toLowerCase().includes(q.trim().toLowerCase())),
  );

  const qty = Number(form.qty);
  const price = Number(form.price);
  const total = qty > 0 && price > 0 ? qty * price : 0;
  const errors: Record<string, string> = {};
  if (!form.supplier) errors.supplier = "Elige un proveedor del catálogo.";
  if (!form.cc) errors.cc = "Elige un centro de costo.";
  if (form.description.trim().length < 8) errors.description = "Describe el artículo o servicio (mínimo 8 caracteres).";
  if (!form.qty || !Number.isInteger(qty) || qty <= 0) errors.qty = "La cantidad debe ser un número entero mayor a 0.";
  else if (qty > 10000) errors.qty = "La cantidad máxima por requisición es 10,000.";
  if (!form.price || !(price > 0)) errors.price = "El precio unitario debe ser mayor a 0.";
  if (total > LIMIT && form.justification.trim().length < 10)
    errors.justification = `Las requisiciones mayores a ${money2(LIMIT)} necesitan justificación (mínimo 10 caracteres).`;
  const valid = Object.keys(errors).length === 0;

  const show = (k: string) => touched[k] && errors[k];

  const save = (status: Status) => {
    setTouched({ supplier: true, cc: true, description: true, qty: true, price: true, justification: true });
    if (!valid) return;
    const next = Math.max(...reqs.map((r) => Number(r.id.slice(4)))) + 1;
    const r: Req = {
      id: `REQ-${String(next).padStart(4, "0")}`,
      date: new Date().toISOString().slice(0, 10),
      supplier: form.supplier,
      cc: form.cc,
      description: form.description.trim(),
      qty,
      price,
      status,
      justification: form.justification.trim() || undefined,
    };
    setReqs((rs) => [r, ...rs]);
    setForm(empty);
    setTouched({});
    setView("lista");
    setFilter("Todas");
    flash(status === "Borrador" ? `${r.id} guardada como borrador` : `${r.id} enviada a revisión`);
  };

  const setStatus = (id: string, status: Status) => {
    setReqs((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const verb = { Borrador: "regresada a borrador", "En revisión": "enviada a revisión", Aprobada: "aprobada", Rechazada: "rechazada" }[status];
    flash(`${id} ${verb}`);
  };

  const exportRows = () => {
    downloadXlsx(`requisiciones_${new Date().toISOString().slice(0, 10)}.xlsx`, [
      {
        name: "Requisiciones",
        widths: [11, 11, 34, 16, 40, 9, 12, 14, 13],
        rows: [
          ["Folio", "Fecha", "Proveedor", "Centro de costo", "Descripción", "Cantidad", "Precio", "Total", "Estado"],
          ...visible.map((r) => [r.id, r.date, supName(r.supplier), ccName(r.cc), r.description, r.qty, r.price, +(r.qty * r.price).toFixed(2), r.status]),
        ],
      },
    ]);
    flash(`Exportadas ${visible.length} requisiciones`);
  };

  return (
    <div className="window demo-app">
      <div className="window-bar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="window-title">Requisiciones internas</span>
        <span className="sim-flag">Datos de ejemplo</span>
      </div>

      <div className="gx">
        <nav className="gx-side" aria-label="Módulos">
          <button aria-current={view === "lista" ? "page" : undefined} onClick={() => setView("lista")}>
            Requisiciones
            <span className="count">{reqs.length}</span>
          </button>
          <button aria-current={view === "nueva" ? "page" : undefined} onClick={() => setView("nueva")}>
            Nueva requisición
          </button>
          <button aria-current={view === "catalogos" ? "page" : undefined} onClick={() => setView("catalogos")}>
            Catálogos
          </button>
          <button
            className="gx-reset"
            onClick={() => {
              setReqs(seed);
              setFilter("Todas");
              setQ("");
              flash("Datos de ejemplo restaurados");
            }}
          >
            <IconRefresh /> Restaurar datos
          </button>
        </nav>

        <div className="gx-main">
          {view === "lista" && (
            <>
              <div className="gx-status-row" role="group" aria-label="Filtrar por estado">
                <button className={`status-filter${filter === "Todas" ? " on" : ""}`} aria-pressed={filter === "Todas"} onClick={() => setFilter("Todas")}>
                  Todas <b>{reqs.length}</b>
                </button>
                {statuses.map((s) => (
                  <button key={s} className={`status-filter ${statusClass[s]}${filter === s ? " on" : ""}`} aria-pressed={filter === s} onClick={() => setFilter(s)}>
                    {s} <b>{counts[s]}</b>
                  </button>
                ))}
              </div>
              <div className="gx-toolbar">
                <label className="field gx-search">
                  <span className="sr-only">Buscar</span>
                  <input type="search" placeholder="Buscar por folio, proveedor o descripción" value={q} onChange={(e) => setQ(e.target.value)} />
                </label>
                <button className="btn btn-sm" onClick={exportRows} disabled={!visible.length}>
                  <IconDownload /> Exportar a Excel
                </button>
              </div>
              {visible.length === 0 ? (
                <div className="empty-state">
                  <p>No hay requisiciones con este filtro.</p>
                  <button className="btn btn-sm" onClick={() => setView("nueva")}>
                    Crear requisición
                  </button>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <caption className="sr-only">Requisiciones</caption>
                    <thead>
                      <tr>
                        <th scope="col">Folio</th>
                        <th scope="col">Descripción</th>
                        <th scope="col">Centro de costo</th>
                        <th scope="col" className="num">Total</th>
                        <th scope="col">Estado</th>
                        <th scope="col">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => (
                        <tr key={r.id}>
                          <td className="mono">{r.id}</td>
                          <td>
                            {r.description}
                            <div className="cell-sub">{supName(r.supplier)}</div>
                          </td>
                          <td>{ccName(r.cc)}</td>
                          <td className="num">{money2(r.qty * r.price)}</td>
                          <td>
                            <span className={`pill ${statusClass[r.status]}`}>{r.status}</span>
                          </td>
                          <td className="row-actions">
                            {r.status === "Borrador" && (
                              <button className="btn btn-sm" onClick={() => setStatus(r.id, "En revisión")}>
                                Enviar
                              </button>
                            )}
                            {r.status === "En revisión" && (
                              <>
                                <button className="btn btn-sm" onClick={() => setStatus(r.id, "Aprobada")}>
                                  Aprobar
                                </button>
                                <button className="btn btn-sm btn-ghost" onClick={() => setStatus(r.id, "Rechazada")}>
                                  Rechazar
                                </button>
                              </>
                            )}
                            {r.status === "Rechazada" && (
                              <button className="btn btn-sm btn-ghost" onClick={() => setStatus(r.id, "Borrador")}>
                                Corregir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {view === "nueva" && (
            <form
              className="gx-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                save("En revisión");
              }}
            >
              <div className="field-row">
                <label className={`field${show("supplier") ? " invalid" : ""}`}>
                  <span>Proveedor</span>
                  <select
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, supplier: true }))}
                    aria-invalid={!!show("supplier")}
                    aria-describedby="err-supplier"
                  >
                    <option value="">Selecciona…</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} {s.name}
                      </option>
                    ))}
                  </select>
                  {show("supplier") && <em id="err-supplier">{errors.supplier}</em>}
                </label>
                <label className={`field${show("cc") ? " invalid" : ""}`}>
                  <span>Centro de costo</span>
                  <select
                    value={form.cc}
                    onChange={(e) => setForm({ ...form, cc: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, cc: true }))}
                    aria-invalid={!!show("cc")}
                    aria-describedby="err-cc"
                  >
                    <option value="">Selecciona…</option>
                    {costCenters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} {c.name}
                      </option>
                    ))}
                  </select>
                  {show("cc") && <em id="err-cc">{errors.cc}</em>}
                </label>
              </div>
              <label className={`field${show("description") ? " invalid" : ""}`}>
                <span>Descripción</span>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                  aria-invalid={!!show("description")}
                  aria-describedby="err-description"
                  maxLength={120}
                />
                {show("description") && <em id="err-description">{errors.description}</em>}
              </label>
              <div className="field-row">
                <label className={`field${show("qty") ? " invalid" : ""}`}>
                  <span>Cantidad</span>
                  <input
                    inputMode="numeric"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value.replace(/[^\d]/g, "") })}
                    onBlur={() => setTouched((t) => ({ ...t, qty: true }))}
                    aria-invalid={!!show("qty")}
                    aria-describedby="err-qty"
                  />
                  {show("qty") && <em id="err-qty">{errors.qty}</em>}
                </label>
                <label className={`field${show("price") ? " invalid" : ""}`}>
                  <span>Precio unitario (MXN)</span>
                  <input
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\d.]/g, "") })}
                    onBlur={() => setTouched((t) => ({ ...t, price: true }))}
                    aria-invalid={!!show("price")}
                    aria-describedby="err-price"
                  />
                  {show("price") && <em id="err-price">{errors.price}</em>}
                </label>
              </div>
              <div className="gx-total">
                Total estimado <strong>{money2(total)}</strong>
                {total > LIMIT && <span className="pill st-review">Requiere justificación</span>}
              </div>
              {total > LIMIT && (
                <label className={`field${show("justification") ? " invalid" : ""}`}>
                  <span>Justificación</span>
                  <textarea
                    rows={2}
                    value={form.justification}
                    onChange={(e) => setForm({ ...form, justification: e.target.value })}
                    onBlur={() => setTouched((t) => ({ ...t, justification: true }))}
                    aria-invalid={!!show("justification")}
                    aria-describedby="err-justification"
                  />
                  {show("justification") && <em id="err-justification">{errors.justification}</em>}
                </label>
              )}
              <div className="gx-form-actions">
                <button type="submit" className="btn btn-primary">
                  Enviar a revisión
                </button>
                <button type="button" className="btn" onClick={() => save("Borrador")}>
                  Guardar borrador
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setForm(empty);
                    setTouched({});
                  }}
                >
                  Limpiar
                </button>
              </div>
            </form>
          )}

          {view === "catalogos" && (
            <div className="gx-catalogs">
              <div className="table-wrap">
                <table className="table">
                  <caption>Proveedores</caption>
                  <thead>
                    <tr>
                      <th scope="col">Clave</th>
                      <th scope="col">Nombre</th>
                      <th scope="col" className="num">Requisiciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => (
                      <tr key={s.id}>
                        <td className="mono">{s.id}</td>
                        <td>{s.name}</td>
                        <td className="num">{reqs.filter((r) => r.supplier === s.id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <caption>Centros de costo</caption>
                  <thead>
                    <tr>
                      <th scope="col">Clave</th>
                      <th scope="col">Área</th>
                      <th scope="col" className="num">Monto aprobado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costCenters.map((c) => (
                      <tr key={c.id}>
                        <td className="mono">{c.id}</td>
                        <td>{c.name}</td>
                        <td className="num">
                          {money2(reqs.filter((r) => r.cc === c.id && r.status === "Aprobada").reduce((a, r) => a + r.qty * r.price, 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="toast" role="status">
          <IconCheck /> {toast}
        </div>
      )}
    </div>
  );
}
