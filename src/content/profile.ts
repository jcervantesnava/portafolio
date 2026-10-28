/**
 * Perfil, habilidades, trayectoria y proceso de trabajo.
 * Edita estos arreglos para actualizar la web; los componentes solo los leen.
 */

export const profile = {
  title: "Entre los procesos de negocio y el código",
  paragraphs: [
    "Soy Analista de Sistemas Contables con más de 3 años automatizando procesos contables y fiscales. Mi especialidad es el cuadre de CFDI de ingresos, los reportes de cierre mensual (ingresos, notas de crédito, cuentas por cobrar e IVA) y la auditoría de datos entre sistemas en varios países de LATAM.",
    "Escribo SQL en MySQL, proceso datos con Python (pandas, numpy, SQLAlchemy), construyo reportes en Excel con Power Query y desarrollo aplicaciones internas en Python y en C++ con Qt5, que distribuyo como ejecutables con PyInstaller.",
    "Trabajo con herramientas de desarrollo asistido por IA, como Claude y Cursor, junto con Git y Linear, para entregar más rápido y con mejor documentación. Todo lo que genera la IA pasa por mi revisión y mis pruebas.",
  ],
  activities: [
    "Cuadre de CFDI de ingresos para dos empresas",
    "Reportes de cierre mensual: ingresos, notas de crédito, CxC e IVA",
    "Costo promedio mensual de cinco empresas",
    "Consultas SQL para contabilidad, compras, nómina y auditoría",
    "Auditoría SQL en El Salvador, Honduras y Belice",
    "Reportes en Excel y Power Query conectados a MySQL",
    "ERP interno en Python y Qt5",
    "Aplicaciones internas en Qt5/C++",
    "Flujos de aprobación con notificaciones por correo",
    "Soporte y capacitación a usuarios de LATAM y CDMX",
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
    area: "Contabilidad y fiscal",
    items: ["CFDI de ingresos y notas de crédito", "Cuadre de CFDI", "IVA", "Cuentas por cobrar", "Costo promedio", "Cierre mensual"],
    example:
      "Cuadre automático de CFDI de ingresos para dos empresas, con fecha de corte dinámica y ejecución semanal programada.",
    accent: "cyan",
  },
  {
    area: "Bases de datos",
    items: ["MySQL", "PostgreSQL", "Consultas complejas", "Scripts multisentencia", "Auditoría de datos"],
    example:
      "Auditoría SQL de un sistema de requisiciones en tres países, comparando el sistema legado contra el nuevo.",
    accent: "blue",
  },
  {
    area: "Programación",
    items: ["Python", "pandas", "numpy", "SQLAlchemy", "C++", "JavaScript y TypeScript (este portafolio)"],
    example:
      "Scripts y tareas programadas en Python para procesos contables; TypeScript y React en este sitio.",
    accent: "blue",
  },
  {
    area: "Interfaces y aplicaciones",
    items: ["Qt5", "Tkinter", "PyInstaller"],
    example:
      "ERP interno en Python y Qt5 con catálogos, pedidos y solicitudes de gasto, distribuido como ejecutable.",
    accent: "blue",
  },
  {
    area: "Reportes y BI",
    items: ["Excel", "Power Query", "Tablas dinámicas", "ODBC", "Dashboards", "Power BI (básico)"],
    example:
      "Reportes semanales en Excel y Power Query conectados a MySQL que se distribuyen por correo a las áreas usuarias.",
    accent: "cyan",
  },
  {
    area: "Automatización",
    items: ["Tareas programadas", "Generación de archivos Excel", "Flujos de aprobación", "Notificaciones por correo"],
    example:
      "Convertir una corrida manual en una cadena de scripts que se ejecuta sola en el servidor cada semana.",
    accent: "cyan",
  },
  {
    area: "IA y desarrollo",
    items: ["Claude", "Claude Design", "Cursor", "Prototipado asistido por IA"],
    example:
      "Acelerar desarrollo, prototipos de interfaces y documentación, con revisión y pruebas antes de usar el resultado.",
    accent: "violet",
  },
  {
    area: "Herramientas de trabajo",
    items: ["Git", "GitHub", "Linear", "Auth0 (básico)"],
    example: "Control de versiones con Git y GitHub, y seguimiento de tareas en Linear.",
    accent: "blue",
  },
];

