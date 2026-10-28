/**
 * Catálogo de proyectos.
 *
 * Para agregar un proyecto real:
 *  1. Copia uno de los objetos de abajo y cambia el `slug` (será la URL /proyectos/<slug>).
 *  2. Cambia `status` a "real" o "prototipo".
 *  3. Si no tiene demo interactiva, deja `demo: null` y agrega capturas en `images`
 *     (guárdalas en /public/proyectos/<slug>/ y pon la ruta aquí).
 *  4. Opcional: `repoUrl` y `demoUrl`.
 *
 * Regla del sitio: nada de cifras de ahorro o mejora sin evidencia. En las
 * demostraciones conceptuales los beneficios se describen como potenciales.
 */

export type ProjectStatus = "real" | "prototipo" | "conceptual";

export type DemoKey = "reportes" | "laboratorio" | "ia" | "gestion" | "bi";

export interface Project {
  slug: string;
  title: string;
  /** Una línea: qué es. */
  summary: string;
  status: ProjectStatus;
  problem: string;
  objective: string;
  solution: string[];
  tech: string[];
  decisions: { title: string; detail: string }[];
  learnings: string[];
  benefits: string[];
  demo: DemoKey | null;
  repoUrl?: string;
  demoUrl?: string;
  images?: { src: string; alt: string }[];
}

export const statusLabel: Record<ProjectStatus, string> = {
  real: "Proyecto real",
  prototipo: "Prototipo",
  conceptual: "Demostración conceptual",
};

export const statusNote: Record<ProjectStatus, string> = {
  real: "Proyecto en uso. Los datos mostrados aquí están anonimizados.",
  prototipo: "Prototipo funcional en desarrollo.",
  conceptual:
    "Demostración construida para este portafolio con datos sintéticos. Representa el tipo de solución que desarrollo; no es una copia de un sistema de ninguna empresa.",
};

