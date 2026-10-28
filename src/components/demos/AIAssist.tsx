"use client";

import { useEffect, useRef, useState } from "react";
import { getProvider, type AITask } from "@/lib/ai/provider";
import { IconAlert, IconCheck, IconPlay, IconRefresh } from "../icons";

const cases: Record<AITask, { label: string; input: string; review: string[] }> = {
  error: {
    label: "Analizar un error",
    input: `Mi script de conciliación falla al exportar:

Traceback (most recent call last):
  File "cuadre.py", line 41, in <module>
    df["total"] = df["subtotal"] + df["iva"]
TypeError: can only concatenate str (not "float") to str`,
    review: ["Reproduje el error con un archivo de prueba", "La corrección no cambia los totales esperados", "Agregué el caso a mis pruebas"],
  },
  sql: {
    label: "Borrador de consulta SQL",
    input: `Necesito los folios de CFDI vigentes de septiembre 2026 que no tienen póliza en contabilidad.
Tablas: cfdi_ingresos(folio, fecha, empresa, total, estado) y polizas_ingreso(folio, importe).`,
    review: ["Revisé que el JOIN sea el correcto", "Comparé el conteo contra una revisión manual", "Probé con una empresa sin diferencias"],
  },
  automatizar: {
    label: "Automatizar una tarea",
    input: `Cada lunes descargo 3 archivos CSV de ventas, los junto en uno, quito duplicados por folio y lo guardo como Excel con la fecha en el nombre.`,
    review: ["Probé con archivos con duplicados", "Verifiqué el conteo antes y después", "Definí qué pasa si falta un archivo"],
  },
  documentar: {
    label: "Documentar un proceso",
    input: `Documenta para usuarios el uso del generador de reportes: elegir empresa, fechas, generar y revisar diferencias.`,
    review: ["Un usuario siguió los pasos sin ayuda", "Los nombres coinciden con la pantalla real", "Incluye qué hacer ante un error"],
  },
};

// Respuestas PREESCRITAS para la simulación. No las genera ningún modelo.
const answers: Record<AITask, string> = {
  error: `Causa probable: la columna "subtotal" o "iva" se leyó como texto, no como número. Pasa cuando el CSV trae comas de miles o celdas vacías.

Propuesta:
\`\`\`python
for col in ["subtotal", "iva"]:
    df[col] = pd.to_numeric(
        df[col].astype(str).str.replace(",", "", regex=False),
        errors="coerce",
    )

invalidos = df[df[["subtotal", "iva"]].isna().any(axis=1)]
if not invalidos.empty:
    raise ValueError(f"{len(invalidos)} filas con importes no numéricos")

df["total"] = df["subtotal"] + df["iva"]
\`\`\`

Por qué así: convertir con errors="coerce" no oculta el problema; las filas que no se pudieron convertir se reportan en lugar de sumarse en silencio.`,
  sql: `Borrador para MySQL:
\`\`\`sql
SELECT c.folio, c.fecha, c.empresa, c.total
FROM cfdi_ingresos AS c
LEFT JOIN polizas_ingreso AS p
       ON p.folio = c.folio
WHERE c.estado = 'Vigente'
  AND c.fecha >= '2026-09-01'
  AND c.fecha <  '2026-10-01'
  AND p.folio IS NULL
ORDER BY c.empresa, c.fecha;
\`\`\`

Notas para revisar:
- El LEFT JOIN con "p.folio IS NULL" deja solo los CFDI sin póliza.
- El rango usa "< 2026-10-01" para incluir todo el 30 de septiembre aunque la fecha tenga hora.
- Si un folio puede repetirse entre empresas, el JOIN también debe comparar la empresa.`,
  automatizar: `Propuesta de script:
\`\`\`python
from datetime import date
from pathlib import Path
import pandas as pd

ORIGEN = Path("descargas")
archivos = sorted(ORIGEN.glob("ventas_*.csv"))
if len(archivos) != 3:
    raise SystemExit(f"Se esperaban 3 archivos y hay {len(archivos)}")

df = pd.concat((pd.read_csv(a) for a in archivos), ignore_index=True)
antes = len(df)
df = df.drop_duplicates(subset="folio")

salida = f"ventas_{date.today():%Y-%m-%d}.xlsx"
df.to_excel(salida, index=False)
print(f"{antes} filas leídas, {antes - len(df)} duplicados quitados -> {salida}")
\`\`\`

Siguiente paso posible: programarlo con el Programador de tareas de Windows o empaquetarlo con PyInstaller para que el área lo ejecute con doble clic.`,
  documentar: `Generador de reportes: guía rápida

1. Elige la empresa en la lista.
2. Indica fecha inicial y final. El rango máximo es de 12 meses.
3. Elige el tipo de reporte y presiona Generar reporte.
4. Espera a que la barra llegue al 100 %. Cada paso se muestra en pantalla.
5. Revisa las partidas por revisar. Si la diferencia neta es $0.00, el periodo cuadra.
6. Presiona Exportar a Excel para guardar el archivo.

Si aparece un error de conexión: revisa tu red y vuelve a intentarlo. Si persiste, reporta el mensaje completo al área de sistemas. No se genera ningún archivo cuando hay un error.`,
};

const uses = [
  { t: "Desarrollar código", d: "Primeros borradores de funciones y scripts." },
  { t: "Analizar errores", d: "Leer un traceback y proponer causas probables." },
  { t: "Borradores de SQL", d: "Una consulta inicial a partir de la pregunta y las tablas." },
  { t: "Automatizar tareas", d: "Convertir un procedimiento manual en un script." },
  { t: "Documentar procesos", d: "Guías para usuarios y notas técnicas." },
  { t: "Prototipar", d: "Validar una idea con el usuario antes de construirla completa." },
];

