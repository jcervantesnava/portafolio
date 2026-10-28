# Guía para asistentes de código (Cursor, Claude, etc.)

Portafolio personal de Johan Cervantes Nava. Next.js 15 (App Router) + React 19 + TypeScript, exportado como sitio estático (`output: "export"`). Sin Tailwind: CSS propio en `src/styles/`.

## Reglas de contenido (importantes)
- Todo el texto editable vive en `src/content/` (`site.ts`, `profile.ts`, `projects.ts`). No pongas textos fijos dentro de los componentes.
- No inventes empleos, fechas, títulos, certificaciones, porcentajes de dominio ni cifras de mejora. Los datos reales salen del CV en `public/cv/`.
- Las demos usan datos sintéticos de `src/lib/demo-data.ts`, marcados como ficticios. Nunca conectes el sitio a bases de datos o sistemas de ninguna empresa.
- La demo de IA es una simulación con respuestas preescritas y debe seguir diciéndolo mientras no haya un backend real. Las claves de API nunca van en el frontend (ver `docs/ia-backend.md`).
- Proyectos: `status` es `"real"`, `"prototipo"` o `"conceptual"`, y la interfaz lo muestra.

## Reglas de diseño
- Colores y medidas como variables en `src/styles/base.css` (`--bg`, `--blue`, `--cyan`, `--violet`…). El violeta se reserva para lo relacionado con IA; el cian para estados correctos ("cuadra").
- Tipografía: Schibsted Grotesk para todo; JetBrains Mono solo dentro de código y demos.
- Sin etiquetas en mayúsculas sobre los títulos, sin emojis, sin barras de porcentaje de habilidades.
- Respeta `prefers-reduced-motion` y la navegación por teclado. Revisa a 375 px de ancho.

## Comandos
- `npm run dev`: desarrollo en http://localhost:3000
- `npm run build`: build estático en `out/` (debe pasar sin errores de tipos ni lint)
- `npm run preview:single`: genera `preview/dist/portafolio-preview.html`, una versión de una sola página para compartir como vista previa
