import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Printer, Send, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { StudentPicker } from "@/components/panel/StudentPicker";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { useSession } from "@/lib/SessionContext";
import { formatDate } from "@/lib/format";
import { Crest } from "@/components/public/Crest";

export const Route = createFileRoute("/panel/boletas")({
  head: () => ({ meta: [{ title: "Boletas · Panel escolar" }] }),
  component: ReportCardsPage,
});

const QUALITATIVE_LABELS = { A: "Avanzado", S: "Satisfactorio", B: "Básico", R: "Requiere apoyo" };

function ReportCardsPage() {
  const queryClient = useQueryClient();
  const { can } = useSession();
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });
  const [student, setStudent] = useState(null);
  const [periodId, setPeriodId] = useState("per-1");
  const [correctionOpen, setCorrectionOpen] = useState(false);

  const card = useServiceQuery(["report-card", student?.id, periodId], () => services.grades.reportCard({ studentId: student.id, periodId }), {
    enabled: Boolean(student?.id && periodId),
  });
  const corrections = useServiceQuery(["corrections", student?.id], () => services.grades.listCorrections({ studentId: student?.id }), {
    enabled: Boolean(student?.id),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["report-card"] });
    queryClient.invalidateQueries({ queryKey: ["corrections"] });
  };

  async function authorize(id, decision) {
    await services.grades.authorizeCorrection(id, { decision, note: decision === "autorizar" ? "Corrección autorizada" : "Sin elementos para corregir" });
    refresh();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Académico"
        title="Boletas y correcciones"
        description="Consulta la boleta de un alumno, imprímela y gestiona solicitudes de corrección."
        actions={
          card.data ? (
            <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Imprimir boleta
            </Button>
          ) : null
        }
      />

      <div className="no-print">
        <FilterBar>
          <FilterField label="Alumno" className="sm:w-80">
            <StudentPicker value={student?.id} onChange={setStudent} />
          </FilterField>
          <FilterField label="Periodo" className="sm:w-56">
            <Select value={periodId} onValueChange={setPeriodId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(catalog.data?.periods || []).map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          {student ? (
            <Button variant="outline" size="sm" onClick={() => setCorrectionOpen(true)}>
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              Solicitar corrección
            </Button>
          ) : null}
        </FilterBar>
      </div>

      {!student ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Busca un alumno para ver su boleta del periodo seleccionado.
        </p>
      ) : (
        <AsyncState query={card} loadingLabel="Preparando la boleta…">
          {(data) => (
            <div className="space-y-5">
              <article className="print-area border border-border bg-white p-6 sm:p-10">
                <header className="flex items-start justify-between gap-4 border-b border-brand-ink/20 pb-5">
                  <div className="flex items-center gap-3">
                    <Crest className="h-12 w-12 text-brand-ink" />
                    <div>
                      <p className="font-display text-lg leading-none text-brand-ink">Colegio Monteverde</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">Puebla, Pue. · Ciclo 2026-2027</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Boleta de calificaciones</p>
                    <p className="font-display text-base text-brand-ink">{data.period?.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {formatDate(data.period?.startDate)} — {formatDate(data.period?.endDate)}
                    </p>
                  </div>
                </header>

                <dl className="mt-5 grid gap-3 text-[12px] sm:grid-cols-4">
                  <div>
                    <dt className="text-neutral-500">Alumno</dt>
                    <dd className="font-medium text-brand-ink">{data.student.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Matrícula</dt>
                    <dd className="font-mono text-brand-ink">{data.student.matricula}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Grado y grupo</dt>
                    <dd className="text-brand-ink">
                      {data.student.gradeName} · {data.student.groupName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Nivel</dt>
                    <dd className="text-brand-ink">{data.student.levelName}</dd>
                  </div>
                </dl>

                <table className="mt-6 w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="border-y border-brand-ink/20 bg-neutral-50">
                      <th className="py-2 pl-2 text-left font-semibold uppercase tracking-[0.1em] text-neutral-600">Materia</th>
                      <th className="py-2 text-left font-semibold uppercase tracking-[0.1em] text-neutral-600">Docente</th>
                      <th className="w-[110px] py-2 pr-2 text-right font-semibold uppercase tracking-[0.1em] text-neutral-600">
                        {data.gradingType === "numerica" ? "Calificación" : "Nivel"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => (
                      <tr key={row.subjectId} className="border-b border-neutral-200">
                        <td className="py-2 pl-2 text-brand-ink">{row.subjectName}</td>
                        <td className="py-2 text-neutral-600">{row.teacherName}</td>
                        <td className="py-2 pr-2 text-right font-medium text-brand-ink">
                          {row.value !== null && row.value !== undefined
                            ? Number(row.value).toFixed(1)
                            : row.qualitative
                              ? `${row.qualitative} · ${QUALITATIVE_LABELS[row.qualitative]}`
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                  <p className="text-[11px] text-neutral-500">
                    {data.published ? "Boleta publicada" : "Boleta en captura: la información puede cambiar"} ·{" "}
                    {data.rows.filter((row) => row.status === "publicado").length} de {data.rows.length} materias publicadas
                  </p>
                  {data.average !== null ? (
                    <p className="font-display text-lg text-brand-ink">
                      Promedio <span className="tabular">{data.average.toFixed(1)}</span>
                    </p>
                  ) : null}
                </div>

                <div className="mt-10 grid grid-cols-2 gap-8 text-[11px] text-neutral-500">
                  <div className="border-t border-neutral-300 pt-2 text-center">Dirección académica</div>
                  <div className="border-t border-neutral-300 pt-2 text-center">Tutor</div>
                </div>
              </article>

              <section className="no-print border border-border bg-card">
                <header className="border-b border-border px-5 py-3.5">
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Solicitudes de corrección
                  </h3>
                </header>
                {corrections.isPending ? (
                  <p className="px-5 py-4 text-sm text-muted-foreground">Cargando…</p>
                ) : corrections.data?.items?.length ? (
                  <ul className="divide-y divide-border">
                    {corrections.data.items.map((correction) => (
                      <li key={correction.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">
                            {correction.subjectName} · {correction.periodName}
                          </p>
                          <p className="mt-0.5 max-w-xl text-[13px] text-muted-foreground">{correction.reason}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Solicitada por {correction.requestedBy} · {formatDate(correction.requestedAt)}
                            {correction.resolvedBy ? ` · Resuelta por ${correction.resolvedBy}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={correction.status} />
                          {correction.status === "solicitada" && can("grades.publish") ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => authorize(correction.id, "autorizar")}>
                                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                Autorizar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => authorize(correction.id, "rechazar")}>
                                Rechazar
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-4 text-sm text-muted-foreground">Sin solicitudes de corrección para este alumno.</p>
                )}
              </section>

              <CorrectionDialog
                open={correctionOpen}
                onOpenChange={setCorrectionOpen}
                student={student}
                periodId={periodId}
                subjects={data.rows}
                onSaved={refresh}
              />
            </div>
          )}
        </AsyncState>
      )}

      {!student ? (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <FileText className="h-4 w-4" aria-hidden="true" />
          La boleta se genera con los datos que devuelve la API para el periodo seleccionado.
        </div>
      ) : null}
    </div>
  );
}

function CorrectionDialog({ open, onOpenChange, student, periodId, subjects, onSaved }) {
  const [subjectId, setSubjectId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (!subjectId || reason.trim().length < 10) {
      setError("Selecciona la materia y describe el motivo (mínimo 10 caracteres).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await services.grades.requestCorrection({ studentId: student.id, periodId, subjectId, reason });
      setSubjectId("");
      setReason("");
      onOpenChange(false);
      onSaved();
    } catch (submitError) {
      setError(submitError.message || "No se pudo enviar la solicitud.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Solicitar corrección</DialogTitle>
          <DialogDescription>La solicitud queda registrada para revisión de dirección académica.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <Field label="Materia" required>
            <Select value={subjectId || undefined} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Motivo" required>
            <Textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explica qué calificación debe revisarse y por qué." />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enviando…" : "Enviar solicitud"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}