function Rendered({ text }: { text: string }) {
  // Cada ``` alterna entre texto normal y bloque de código.
  const segments = text.split(/```(?:\w+)?\n?/);
  return (
    <>
      {segments.map((s, i) =>
        i % 2 === 0 ? (
          s.trim() ? (
            <p key={i} className="ai-text">
              {s.trim()}
            </p>
          ) : null
        ) : (
          <pre key={i} className="ai-code">
            <code>{s.replace(/\n$/, "")}</code>
          </pre>
        ),
      )}
    </>
  );
}

export default function AIAssist() {
  const [task, setTask] = useState<AITask>("error");
  const [output, setOutput] = useState("");
  const [state, setState] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const ctrl = useRef<AbortController | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => ctrl.current?.abort();
  }, []);

  const provider = getProvider(answers, reduced);
  const c = cases[task];

  const choose = (t: AITask) => {
    ctrl.current?.abort();
    setTask(t);
    setOutput("");
    setState("idle");
    setChecks([false, false, false]);
  };

  const run = async () => {
    ctrl.current?.abort();
    const ac = new AbortController();
    ctrl.current = ac;
    setOutput("");
    setChecks([false, false, false]);
    setState("streaming");
    try {
      for await (const chunk of provider.stream({ task, input: c.input }, ac.signal)) {
        setOutput((o) => o + chunk);
      }
      setState("done");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setErrorMsg((e as Error).message);
      setState("error");
    }
  };

  const approved = checks.every(Boolean);

  return (
    <div className="window demo-app">
      <div className="window-bar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="window-title">asistente_desarrollo</span>
        <span className="sim-flag">{provider.kind === "simulacion" ? "Simulación local" : "Modelo conectado"}</span>
      </div>

      {provider.kind === "simulacion" && (
        <div className="ai-banner" role="note">
          <IconAlert />
          <p>
            <strong>Simulación.</strong> Esta demo no está conectada a ningún modelo de IA. Las respuestas están
            escritas de antemano y se muestran por partes para ilustrar el flujo de trabajo.
          </p>
        </div>
      )}

      <div className="ai">
        <div className="ai-tasks" role="tablist" aria-label="Caso de uso">
          {(Object.keys(cases) as AITask[]).map((t) => (
            <button key={t} role="tab" aria-selected={task === t} className="ai-task" onClick={() => choose(t)}>
              {cases[t].label}
            </button>
          ))}
        </div>

        <div className="ai-flow">
          <div className="ai-col">
            <div className="ai-step-title">
              <span className="ai-step-n">1</span> Problema (ejemplo fijo)
            </div>
            <pre className="ai-input">{c.input}</pre>
            <button className="btn btn-primary" onClick={run} disabled={state === "streaming"}>
              {state === "streaming" ? <span className="spinner" aria-hidden="true" /> : <IconPlay />}
              {state === "streaming" ? "Mostrando..." : provider.kind === "simulacion" ? "Mostrar respuesta de ejemplo" : "Consultar al modelo"}
            </button>
          </div>

          <div className="ai-col">
            <div className="ai-step-title">
              <span className="ai-step-n">2</span> Propuesta {provider.kind === "simulacion" ? "preescrita" : "del modelo"}
            </div>
            <div className="ai-output" aria-live="polite" aria-busy={state === "streaming"}>
              {state === "idle" && <p className="muted-small">La propuesta aparecerá aquí.</p>}
              {state === "error" && (
                <div className="alert alert-error" role="alert">
                  <IconAlert />
                  <div>
                    <strong>No se obtuvo respuesta.</strong>
                    <p>{errorMsg}</p>
                    <button className="btn btn-sm" onClick={run}>
                      <IconRefresh />
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
              {output && <Rendered text={output} />}
              {state === "streaming" && <span className="caret" aria-hidden="true" />}
            </div>
          </div>

          <div className="ai-col">
            <div className="ai-step-title">
              <span className="ai-step-n">3</span> Revisión humana
            </div>
            <fieldset className="ai-review" disabled={state !== "done"}>
              <legend className="sr-only">Lista de revisión</legend>
              {c.review.map((r, i) => (
                <label className="check" key={r}>
                  <input
                    type="checkbox"
                    checked={checks[i]}
                    onChange={(e) => setChecks((cs) => cs.map((v, j) => (j === i ? e.target.checked : v)))}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </fieldset>
            <div className={`ai-verdict ${approved ? "ok" : ""}`} role="status">
              {state !== "done" ? (
                "Disponible cuando termine la propuesta."
              ) : approved ? (
                <>
                  <IconCheck /> Lista para integrarse
                </>
              ) : (
                "Pendiente de revisión: nada se usa sin probarlo."
              )}
            </div>
          </div>
        </div>

        <div className="ai-arch">
          <div className="ai-arch-head">
            <h4>Arquitectura preparada para un modelo real</h4>
            <p className="muted-small">La clave de la API nunca llega al navegador.</p>
          </div>
          <ol className="ai-arch-flow">
            <li>
              <strong>Navegador</strong>
              <span>Envía la tarea y el texto</span>
            </li>
            <li className={provider.kind === "simulacion" ? "current" : ""}>
              <strong>Simulación local</strong>
              <span>Activa hoy</span>
            </li>
            <li className={provider.kind === "remoto" ? "current" : ""}>
              <strong>Backend propio</strong>
              <span>Valida, limita uso, guarda la clave</span>
            </li>
            <li>
              <strong>Proveedor de IA</strong>
              <span>Genera la propuesta</span>
            </li>
          </ol>
        </div>

        <ul className="ai-uses">
          {uses.map((u) => (
            <li key={u.t}>
              <strong>{u.t}</strong>
              <span>{u.d}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
