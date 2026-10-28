# Conectar la demo de IA a un modelo real

Hoy la demo C usa `SimulatedProvider` (`src/lib/ai/provider.ts`): respuestas escritas de antemano. Para usar un modelo real:

## 1. Desplegar un backend propio

Usa `server-examples/ai-proxy.ts` como plantilla. Opciones:

- **Vercel Functions:** crea un proyecto aparte (o quita `output: "export"` de este) y coloca el archivo como `app/api/ia/route.ts` exportando `POST`.
- **Cloudflare Workers:** adapta el `handler` como `fetch` del worker.

Variables de entorno **del servidor** (nunca con prefijo `NEXT_PUBLIC_`):

| Variable | Para qué |
| --- | --- |
| `AI_API_KEY` | Clave del proveedor |
| `AI_API_URL` | Endpoint del proveedor |
| `AI_MODEL` | Modelo a usar |
| `ALLOWED_ORIGIN` | Dominio del portafolio |

Agrega límite de peticiones por IP para evitar abusos y costos inesperados.

## 2. Apuntar el sitio al backend

Define en el sitio:

```
NEXT_PUBLIC_AI_ENDPOINT=https://tu-backend.example.com/api/ia
```

`getProvider()` cambia solo a `RemoteProvider`, la etiqueta de la demo pasa de "Simulación local" a "Modelo conectado" y el diagrama de arquitectura marca el backend como activo.

## 3. Ajustes recomendados

- Permitir que el visitante edite el texto de entrada solo cuando el modelo esté conectado (hoy es un ejemplo fijo porque las respuestas son preescritas).
- Mantener el paso de revisión humana en la interfaz.
- No enviar al modelo datos personales ni información de empresas.
