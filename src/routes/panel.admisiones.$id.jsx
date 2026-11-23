import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Mail, Phone, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { Field, FormError } from "@/components/ui-kit/Field";
import { StudentPicker } from "@/components/panel/StudentPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { isDemoMode, services } from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, formatDateTime, mxToday } from "@/lib/format";
import { useSession } from "@/lib/SessionContext";

const STAGES = [
  ["nuevo", "Nuevo"],
  ["contactado", "Contactado"],
  ["visita", "Visita agendada"],
  ["evaluacion", "En evaluación"],
  ["aceptado", "Aceptado"],
  ["descartado", "Descartado"],
];

export const Route = createFileRoute("/panel/admisiones/$id")({
  validateSearch: (search) => ({ volver: search.volver || undefined }),
  head: () => ({ meta: [{ title: "Ficha del prospecto · Panel escolar" }] }),
  component: AdmissionDetail,
});

function AdmissionDetail() {
  const { id } = Route.useParams();
  const { volver } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = useSession();

  const detail = useServiceQuery(["admission", id], () => services.admissions.get(id));
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });

  const [followUp, setFollowUp] = useState({ note: "", stage: "", nextAction: "", nextActionDate: "" });
  const [followUpError, setFollowUpError] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const [conversion, setConversion] = useState({ cycleId: "", gradeId: "", groupId: "", mode: "nuevo" });
  const [existingStudent, setExistingStudent] = useState(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState(null);
  const [converted, setConverted] = useState(null);

  const grades = (catalog.data?.grades || []).filter((grade) => grade.levelId === detail.data?.levelId);
  const groups = (catalog.data?.groups || []).filter((group) => group.gradeId === conversion.gradeId);

  async function submitFollowUp(event) {
    event.preventDefault();
    if (savingFollowUp) return;
    if (followUp.note.trim().length < 5) {
      setFollowUpError("Escribe una nota de al menos 5 caracteres.");
      return;
    }
    setFollowUpError("");
    setSavingFollowUp(true);
    try {
      await services.admissions.addFollowUp(id, followUp);
      setFollowUp({ note: "", stage: "", nextAction: "", nextActionDate: "" });
      await queryClient.invalidateQueries({ queryKey: ["admission", id] });
      await queryClient.invalidateQueries({ queryKey: ["admissions"] });
    } catch (error) {
      setFollowUpError(error.message || "No se pudo guardar el seguimiento.");
    } finally {
      setSavingFollowUp(false);
    }
  }

  async function submitConversion(event) {
    event.preventDefault();
    if (converting) return;
    setConvertError(null);
    if (!conversion.cycleId || !conversion.groupId) {
      setConvertError({ message: "Selecciona ciclo escolar y grupo para continuar." });
      return;
    }
    if (conversion.mode === "existente" && !existingStudent) {
      setConvertError({ message: "Selecciona al alumno ya registrado." });
      return;
    }
    setConverting(true);
    try {
      const result = await services.admissions.convert(id, {
        cycleId: conversion.cycleId,
        gradeId: conversion.gradeId,
        groupId: conversion.groupId,
        studentMode: conversion.mode,
        studentId: existingStudent?.id,
      });
      setConverted(result.student);
      await queryClient.invalidateQueries({ queryKey: ["admission", id] });
      await queryClient.invalidateQueries({ queryKey: ["admissions"] });
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    } catch (error) {
      setConvertError(error);
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Link to={`/panel/admisiones${volver || ""}`} className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al listado
      </Link>

      <AsyncState query={detail} loadingLabel="Cargando ficha del prospecto…">
        {(record) => (
          <div className="space-y-5">
            <PageHeader
              eyebrow={`${record.levelName}${record.gradeName ? ` · ${record.gradeName}` : ""}`}
              title={record.fullName}
              description={`Registrado el ${formatDate(record.createdAt)} · Origen: ${record.source === "sitio_web" ? "sitio web" : record.source}`}
              actions={<StatusBadge status={record.stage} />}
            />

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <section className="border border-border bg-card">
                  <header className="border-b border-border px-5 py-3.5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Datos de contacto</h3>
                  </header>
                  <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Teléfono</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        <a href={`tel:${record.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-ink">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          {record.phone || "Sin registrar"}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Correo</dt>
                      <dd className="mt-1 truncate text-sm text-foreground">
                        <a href={`mailto:${record.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-ink">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          {record.email || "Sin registrar"}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Responsable</dt>
                      <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                        <UserRound className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        {record.ownerName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Próxima acción</dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {record.nextAction} · {formatDate(record.nextActionDate)}
                      </dd>
                    </div>
                    {record.message ? (
                      <div className="sm:col-span-2">
                        <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Mensaje del formulario</dt>
                        <dd className="mt-1 border-l-2 border-brand-sand pl-3 text-sm leading-relaxed text-muted-foreground">
                          {record.message}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>

                <section className="border border-border bg-card">
                  <header className="border-b border-border px-5 py-3.5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Historial de seguimiento
                    </h3>
                  </header>
                  {record.followUps.length ? (
                    <ol className="space-y-4 px-5 py-4">
                      {record.followUps.map((item) => (
                        <li key={item.id} className="relative border-l border-border pl-4">
                          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-brand-gold" aria-hidden="true" />
                          <p className="text-sm leading-relaxed text-foreground">{item.note}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {item.byName} · {formatDateTime(item.at)}
                            {item.stage ? ` · ${item.stage}` : ""}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="px-5 py-4 text-sm text-muted-foreground">Aún no hay seguimientos registrados.</p>
                  )}

                  {can("admissions.manage") ? (
                    <form onSubmit={submitFollowUp} className="space-y-3 border-t border-border px-5 py-4">
                      <FormError message={followUpError} />
                      <Field label="Nueva nota de seguimiento" htmlFor="note">
                        <Textarea
                          id="note"
                          rows={3}
                          value={followUp.note}
                          onChange={(event) => setFollowUp((current) => ({ ...current, note: event.target.value }))}
                          placeholder="Llamada, visita, información enviada…"
                        />
                      </Field>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Nueva etapa">
                          <Select value={followUp.stage || undefined} onValueChange={(value) => setFollowUp((current) => ({ ...current, stage: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sin cambio" />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES.map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Próxima acción">
                          <Input
                            value={followUp.nextAction}
                            onChange={(event) => setFollowUp((current) => ({ ...current, nextAction: event.target.value }))}
                            placeholder="Enviar costos"
                          />
                        </Field>
                        <Field label="Fecha">
                          <Input
                            type="date"
                            value={followUp.nextActionDate}
                            onChange={(event) => setFollowUp((current) => ({ ...current, nextActionDate: event.target.value }))}
                          />
                        </Field>
                      </div>
                      <Button type="submit" size="sm" disabled={savingFollowUp}>
                        {savingFollowUp ? "Guardando…" : "Registrar seguimiento"}
                      </Button>
                    </form>
                  ) : null}
                </section>
              </div>

              <div className="space-y-5">
                <section className="border border-border bg-card">
                  <header className="border-b border-border px-5 py-3.5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Conversión a inscripción</h3>
                  </header>
                  {converted ? (
                    <div className="space-y-3 px-5 py-5">
                      <CheckCircle2 className="h-7 w-7 text-primary" aria-hidden="true" />
                      <p className="text-sm text-foreground">
                        Inscripción concluida para <strong>{converted.fullName}</strong> en {converted.gradeName} {converted.groupName}.
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">Matrícula {converted.matricula}</p>
                      <Button asChild size="sm" className="w-full">
                        <Link to="/panel/alumnos/$id" params={{ id: converted.id }} search={{ volver: "" }}>
                          Abrir expediente
                        </Link>
                      </Button>
                    </div>
                  ) : record.stage === "inscrito" ? (
                    <p className="px-5 py-4 text-sm text-muted-foreground">
                      Este prospecto ya fue convertido en inscripción. Consulta el expediente del alumno.
                    </p>
                  ) : (
                    <form onSubmit={submitConversion} className="space-y-3 px-5 py-4">
                      {convertError ? (
                        <div role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[13px] text-destructive">
                          <p className="flex items-start gap-2 font-medium">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            {convertError.code === "CUPO_INSUFICIENTE"
                              ? "Cupo insuficiente"
                              : convertError.code === "EXPEDIENTE_DUPLICADO"
                                ? "Expediente duplicado"
                                : "No se pudo completar"}
                          </p>
                          <p className="mt-1 leading-relaxed">{convertError.message}</p>
                          {convertError.code === "EXPEDIENTE_DUPLICADO" && convertError.payload?.studentId ? (
                            <Link
                              to="/panel/alumnos/$id"
                              params={{ id: convertError.payload.studentId }}
                              search={{ volver: "" }}
                              className="mt-2 inline-block underline underline-offset-2"
                            >
                              Abrir el expediente existente
                            </Link>
                          ) : null}
                        </div>
                      ) : null}

                      <Field label="Ciclo escolar" required>
                        <Select value={conversion.cycleId || undefined} onValueChange={(value) => setConversion((current) => ({ ...current, cycleId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona ciclo" />
                          </SelectTrigger>
                          <SelectContent>
                            {(catalog.data?.cycles || []).map((cycle) => (
                              <SelectItem key={cycle.id} value={cycle.id}>
                                {cycle.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label="Grado" required>
                        <Select
                          value={conversion.gradeId || undefined}
                          onValueChange={(value) => setConversion((current) => ({ ...current, gradeId: value, groupId: "" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona grado" />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade.id} value={grade.id}>
                                {grade.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label="Grupo" required hint="Se muestra el cupo disponible de cada grupo">
                        <Select value={conversion.groupId || undefined} onValueChange={(value) => setConversion((current) => ({ ...current, groupId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.displayName} · {group.enrolled}/{group.capacity} {group.enrolled >= group.capacity ? "(sin cupo)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label="Tipo de alta">
                        <div className="flex gap-2">
                          {[
                            ["nuevo", "Alumno nuevo"],
                            ["existente", "Ya registrado"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setConversion((current) => ({ ...current, mode: value }))}
                              className={`flex-1 border px-3 py-2 text-[12px] transition ${
                                conversion.mode === value
                                  ? "border-brand-ink bg-brand-ink text-brand-paper"
                                  : "border-border bg-background text-foreground hover:bg-muted"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </Field>

                      {conversion.mode === "existente" ? (
                        <Field label="Alumno registrado">
                          <StudentPicker value={existingStudent?.id} onChange={setExistingStudent} />
                        </Field>
                      ) : (
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          Se creará el expediente con el nombre del prospecto y se generarán los cargos de inscripción y
                          primera colegiatura.
                        </p>
                      )}

                      <Button type="submit" className="w-full" disabled={converting}>
                        {converting ? "Procesando…" : "Convertir a inscripción"}
                      </Button>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        Hoy es {formatDate(mxToday())}. El servidor valida cupo y expedientes duplicados.
                      </p>
                      {isDemoMode ? (
                        <button
                          type="button"
                          onClick={() => services.demo.forceDuplicateError()}
                          className="w-full text-center text-[10px] text-muted-foreground underline underline-offset-2 hover:text-brand-ink"
                        >
                          Simular expediente duplicado en el siguiente intento
                        </button>
                      ) : null}
                    </form>
                  )}
                </section>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/panel/admisiones", search: {} })}
                  className="w-full border border-border bg-card px-4 py-2.5 text-[12px] text-muted-foreground hover:text-foreground"
                >
                  Volver a la bandeja de admisiones
                </button>
              </div>
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
}