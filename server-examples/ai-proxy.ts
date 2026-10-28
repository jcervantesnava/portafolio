/**
 * EJEMPLO de backend seguro para conectar la demo de IA con un modelo real.
 * No se usa en el sitio estático; es una plantilla para desplegar aparte
 * (por ejemplo como función serverless en Vercel: api/ai.ts en otro proyecto,
 * o como Cloudflare Worker).
 *
 * Variables de entorno del SERVIDOR (nunca en el frontend):
 *   AI_API_KEY        clave del proveedor de IA
 *   AI_API_URL        endpoint del proveedor (p. ej. API de mensajes)
 *   AI_MODEL          nombre del modelo
 *   ALLOWED_ORIGIN    dominio de tu portafolio, p. ej. https://johan-cervantes.vercel.app
 *
 * Controles incluidos: CORS restringido, validación de entrada, límite de
 * tamaño y lista cerrada de tareas. Agrega límite de peticiones por IP
 * (rate limiting) con el servicio que uses (Upstash, KV, etc.).
 */

const TASKS = {
  error: "Analiza el error y propone una corrección explicada en español.",
  sql: "Redacta un borrador de consulta SQL para MySQL y explica cada parte.",
  automatizar: "Propón un script en Python para automatizar la tarea descrita.",
  documentar: "Documenta el proceso descrito en un formato claro para usuarios.",
} as const;

export default async function handler(req: Request): Promise<Response> {
  const origin = process.env.ALLOWED_ORIGIN ?? "";
  const cors = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405, headers: cors });
  if (req.headers.get("origin") !== origin) return new Response("Origen no permitido", { status: 403 });

  let body: { task?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("JSON inválido", { status: 400, headers: cors });
  }
  const task = body.task as keyof typeof TASKS;
  const input = (body.input ?? "").toString();
  if (!(task in TASKS)) return new Response("Tarea no válida", { status: 400, headers: cors });
  if (!input.trim() || input.length > 4000) {
    return new Response("La entrada debe tener entre 1 y 4000 caracteres", { status: 400, headers: cors });
  }

  const upstream = await fetch(process.env.AI_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Ajusta el encabezado de autenticación según el proveedor.
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      max_tokens: 800,
      system: `Eres un asistente de desarrollo. ${TASKS[task]} No inventes datos.`,
      messages: [{ role: "user", content: input }],
    }),
  });

  if (!upstream.ok) {
    return new Response("El proveedor de IA no está disponible", { status: 502, headers: cors });
  }
  const data = await upstream.json();
  // Adapta esta línea al formato de respuesta de tu proveedor.
  const text: string = data?.content?.[0]?.text ?? data?.choices?.[0]?.message?.content ?? "";
  return new Response(text, { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });
}