export interface ExperienceItem {
  role: string | null;
  company: string | null;
  period: string | null;
  /** Grupos de logros. Un grupo sin título se muestra como lista simple. */
  groups: { title?: string; items: string[] }[];
}

/** Trayectoria, del puesto más reciente al más antiguo. */
export const experience: ExperienceItem[] = [
  {
    role: "Analista de Sistemas Contables",
    company: "Soluciones Profesionales Informática",
    period: "May 2023 a la fecha",
    groups: [
      {
        title: "Contabilidad, CFDI y cierre",
        items: [
          "Automaticé el cuadre de CFDI de ingresos para dos empresas: cadena de scripts MySQL ejecutados en servidor, con fecha de corte dinámica y ejecución programada semanal, eliminando la corrida manual.",
          "Genero los reportes de cierre mensual de dos empresas (ingresos, notas de crédito, cuentas por cobrar e IVA) y mantengo actualizada la información de CFDI.",
          "Construí reportes semanales en Excel y Power Query conectados a MySQL (calificaciones a corregir, histórico semanal y dashboard) que se distribuyen por correo a las áreas usuarias.",
          "Calculo y analizo mensualmente el costo promedio de cinco empresas, apoyando decisiones basadas en datos.",
        ],
      },
      {
        title: "Datos y auditoría",
        items: [
          "Realicé una auditoría SQL multipaís (El Salvador, Honduras y Belice) del Sistema de Requisiciones, comparando el sistema legado contra el nuevo y validando la lógica de separación servidor/réplica en producción.",
          "Desarrollo consultas SQL en MySQL para contabilidad, compras, nómina y auditoría.",
        ],
      },
      {
        title: "Desarrollo de software",
        items: [
          "Implementé un ERP interno en Python y Qt5 (catálogos, pedidos y solicitudes de gasto) que automatizó 35\u00a0% de retrabajos y redujo hasta 30\u00a0% los tiempos de aprobación y cierre.",
          "Actualicé y mejoré aplicaciones internas en Qt5/C++ según requerimientos del negocio, con mejoras de hasta 40\u00a0%.",
          "Automaticé flujos de aprobación con notificaciones por correo a los responsables; distribuyo herramientas internas como ejecutables con PyInstaller.",
          "Uso Claude, Claude Design y Cursor para acelerar desarrollo, prototipos y documentación; control de versiones con Git/GitHub y seguimiento en Linear.",
        ],
      },
      {
        title: "Soporte y capacitación",
        items: [
          "Administré la intranet de LATAM y CDMX, capacité a personal de tiendas y oficinas, y doy soporte técnico y funcional a usuarios de contabilidad, fiscal, compras, nómina y auditoría.",
        ],
      },
    ],
  },
  {
    role: "Analista de Monitoreo",
    company: "INPRO TELECOM S.A. de C.V.",
    period: "Nov 2022 a feb 2023",
    groups: [
      {
        items: [
          "Gestioné incidencias técnicas mediante TT y CCM, asegurando respuesta oportuna y resolución efectiva.",
          "Monitoreé infraestructura de red y energía (DAS, Meraki, UPS y transmisión por fibra óptica) y di soporte a clientes por teléfono y correo.",
        ],
      },
    ],
  },
  {
    role: "Asistente de Soporte Técnico / Asistente General de Corte",
    company: "PLASTINAL S.A. de C.V.",
    period: "Jun 2021 a nov 2022",
    groups: [
      {
        items: [
          "Operé y di mantenimiento preventivo a maquinaria de corte y embolsado, capacité al personal de producción y administré datos de producción y nómina.",
        ],
      },
    ],
  },
];

export interface EducationItem {
  title: string;
  detail?: string;
  institution: string;
  period?: string;
  kind: "formacion" | "certificacion";
}

/** Formación y certificaciones. Agrega certificaciones con kind: "certificacion". */
export const education: EducationItem[] = [
  {
    title: "Ingeniería en Sistemas Computacionales",
    detail: "Especialidad en Auditoría y Seguridad Informática",
    institution: "Tecnológico de Estudios Superiores de Coacalco, Estado de México",
    period: "2017 a 2021",
    kind: "formacion",
  },
];

export const languages = [
  { name: "Español", level: "Nativo" },
  { name: "Inglés", level: "B1 (intermedio)" },
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
