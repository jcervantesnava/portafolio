import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>{site.name}</span>
        <span>Las demostraciones usan datos sintéticos y no se conectan a sistemas de ninguna empresa.</span>
      </div>
    </footer>
  );
}