export const projects: Project[] = [
  {
    slug: "automatizacion-reportes",
    title: "Automatización de reportes empresariales",
    summary:
      "Aplicación de escritorio que consulta MySQL por empresa y periodo, procesa los resultados y entrega un Excel listo para revisar.",
    status: "conceptual",
    problem:
      "Muchos reportes contables se arman igual cada mes: abrir el cliente de base de datos, ajustar fechas en la consulta, copiar resultados a Excel, dar formato y revisar totales a mano. Es lento, depende de una persona y cada paso manual es una oportunidad de error.",
    objective:
      "Que cualquier persona del área pueda generar el reporte eligiendo empresa y fechas, sin tocar SQL, y que el archivo salga siempre con la misma estructura y con sus totales verificados.",
    solution: [
      "Interfaz de escritorio con selector de empresa, rango de fechas y tipo de reporte.",
      "Consulta SQL parametrizada: las fechas y la empresa viajan como parámetros, nunca concatenadas en el texto.",
      "Procesamiento con pandas: limpieza, agrupación y una validación de totales contra la fuente antes de exportar.",
      "Exportación a Excel con hojas de detalle y resumen, y una barra de progreso que muestra en qué paso va.",
      "Empaquetado como ejecutable (.exe) con PyInstaller para usarse sin instalar Python.",
    ],
    tech: ["Python", "MySQL", "SQL", "pandas", "Tkinter", "openpyxl", "PyInstaller"],
    decisions: [
      {
        title: "Consultas parametrizadas",
        detail:
          "Evitan inyección SQL y permiten reutilizar la misma consulta para cualquier empresa o periodo.",
      },
      {
        title: "Trabajo pesado fuera del hilo de la interfaz",
        detail:
          "La consulta y el procesamiento corren en un hilo aparte para que la ventana no se congele y la barra de progreso se actualice.",
      },
      {
        title: "Validación antes de exportar",
        detail:
          "El reporte compara el total procesado contra el total de la consulta. Si no cuadra, avisa en lugar de generar un archivo incorrecto.",
      },
      {
        title: "Credenciales fuera del código",
        detail:
          "La conexión se lee de un archivo de configuración local o variables de entorno, no del ejecutable.",
      },
    ],
    learnings: [
      "El usuario confía en la herramienta cuando ve el progreso y entiende los errores; un mensaje claro vale más que una función extra.",
      "Separar consulta, procesamiento y exportación facilita agregar nuevos reportes sin reescribir la aplicación.",
    ],
    benefits: [
      "Menos pasos manuales y menos dependencia de una sola persona.",
      "Reportes con estructura consistente mes con mes.",
      "Errores de cuadre detectados antes de que el archivo llegue a otra área.",
    ],
    demo: "reportes",
  },
  {
    slug: "laboratorio-sql-python",
    title: "Laboratorio de análisis con SQL y Python",
    summary:
      "Explora una base de ventas sintética con filtros por empresa y periodo; la consulta SQL y el código pandas equivalentes se actualizan en vivo.",
    status: "conceptual",
    problem:
      "Las preguntas de negocio llegan en lenguaje cotidiano (\"¿cuánto vendimos en el norte este trimestre?\") y hay que traducirlas a consultas, validarlas y presentarlas de forma que alguien sin conocimientos técnicos las entienda.",
    objective:
      "Mostrar cómo convierto una pregunta en una consulta, la proceso con Python y la presento con indicadores, gráficos y una tabla que se puede revisar.",
    solution: [
      "SQL para filtrar y agregar en la base de datos, donde está la información.",
      "Python y pandas para el procesamiento que es incómodo en SQL: comparaciones entre periodos, formatos y exportaciones.",
      "Indicadores, gráfico mensual y tabla de resultados que responden a los mismos filtros.",
    ],
    tech: ["SQL", "MySQL", "Python", "pandas", "Visualización de datos"],
    decisions: [
      {
        title: "Filtrar en la base, no en la hoja",
        detail:
          "Traer solo las filas necesarias reduce tiempo y memoria; pandas se usa para lo que SQL no resuelve bien.",
      },
      {
        title: "Mostrar el código junto al resultado",
        detail:
          "Ver la consulta que produjo cada número hace que el análisis sea auditable.",
      },
    ],
    learnings: [
      "Antes de escribir la consulta conviene acordar qué significa cada métrica: ventas con o sin IVA, por fecha de factura o de pago.",
      "Un total de control al final de cada tabla detecta filtros mal aplicados.",
    ],
    benefits: [
      "Respuestas reproducibles: la misma consulta da el mismo número para cualquiera que la ejecute.",
      "Análisis que se pueden revisar paso a paso.",
    ],
    demo: "laboratorio",
  },
  {
    slug: "ia-aplicada-desarrollo",
    title: "Inteligencia artificial aplicada al desarrollo",
    summary:
      "Cómo uso asistentes de IA para analizar errores, redactar borradores de SQL, documentar y prototipar, siempre con revisión humana.",
    status: "conceptual",
    problem:
      "Buena parte del tiempo de desarrollo se va en tareas repetitivas: entender un error, escribir el primer borrador de una consulta, documentar lo que ya funciona. La IA ayuda, pero sus respuestas pueden ser incorrectas si nadie las revisa.",
    objective:
      "Explicar un flujo de trabajo donde la IA acelera el borrador y la persona conserva el criterio: revisa, prueba y decide.",
    solution: [
      "Casos de uso concretos: análisis de errores, borradores de SQL, automatización y documentación.",
      "Un paso explícito de revisión y prueba antes de usar cualquier resultado.",
      "Arquitectura preparada para conectar un modelo real mediante un backend que guarda la clave de la API en el servidor.",
    ],
    tech: ["Asistentes de IA", "Python", "SQL", "TypeScript", "API de IA (integración futura)"],
    decisions: [
      {
        title: "La clave de la API nunca va en el navegador",
        detail:
          "El frontend llama a un endpoint propio; ese backend agrega la clave, limita el uso y reenvía la petición al proveedor.",
      },
      {
        title: "Proveedor intercambiable",
        detail:
          "La demo usa una interfaz común: hoy responde una simulación local; mañana, un modelo real sin cambiar la interfaz.",
      },
      {
        title: "Nunca enviar datos sensibles",
        detail:
          "Los ejemplos se anonimizan antes de compartirlos con cualquier herramienta externa.",
      },
    ],
    learnings: [
      "La IA es más útil con contexto preciso: el error completo, la estructura de la tabla y el resultado esperado.",
      "Todo borrador generado se trata como código de otra persona: se lee, se prueba y se ajusta.",
    ],
    benefits: [
      "Prototipos más rápidos para validar una idea con el usuario.",
      "Documentación que sí se escribe porque el primer borrador ya existe.",
    ],
    demo: "ia",
  },
  {
    slug: "aplicaciones-empresariales",
    title: "Aplicación de gestión interna",
    summary:
      "Sistema de requisiciones con catálogos, formulario validado, flujo de aprobación, filtros y exportación.",
    status: "conceptual",
    problem:
      "Muchos procesos operativos viven en correos y hojas compartidas: nadie sabe en qué estado está una solicitud, los datos llegan incompletos y armar un reporte implica perseguir a varias personas.",
    objective:
      "Convertir el proceso en una aplicación sencilla donde los datos se capturan una vez, se validan al momento y el estado de cada solicitud es visible para todos.",
    solution: [
      "Catálogos de proveedores y centros de costo para evitar captura libre.",
      "Formulario con validaciones en el momento de capturar.",
      "Estados claros (borrador, en revisión, aprobada, rechazada) con acciones por registro.",
      "Filtros, búsqueda y exportación a Excel de lo que se ve en pantalla.",
    ],
    tech: ["Python", "Qt5 / C++", "Tkinter", "MySQL", "SQL", "TypeScript (esta demo)"],
    decisions: [
      {
        title: "Catálogos en lugar de texto libre",
        detail:
          "Reducen errores de captura y hacen posible agrupar y reportar sin limpiar datos después.",
      },
      {
        title: "Validar en la captura",
        detail:
          "Es más barato corregir un dato mientras se escribe que cuando ya llegó a contabilidad.",
      },
    ],
    learnings: [
      "Las mejores aplicaciones internas nacen de observar cómo trabaja hoy el área, no de la lista de funciones.",
      "Un estado visible por registro elimina buena parte de los correos de seguimiento.",
    ],
    benefits: [
      "Información completa desde la captura.",
      "Seguimiento visible sin correos de por medio.",
    ],
    demo: "gestion",
  },
  {
    slug: "visualizacion-bi",
    title: "Visualización de datos y BI",
    summary:
      "Dashboard con indicadores, tendencias, comparación contra el periodo anterior y detalle filtrable.",
    status: "conceptual",
    problem:
      "Los datos existen, pero en tablas largas que nadie lee completas. Las decisiones se toman con la intuición o con el último número que alguien recordó.",
    objective:
      "Que en un vistazo se vea cómo vamos, contra qué nos comparamos y dónde hay que profundizar.",
    solution: [
      "Indicadores principales con su variación contra el periodo anterior.",
      "Tendencia mensual contra el año anterior para separar estacionalidad de cambios reales.",
      "Desglose por categoría y una tabla de detalle que responde a los mismos filtros.",
    ],
    tech: ["Power BI", "SQL", "Excel", "Python", "Modelado de datos"],
    decisions: [
      {
        title: "Comparar siempre contra algo",
        detail:
          "Un número solo no dice si es bueno o malo; el periodo anterior y el año anterior le dan contexto.",
      },
      {
        title: "Del resumen al detalle",
        detail:
          "Cada gráfico se puede bajar hasta las filas que lo forman, para que el dashboard sea verificable.",
      },
    ],
    learnings: [
      "Pocos indicadores bien definidos funcionan mejor que muchos gráficos.",
      "Definir la fuente y la fecha de corte evita discusiones sobre qué número es el correcto.",
    ],
    benefits: [
      "Decisiones con contexto y no solo con el número del día.",
      "Menos tiempo armando reportes y más tiempo analizándolos.",
    ],
    demo: "bi",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
