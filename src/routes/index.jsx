import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { services } from "@/services";
import { SiteHeader } from "@/components/public/SiteHeader";
import { Hero } from "@/components/public/Hero";
import { CampusBand } from "@/components/public/CampusBand";
import { AboutSection } from "@/components/public/AboutSection";
import { LevelsSection } from "@/components/public/LevelsSection";
import { FacilitiesSection } from "@/components/public/FacilitiesSection";
import { AdmissionsSection } from "@/components/public/AdmissionsSection";
import { ContactSection } from "@/components/public/ContactSection";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ErrorState } from "@/components/ui-kit/States";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return { content: await services.publicSite.getContent(), error: null };
    } catch (error) {
      return { content: null, error: error?.message || "No se pudo cargar el contenido del sitio." };
    }
  },
  head: () => ({
    meta: [
      { title: "Colegio Monteverde · Excelencia académica en Puebla" },
      {
        name: "description",
        content:
          "Colegio privado en Puebla con preescolar, primaria y secundaria. Excelencia académica, formación cristiana y acompañamiento cercano a cada familia.",
      },
      { property: "og:title", content: "Colegio Monteverde · Excelencia académica en Puebla" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { content, error } = Route.useLoaderData();
  const [levelId, setLevelId] = useState("");

  if (!content) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <ErrorState error={{ message: error }} title="No pudimos mostrar el sitio" />
      </div>
    );
  }

  const goToAdmissions = (nextLevelId) => {
    if (nextLevelId) setLevelId(nextLevelId);
    const section = document.getElementById("admisiones");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader institution={content.institution} />
      <main>
        <Hero content={content.hero} onInquire={() => goToAdmissions()} />
        <CampusBand image={content.gallery[0]?.src || content.about.image} caption={`${content.institution.name} · ${content.institution.city}, ${content.institution.state}`} />
        <AboutSection about={content.about} values={content.values} />
        <LevelsSection levels={content.levels} onInquire={goToAdmissions} />
        <FacilitiesSection facilities={content.facilities} gallery={content.gallery} />
        <AdmissionsSection
          admissions={content.admissions}
          levels={content.levels}
          privacy={content.privacy}
          initialLevelId={levelId}
        />
        <ContactSection institution={content.institution} contact={content.contact} privacy={content.privacy} />
      </main>
      <SiteFooter institution={content.institution} privacy={content.privacy} />
    </div>
  );
}