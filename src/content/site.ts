/**
 * Datos personales y enlaces del sitio.
 *
 * Todo lo que esté en `null` se muestra en la web como "pendiente" y los
 * botones correspondientes quedan deshabilitados (no llevan a ningún lado).
 * Cuando tengas el dato, reemplaza `null` por el valor y vuelve a publicar.
 */
export const site = {
  name: "Johan Cervantes Nava",
  shortName: "Johan Cervantes",
  role: "Analista de Programación Contable",
  focus: ["Automatización", "Python", "SQL", "Análisis de Datos"],
  headline: "Transformo procesos complejos en soluciones inteligentes",
  intro:
    "Más de 3 años entre la contabilidad y el código. Automatizo el cuadre de CFDI y los reportes de cierre con MySQL y Python, audito datos entre sistemas en varios países de LATAM y construyo aplicaciones internas para que las áreas de negocio dejen de hacer a mano lo que una herramienta puede hacer mejor.",

  /** Foto de perfil (en /public). Usa null para ocultarla. */
  photo: "/img/johan-cervantes.webp" as string | null,

  /** URL pública donde se publicará el sitio (para SEO y vista previa en LinkedIn). */
  siteUrl: "https://johan-cervantes.vercel.app" as string,

  /** Correo profesional. Ejemplo: "nombre@dominio.com" */
  email: "j.tadeo.cervantes@gmail.com" as string | null,
  /** Perfil de LinkedIn. Ejemplo: "https://www.linkedin.com/in/tu-usuario" */
  linkedin: "https://www.linkedin.com/in/johan-cervantes-nava-2b8981183" as string | null,
  /** Perfil de GitHub. Ejemplo: "https://github.com/tu-usuario" */
  github: "https://github.com/jcervantesnava" as string | null,
  /**
   * Ruta del CV en PDF dentro de /public. Copia tu archivo a
   * public/cv/Johan-Cervantes-CV.pdf y cambia este valor a
   * "/cv/Johan-Cervantes-CV.pdf".
   */
  cvPath: "/cv/Johan-Cervantes-CV.pdf" as string | null,
  /**
   * Endpoint opcional para el formulario de contacto (Formspree, Getform,
   * una función serverless propia…). Si está vacío y hay correo, el
   * formulario abre el cliente de correo con el mensaje ya redactado.
   */
  contactEndpoint: (process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || null) as string | null,
};

export type Site = typeof site;
