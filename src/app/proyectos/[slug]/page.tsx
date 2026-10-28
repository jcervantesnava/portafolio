import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProjectCase from "@/components/ProjectCase";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/proyectos/${p.slug}/` },
    openGraph: { title: p.title, description: p.summary, url: `/proyectos/${p.slug}/` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  return (
    <>
      <Header />
      <main id="contenido" className="project-page">
        <ProjectCase p={p} />
      </main>
      <Footer />
    </>
  );
}
