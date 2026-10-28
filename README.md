# Portafolio de Johan Cervantes Nava

CV digital y portafolio con demostraciones interactivas. Hecho con Next.js 15, React 19 y TypeScript. Se exporta como sitio estático: no necesita servidor ni base de datos.

## Ejecutar en tu computadora

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev        # http://localhost:3000, se recarga al guardar cambios
npm run build      # genera el sitio final en la carpeta out/
npx serve out      # opcional: revisar el resultado final antes de publicar
```

## Publicar

**Vercel (recomendado, gratis):**
1. Sube esta carpeta a un repositorio de GitHub.
2. En vercel.com, "Add New Project", elige el repositorio y presiona Deploy. No hay que configurar nada más.
3. Copia la URL que te da Vercel (o tu dominio propio) en `siteUrl` dentro de `src/content/site.ts` y vuelve a publicar. Así la vista previa en LinkedIn usa la dirección correcta.

**Netlify:** comando de build `npm run build`, carpeta de publicación `out`.

**GitHub Pages:** si el sitio vive en `usuario.github.io/repositorio`, agrega `basePath: "/repositorio"` en `next.config.ts`.

## Qué editar y dónde

Todo el contenido vive en `src/content/`. Los componentes solo leen esos archivos.

| Quiero cambiar… | Archivo |
| --- | --- |
| Nombre, frase principal, correo, LinkedIn, GitHub, CV | `src/content/site.ts` |
| Perfil, habilidades, experiencia, formación, pasos del proceso | `src/content/profile.ts` |
| Proyectos y sus páginas de detalle | `src/content/projects.ts` |
| Datos sintéticos de las demos | `src/lib/demo-data.ts` |
| Colores y tipografía | `src/styles/base.css` (variables al inicio) |

Todo lo que esté en `null` se muestra en la web como **Pendiente** y sus botones quedan deshabilitados.

### Subir tu CV

1. Copia el PDF a `public/cv/Johan-Cervantes-CV.pdf`.
2. En `src/content/site.ts` cambia `cvPath: null` por `cvPath: "/cv/Johan-Cervantes-CV.pdf"`.

### Llenar la trayectoria

En `src/content/profile.ts`, arreglo `experience`: un objeto por puesto, del más reciente al más antiguo. Cambia cada `null` por el dato de tu CV. Haz lo mismo en `education` para formación y certificaciones. Puedes borrar los objetos de ejemplo que no uses.

### Agregar un proyecto real

1. Copia un objeto del arreglo `projects` en `src/content/projects.ts`.
2. Cambia `slug` (será la URL `/proyectos/<slug>/`), título, textos y `status: "real"` o `"prototipo"`.
3. Sin demo interactiva: `demo: null` y agrega capturas en `images` (guárdalas en `public/proyectos/<slug>/`).
4. Opcional: `repoUrl` y `demoUrl`.

El proyecto aparece solo en el banco de proyectos de la portada y genera su página de detalle. Si es un proyecto de tu trabajo, anonimiza datos y no publiques cifras de ahorro sin evidencia.

### Activar el formulario de contacto

Opción simple: escribe tu correo en `email` y el formulario abrirá el cliente de correo del visitante con el mensaje redactado.

Opción con envío directo: crea un formulario en Formspree (o un servicio similar) y define la variable `NEXT_PUBLIC_CONTACT_ENDPOINT` con la URL que te den (en Vercel: Settings, Environment Variables).

### Conectar un modelo de IA real (demo C)

La demo de IA hoy es una **simulación con respuestas preescritas** y lo dice en pantalla. Para conectarla a un modelo real sigue `docs/ia-backend.md`. La clave de la API nunca va en este proyecto.

## Estructura

```
src/
  app/                    páginas (portada, /proyectos/[slug], sitemap, robots)
  components/             secciones del sitio
  components/demos/       las 5 demostraciones (se cargan bajo demanda)
  components/charts/      gráficos SVG sin librerías
  content/                TODO el contenido editable
  lib/                    datos sintéticos, formato, exportación a Excel, capa de IA
  styles/                 estilos
server-examples/          plantilla de backend seguro para IA (no se publica)
docs/                     guía para conectar la IA
```

## Calidad incluida

- Diseño adaptable desde 320 px.
- Navegación por teclado, foco visible, etiquetas accesibles en formularios, tablas y gráficos.
- Respeta "reducir movimiento" del sistema: se apagan las animaciones.
- Las animaciones del hero se pausan cuando no están en pantalla.
- Cada demo se carga solo cuando se abre y, si falla, muestra un aviso sin romper la página.
- SEO: título y descripción por página, Open Graph para LinkedIn (`public/og.png`), sitemap y robots.
- Las exportaciones a Excel generan archivos .xlsx reales en el navegador, sin enviar datos a ningún lado.
- No hay claves, contraseñas ni conexiones a sistemas de ninguna empresa.
