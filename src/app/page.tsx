import { Experience } from "@/components/experience";
import { content, locale } from "./content";

export default async function Home() {
  const sections = await content.listSections(locale);
  return <Experience sections={sections.map(({ slug, title, description }) => ({ slug, title, description }))} />;
}
