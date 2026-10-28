import type { Metadata, Viewport } from "next";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@/styles/base.css";
import "@/styles/sections.css";
import "@/styles/demos.css";
import { site } from "@/content/site";

const description =
  "Analista de Programación Contable. Automatización de procesos, Python, SQL/MySQL, análisis de datos, Power BI y aplicaciones internas. Portafolio con demostraciones interactivas.";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: `${site.name} | Automatización, Python y SQL`,
    template: `%s | ${site.name}`,
  },
  description,
  authors: [{ name: site.name }],
  keywords: ["Python", "SQL", "MySQL", "automatización", "análisis de datos", "Power BI", "pandas", "desarrollo de software", "contabilidad"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: site.name,
    title: `${site.name} | ${site.headline}`,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}, portafolio` }],
  },
  twitter: { card: "summary_large_image", title: site.name, description, images: ["/og.png"] },
  icons: { icon: "/icon.svg" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#060a13",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <div className="page-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
