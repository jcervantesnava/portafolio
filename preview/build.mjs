import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "preview/dist");
mkdirSync(out, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, "preview/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  outdir: out,
  jsx: "automatic",
  loader: { ".woff2": "dataurl", ".woff": "empty" },
  alias: {
    "next/link": path.join(root, "preview/shims/next-link.tsx"),
    "next/dynamic": path.join(root, "preview/shims/next-dynamic.tsx"),
    "@": path.join(root, "src"),
  },
  define: {
    "process.env.NEXT_PUBLIC_CONTACT_ENDPOINT": '""',
    "process.env.NEXT_PUBLIC_AI_ENDPOINT": '""',
    "process.env.NODE_ENV": '"production"',
  },
});

let css = readFileSync(path.join(out, "main.css"), "utf8");
const js = readFileSync(path.join(out, "main.js"), "utf8").replace(/<\/script/gi, "<\\/script");
const html = `<title>Portafolio Johan Cervantes</title>
<meta name="description" content="Vista previa del portafolio de Johan Cervantes Nava">
<style>${css}</style>
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<div class="page-bg" aria-hidden="true"></div>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(path.join(out, "portafolio-preview.html"), html);
console.log("bytes", html.length);
