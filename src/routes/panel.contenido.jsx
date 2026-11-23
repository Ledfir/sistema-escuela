import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Save } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError, FormSuccess } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";

export const Route = createFileRoute("/panel/contenido")({
  head: () => ({ meta: [{ title: "Contenido público · Panel escolar" }] }),
  component: PublicContentPage,
});

function PublicContentPage() {
  const queryClient = useQueryClient();
  const settings = useServiceQuery(["settings"], () => services.settings.get());
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.data?.content) setContent(settings.data.content);
  }, [settings.data]);

  async function save(event) {
    event.preventDefault();
    if (saving || !content) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await services.settings.save({
        content: {
          hero: content.hero,
          about: content.about,
          admissions: content.admissions,
          contact: content.contact,
        },
      });
      setMessage("Contenido actualizado. Revisa el sitio público para confirmar los cambios.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-site-content"] });
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar el contenido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administración"
        title="Contenido público"
        description="Textos que alimentan la página institucional. Los datos de contacto se editan en Configuración."
        actions={
          <Button asChild variant="outline" size="sm">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              Ver sitio
            </a>
          </Button>
        }
      />

      <AsyncState query={settings} loadingLabel="Cargando contenido…">
        {() =>
          content ? (
            <form onSubmit={save} className="max-w-3xl space-y-6">
              <FormError message={error} />
              <FormSuccess message={message} />

              <section className="space-y-3 border border-border bg-card p-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Portada</h2>
                <Field label="Texto superior (eyebrow)">
                  <Input value={content.hero.eyebrow} onChange={(event) => setContent({ ...content, hero: { ...content.hero, eyebrow: event.target.value } })} />
                </Field>
                <Field label="Título principal">
                  <Input value={content.hero.title} onChange={(event) => setContent({ ...content, hero: { ...content.hero, title: event.target.value } })} />
                </Field>
                <Field label="Segunda línea del título">
                  <Input value={content.hero.titleAccent} onChange={(event) => setContent({ ...content, hero: { ...content.hero, titleAccent: event.target.value } })} />
                </Field>
                <Field label="Párrafo de introducción">
                  <Textarea rows={3} value={content.hero.lead} onChange={(event) => setContent({ ...content, hero: { ...content.hero, lead: event.target.value } })} />
                </Field>
              </section>

              <section className="space-y-3 border border-border bg-card p-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quiénes somos</h2>
                <Field label="Título de la sección">
                  <Input value={content.about.title} onChange={(event) => setContent({ ...content, about: { ...content.about, title: event.target.value } })} />
                </Field>
                <Field label="Primer párrafo">
                  <Textarea
                    rows={3}
                    value={content.about.paragraphs[0]}
                    onChange={(event) => {
                      const paragraphs = [...content.about.paragraphs];
                      paragraphs[0] = event.target.value;
                      setContent({ ...content, about: { ...content.about, paragraphs } });
                    }}
                  />
                </Field>
                <Field label="Segundo párrafo">
                  <Textarea
                    rows={3}
                    value={content.about.paragraphs[1]}
                    onChange={(event) => {
                      const paragraphs = [...content.about.paragraphs];
                      paragraphs[1] = event.target.value;
                      setContent({ ...content, about: { ...content.about, paragraphs } });
                    }}
                  />
                </Field>
                <Field label="Cita bíblica">
                  <Input value={content.about.quote} onChange={(event) => setContent({ ...content, about: { ...content.about, quote: event.target.value } })} />
                </Field>
              </section>

              <section className="space-y-3 border border-border bg-card p-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Admisiones</h2>
                <Field label="Introducción del proceso">
                  <Textarea
                    rows={3}
                    value={content.admissions.lead}
                    onChange={(event) => setContent({ ...content, admissions: { ...content.admissions, lead: event.target.value } })}
                  />
                </Field>
                <Field label="Nota sobre cupo">
                  <Input
                    value={content.admissions.note}
                    onChange={(event) => setContent({ ...content, admissions: { ...content.admissions, note: event.target.value } })}
                  />
                </Field>
              </section>

              <section className="space-y-3 border border-border bg-card p-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Contacto</h2>
                <Field label="Texto de bienvenida">
                  <Textarea
                    rows={2}
                    value={content.contact.note}
                    onChange={(event) => setContent({ ...content, contact: { ...content.contact, note: event.target.value } })}
                  />
                </Field>
                <Field label="Mensaje precargado de WhatsApp">
                  <Input
                    value={content.contact.whatsappMessage}
                    onChange={(event) => setContent({ ...content, contact: { ...content.contact, whatsappMessage: event.target.value } })}
                  />
                </Field>
              </section>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                  {saving ? "Guardando…" : "Guardar contenido"}
                </Button>
              </div>
            </form>
          ) : null
        }
      </AsyncState>
    </div>
  );
}