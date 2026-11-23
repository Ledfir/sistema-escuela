import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Palette, RotateCcw, Save, TimerOff } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError, FormSuccess } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services, isDemoMode } from "@/services";
import { useSession } from "@/lib/SessionContext";

export const Route = createFileRoute("/panel/configuracion")({
  head: () => ({ meta: [{ title: "Configuración institucional · Panel escolar" }] }),
  component: SettingsPage,
});

const BRAND_DEFAULTS = { ink: "#245447", deep: "#17382f", sand: "#d9cba7", paper: "#f7f3e8" };

function SettingsPage() {
  const queryClient = useQueryClient();
  const { can } = useSession();
  const settings = useServiceQuery(["settings"], () => services.settings.get());

  const [institution, setInstitution] = useState(null);
  const [brand, setBrand] = useState(BRAND_DEFAULTS);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setInstitution(settings.data.institution);
      const stored = settings.data.content?.brand;
      if (stored) {
        setBrand(stored);
        applyBrand(stored);
      }
    }
  }, [settings.data]);

  function applyBrand(colors) {
    const root = document.documentElement;
    root.style.setProperty("--brand-ink", colors.ink);
    root.style.setProperty("--brand-deep", colors.deep);
    root.style.setProperty("--brand-sand", colors.sand);
    root.style.setProperty("--brand-paper", colors.paper);
  }

  function updateBrand(key, value) {
    const next = { ...brand, [key]: value };
    setBrand(next);
    applyBrand(next);
  }

  async function save(event) {
    event.preventDefault();
    if (saving || !institution) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await services.settings.save({ institution, content: { brand } });
      setMessage("Configuración guardada. Los cambios se reflejan en el sitio público y el portal.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-site-content"] });
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administración"
        title="Configuración institucional"
        description="Datos del colegio, identidad visual y utilidades de demostración."
      />

      <AsyncState query={settings} loadingLabel="Cargando configuración…">
        {() =>
          institution ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <form onSubmit={save} className="space-y-4 border border-border bg-card p-5 lg:col-span-2">
                <FormError message={error} />
                <FormSuccess message={message} />

                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Datos del colegio</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nombre del colegio">
                    <Input value={institution.name} onChange={(event) => setInstitution({ ...institution, name: event.target.value })} />
                  </Field>
                  <Field label="Lema">
                    <Input value={institution.tagline || ""} onChange={(event) => setInstitution({ ...institution, tagline: event.target.value })} />
                  </Field>
                  <Field label="Ciudad">
                    <Input value={institution.city} onChange={(event) => setInstitution({ ...institution, city: event.target.value })} />
                  </Field>
                  <Field label="Estado">
                    <Input value={institution.state} onChange={(event) => setInstitution({ ...institution, state: event.target.value })} />
                  </Field>
                </div>
                <Field label="Dirección">
                  <Input value={institution.address} onChange={(event) => setInstitution({ ...institution, address: event.target.value })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Teléfono">
                    <Input value={institution.phone} onChange={(event) => setInstitution({ ...institution, phone: event.target.value })} />
                  </Field>
                  <Field label="WhatsApp">
                    <Input value={institution.whatsapp} onChange={(event) => setInstitution({ ...institution, whatsapp: event.target.value })} />
                  </Field>
                  <Field label="Correo de admisiones">
                    <Input value={institution.email} onChange={(event) => setInstitution({ ...institution, email: event.target.value })} />
                  </Field>
                  <Field label="Horario de atención">
                    <Input value={institution.hours} onChange={(event) => setInstitution({ ...institution, hours: event.target.value })} />
                  </Field>
                </div>
                <Field label="Enlace de Google Maps">
                  <Input value={institution.mapUrl} onChange={(event) => setInstitution({ ...institution, mapUrl: event.target.value })} />
                </Field>

                <div className="border-t border-border pt-4">
                  <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <Palette className="h-3.5 w-3.5" aria-hidden="true" />
                    Identidad visual
                  </h2>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["ink", "Verde principal"],
                      ["deep", "Verde profundo"],
                      ["sand", "Arena"],
                      ["paper", "Crema"],
                    ].map(([key, label]) => (
                      <label key={key} className="block">
                        <span className="mb-1 block text-[11px] text-muted-foreground">{label}</span>
                        <span className="flex items-center gap-2 border border-input bg-background px-2 py-1.5">
                          <input
                            type="color"
                            value={brand[key]}
                            onChange={(event) => updateBrand(key, event.target.value)}
                            className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0"
                            aria-label={label}
                          />
                          <span className="font-mono text-[11px] uppercase text-foreground">{brand[key]}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Se aplican a la interfaz de esta sesión. El valor base vive en los estilos del proyecto para conservarse
                    entre visitantes.
                  </p>
                </div>

                <div className="flex justify-end border-t border-border pt-4">
                  <Button type="submit" disabled={saving || !can("settings.view")}>
                    <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                    {saving ? "Guardando…" : "Guardar configuración"}
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                <section className="border border-border bg-card p-5">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ciclo escolar</h2>
                  <ul className="mt-3 space-y-2 text-[13px]">
                    {(settings.data?.cycles || []).map((cycle) => (
                      <li key={cycle.id} className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0">
                        <span className="text-foreground">{cycle.name}</span>
                        <span className={`text-[11px] uppercase tracking-[0.1em] ${cycle.status === "activo" ? "text-primary" : "text-muted-foreground"}`}>
                          {cycle.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {isDemoMode ? (
                  <section className="border border-amber-300 bg-amber-50 p-5">
                    <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-amber-900">
                      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                      Utilidades de demostración
                    </h2>
                    <p className="mt-2 text-[12px] leading-relaxed text-amber-900/80">
                      Solo existen en modo mock. Sirven para verificar el manejo de sesión vencida y reiniciar los datos.
                    </p>
                    <div className="mt-3 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-amber-300 bg-white/60"
                        onClick={async () => {
                          await services.demo.expireSession();
                          try {
                            await services.students.list({ pageSize: 1 });
                          } catch {
                            /* el manejador global redirige */
                          }
                        }}
                      >
                        <TimerOff className="mr-2 h-4 w-4" aria-hidden="true" />
                        Simular sesión vencida
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-amber-300 bg-white/60"
                        onClick={async () => {
                          await services.demo.reset();
                          window.location.reload();
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                        Reiniciar datos ficticios
                      </Button>
                    </div>
                  </section>
                ) : null}

                <section className="border border-border bg-card p-5 text-[12px] leading-relaxed text-muted-foreground">
                  <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">Sesión y API</h2>
                  <p className="mt-2">
                    El modo de ejecución y la URL base de la API se configuran en la configuración del frontend
                    (<span className="font-mono text-[11px]">VITE_DATA_MODE</span> y <span className="font-mono text-[11px]">VITE_API_BASE_URL</span>).
                  </p>
                  <p className="mt-2">Los secretos del servidor nunca se incluyen en esta interfaz.</p>
                </section>
              </div>
            </div>
          ) : null
        }
      </AsyncState>
    </div>
  );
}