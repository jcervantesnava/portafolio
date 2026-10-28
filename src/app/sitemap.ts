import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.siteUrl}/`, priority: 1 },
    ...projects.map((p) => ({ url: `${site.siteUrl}/proyectos/${p.slug}/`, priority: 0.8 })),
  ];
}
