/**
 * Perfil, habilidades, trayectoria y proceso de trabajo.
 * Edita estos arreglos para actualizar la web; los componentes solo los leen.
 */

export const profile = {
  title: "Entre los procesos de negocio y el código",
  paragraphs: [
    "Mi trabajo empieza donde el proceso contable se vuelve repetitivo o propenso a errores. Conozco cómo fluye la información financiera y fiscal, y uso ese conocimiento para construir consultas, reportes y aplicaciones que la gente del área realmente utiliza.",
    "Escribo SQL sobre bases MySQL, proceso datos con Python y pandas, genero archivos de Excel automáticamente y empaqueto herramientas de escritorio con PyInstaller, Tkinter o C++/Qt5, según lo que pida cada caso. Cuando hace falta, presento la información en Power BI.",
    "Uso herramientas de inteligencia artificial como apoyo para desarrollar, analizar errores y documentar, con revisión y pruebas de mi parte antes de que algo llegue a producción.",
  ],
  activities: [
    "Soporte a procesos contables y financieros",
    "Consultas SQL y manejo de bases de datos MySQL",
    "Automatización de reportes",
    "Desarrollo y mantenimiento de herramientas internas",
    "Conciliación de información contable y fiscal",
    "Procesamiento de datos",
    "Generación de archivos Excel",
    "Desarrollo de aplicaciones de escritorio",
    "Optimización de tareas repetitivas",
    "Apoyo a usuarios y áreas de negocio",
  ],
};

export interface SkillGroup {
  area: string;
  items: string[];
  /** Ejemplo concreto de uso. */
  example: string;
  accent: "blue" | "cyan" | "violet";
}

export const skillGroups: SkillGroup[] = [
  {
    area: "Desarrollo",
    items: ["Python", "C++", "JavaScript y TypeScript (este portafolio)"],
    example:
      "Scripts y aplicaciones en Python para procesos contables; C++ con Qt5 para herramientas de escritorio; TypeScript y React en este sitio.",
    accent: "blue",
  },
  {
    area: "Datos",
    items: ["SQL", "MySQL", "pandas", "Excel"],
    example:
      "Consultas de conciliación por empresa y periodo en MySQL, procesadas con pandas y entregadas en Excel con totales de control.",
    accent: "cyan",
  },
  {
    area: "Interfaces",
    items: ["Tkinter", "Qt5"],
    example:
      "Ventanas con selector de empresa, fechas y barra de progreso para que el usuario genere reportes sin tocar código.",
    accent: "blue",
  },
  {
    area: "Inteligencia de negocio",
    items: ["Power BI", "Reportes y visualización de datos"],
    example:
      "Indicadores con comparación contra el periodo anterior y detalle filtrable, como el dashboard de la demo E.",
    accent: "cyan",
  },
  {
    area: "Automatización",
    items: [
      "Procesamiento de información",
      "Generación de archivos Excel",
      "Ejecutables con PyInstaller",
      "Automatización de tareas repetitivas",
    ],
    example:
      "Convertir un procedimiento manual de varios pasos en un ejecutable que hace la consulta, valida y genera el archivo.",
    accent: "blue",
  },
  {
    area: "Inteligencia artificial",
    items: [
      "IA como apoyo al desarrollo",
      "Prototipado asistido por IA",
      "Integración futura de modelos vía API",
    ],
    example:
      "Analizar errores, redactar borradores de SQL y documentación, siempre revisados y probados antes de usarse.",
    accent: "violet",
  },
];

export interface ExperienceItem {
  role: string | null;
  company: string | null;
  period: string | null;
  highlights: string[];
}

/**
 * Trayectoria. Llena estos datos con la información de tu CV definitivo.
 * Los campos en `null` aparecen en la web como "Pendiente".
 * Ordena del más reciente al más antiguo.
 */
export const experience: ExperienceItem[] = [
  {
    role: "Analista de Programación Contable",
    company: null,
    period: null,
    highlights: [
      "Consultas SQL y manejo de bases de datos MySQL para procesos contables y financieros.",
      "Automatización de reportes y generación de archivos Excel.",
      "Conciliación de información contable y fiscal.",
      "Desarrollo y mantenimiento de herramientas internas y aplicaciones de escritorio.",
      "Apoyo a usuarios y áreas de negocio.",
    ],
  },
  {
    role: null,
    company: null,
    period: null,
    highlights: [],
  },
];

export interface EducationItem {
  title: string | null;
  institution: string | null;
  period: string | null;
  kind: "formacion" | "certificacion";
}

/** Formación y certificaciones. Agrega elementos cuando los tengas. */
export const education: EducationItem[] = [
  { title: null, institution: null, period: null, kind: "formacion" },
  { title: null, institution: null, period: null, kind: "certificacion" },
];

export const processSteps = [
  {
    title: "Identificación del problema",
    text: "Escucho al área y observo el proceso tal como se hace hoy. Busco dónde se pierde tiempo o aparecen errores.",
    visual: "problem",
  },
  {
    title: "Análisis de los datos y del proceso",
    text: "Reviso las tablas, los campos y las reglas del negocio. Defino qué significa cada número antes de calcularlo.",
    visual: "data",
  },
  {
    title: "Diseño de la solución",
    text: "Elijo la herramienta más simple que resuelva el caso: una consulta, un script, una aplicación o un dashboard.",
    visual: "design",
  },
  {
    title: "Desarrollo con programación",
    text: "Construyo con Python, SQL o C++, separando consulta, procesamiento y presentación para poder crecer después.",
    visual: "code",
  },
  {
    title: "Pruebas y validación",
    text: "Comparo los resultados contra la fuente y contra el proceso manual. Si no cuadra, no se entrega.",
    visual: "test",
  },
  {
    title: "Automatización y entrega",
    text: "Empaqueto, documento y acompaño a los usuarios en los primeros usos para que la herramienta se adopte.",
    visual: "ship",
  },
  {
    title: "Mejora continua",
    text: "Recojo comentarios y ajusto. Cada versión resuelve un poco más del proceso.",
    visual: "loop",
  },
] as const;
