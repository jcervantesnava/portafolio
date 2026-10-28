import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "@/styles/base.css";
import "@/styles/sections.css";
import "@/styles/demos.css";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProcessFlow from "@/components/ProcessFlow";
import ProfileSection from "@/components/ProfileSection";
import ProjectCase from "@/components/ProjectCase";
import ProjectsWorkbench from "@/components/ProjectsWorkbench";
import Skills from "@/components/Skills";
import Timeline from "@/components/Timeline";
import { getProject } from "@/content/projects";

const read = () => (typeof location !== "undefined" ? location.hash.slice(1) : "");

function App() {
  const [hash, setHash] = useState(read());
  useEffect(() => {
    const on = () => setHash(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const project = hash.startsWith("caso-") ? getProject(hash.slice(5)) : undefined;

  useEffect(() => {
    if (project) window.scrollTo(0, 0);
    else if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
  }, [hash, project]);

  return (
    <>
      <Header home />
      {project ? (
        <main id="contenido" className="project-page" key={project.slug}>
          <ProjectCase p={project} />
        </main>
      ) : (
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
      )}
      <Footer />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
