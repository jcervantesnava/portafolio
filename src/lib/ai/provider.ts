/**
 * Capa de IA intercambiable.
 *
 * Hoy el sitio usa `SimulatedProvider`: respuestas PREESCRITAS que se muestran
 * por partes. No hay ningún modelo detrás y la interfaz lo dice claramente.
 *
 * Para conectar un modelo real:
 *  1. Despliega un backend propio (ver server-examples/ai-proxy.ts y docs/ia-backend.md).
 *     La clave de la API vive SOLO ahí, en una variable de entorno del servidor.
 *  2. Define NEXT_PUBLIC_AI_ENDPOINT con la URL de ese backend.
 *  3. `getProvider()` usará `RemoteProvider` automáticamente.
 *
 * Nunca pongas una clave de API en el frontend ni en este repositorio.
 */

export type AITask = "error" | "sql" | "automatizar" | "documentar";

export interface AIRequest {
  task: AITask;
  input: string;
}

export interface AIProvider {
  /** "simulacion" o "remoto": la interfaz lo muestra al usuario. */
  readonly kind: "simulacion" | "remoto";
  /** Devuelve la respuesta en fragmentos para mostrarla progresivamente. */
  stream(req: AIRequest, signal?: AbortSignal): AsyncGenerator<string>;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Cancelado", "AbortError"));
    });
  });

export class SimulatedProvider implements AIProvider {
  readonly kind = "simulacion" as const;
  constructor(private answers: Record<AITask, string>, private fast = false) {}

  async *stream(req: AIRequest, signal?: AbortSignal) {
    const text = this.answers[req.task];
    if (!text) throw new Error("No hay una respuesta preescrita para esta tarea.");
    // Se entrega por palabras para simular la lectura progresiva.
    const tokens = text.split(/(\s+)/);
    for (const t of tokens) {
      if (signal?.aborted) throw new DOMException("Cancelado", "AbortError");
      if (!this.fast) await sleep(t.includes("\n") ? 30 : 12, signal);
      yield t;
    }
  }
}

export class RemoteProvider implements AIProvider {
  readonly kind = "remoto" as const;
  constructor(private endpoint: string) {}

  async *stream(req: AIRequest, signal?: AbortSignal) {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal,
    });
    if (!res.ok || !res.body) {
      throw new Error(`El servicio de IA respondió ${res.status}. Intenta de nuevo en unos minutos.`);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield dec.decode(value, { stream: true });
    }
  }
}

export function getProvider(answers: Record<AITask, string>, fast = false): AIProvider {
  const endpoint = process.env.NEXT_PUBLIC_AI_ENDPOINT;
  return endpoint ? new RemoteProvider(endpoint) : new SimulatedProvider(answers, fast);
}
