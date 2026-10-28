import type { NextConfig } from "next";

// Sitio 100% estático: se exporta a /out y se puede publicar en Vercel,
// Netlify, GitHub Pages o cualquier hosting de archivos.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
