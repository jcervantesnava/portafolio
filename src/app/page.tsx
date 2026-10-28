import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProcessFlow from "@/components/ProcessFlow";
import ProfileSection from "@/components/ProfileSection";
import ProjectsWorkbench from "@/components/ProjectsWorkbench";
import Skills from "@/components/Skills";
import Timeline from "@/components/Timeline";
import { site } from "@/content/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.siteUrl,
  knowsAbout: ["Python", "SQL", "MySQL", "pandas", "Power BI", "Automatización de procesos", "Análisis de datos"],
  sameAs: [site.linkedin, site.github].filter(Boolean),
};

export default function Home() {
  return (
    <>
      <Header home />
      <main id="contenido">
        <Hero />
        <hr className="divider" />
        <ProfileSection />
        <ProjectsWorkbench />
        <ProcessFlow />
        <Skills />
        <Timeline />
        <Contact />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
