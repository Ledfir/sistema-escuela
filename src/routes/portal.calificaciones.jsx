import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { EmptyState } from "@/components/ui-kit/States";
import { Button } from "@/components/ui/button";
import { usePortal } from "@/components/portal/PortalContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDate } from "@/lib/format";
import { Crest } from "@/components/public/Crest";

export const Route = createFileRoute("/portal/calificaciones")({
  head: () => ({ meta: [{ title: "Calificaciones · Portal familiar" }] }),
  component: PortalGrades,
});

const QUALITATIVE_LABELS = { A: "Avanzado", S: "Satisfactorio", B: "Básico", R: "Requiere apoyo" };

function PortalGrades() {
  const { student, studentId } = usePortal();
  const grades = useServiceQuery(["portal-grades", studentId], () => services.portal.grades(studentId), {
    enabled: Boolean(studentId),
  });
  const [periodId, setPeriodId] = useState(null);

  if (!student) return <EmptyState title="Sin alumno seleccionado" description="Selecciona un alumno para ver sus boletas." />;

  return (
    <div className="space-y-5">
      <div className="no-print">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{student.fullName}</p>
        <h1 className="font-display text-2xl text-foreground">Boletas publicadas</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Solo se muestran los periodos con calificaciones publicadas por el colegio.
        </p>
      </div>

      <AsyncState query={grades} loadingLabel="Cargando boletas…" emptyTitle="Aún no hay boletas publicadas" emptyDescription="Cuando el colegio publique las calificaciones del periodo, aparecerán aquí.">
        {(data) => {
          const activeId = periodId || data.cards[0]?.period.id;
          const card = data.cards.find((item) => item.period.id === activeId) || data.cards[0];

          return (
            <div className="space-y-4">
              <div className="no-print flex flex-wrap gap-1">
                {data.cards.map((item) => (
                  <button
                    key={item.period.id}
                    type="button"
                    onClick={() => setPeriodId(item.period.id)}
                    className={`border px-3 py-1.5 text-[12px] transition ${
                      activeId === item.period.id
                        ? "border-brand-ink bg-brand-ink text-brand-paper"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.period.name}
                  </button>
                ))}
              </div>

              {card ? (
                <article className="print-area border border-border bg-white p-5 sm:p-8">
                  <header className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Crest className="h-10 w-10 text-brand-ink" />
                      <div>
                        <p className="font-display text-[15px] leading-none text-brand-ink">Colegio Monteverde</p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-neutral-500">Ciclo 2026-2027</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">Boleta</p>
                      <p className="font-display text-[14px] text-brand-ink">{card.period.name}</p>
                      <p className="text-[10px] text-neutral-500">
                        {formatDate(card.period.startDate)} — {formatDate(card.period.endDate)}
                      </p>
                    </div>
                  </header>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
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
                      <dt className="text-neutral-500">Promedio</dt>
                      <dd className="font-medium text-brand-ink tabular">{card.average !== null ? card.average.toFixed(1) : "—"}</dd>
                    </div>
                  </dl>

                  <table className="mt-4 w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="border-y border-neutral-200 bg-neutral-50">
                        <th className="py-1.5 pl-2 text-left font-semibold uppercase tracking-[0.1em] text-neutral-600">Materia</th>
                        <th className="py-1.5 text-left font-semibold uppercase tracking-[0.1em] text-neutral-600">Docente</th>
                        <th className="py-1.5 pr-2 text-right font-semibold uppercase tracking-[0.1em] text-neutral-600">Calificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {card.rows.map((row) => (
                        <tr key={row.subjectId} className="border-b border-neutral-100">
                          <td className="py-1.5 pl-2 text-brand-ink">{row.subjectName}</td>
                          <td className="py-1.5 text-neutral-600">{row.teacherName}</td>
                          <td className="py-1.5 pr-2 text-right font-medium text-brand-ink">
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

                  <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] text-neutral-500">
                    <div className="border-t border-neutral-300 pt-2 text-center">Dirección académica</div>
                    <div className="border-t border-neutral-300 pt-2 text-center">Tutor</div>
                  </div>
                </article>
              ) : null}

              <div className="no-print flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                  Imprimir boleta
                </Button>
                <Button variant="ghost" onClick={() => window.print()}>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Guardar como PDF (usar «Guardar como PDF» al imprimir)
                </Button>
              </div>
            </div>
          );
        }}
      </AsyncState>
    </div>
  );
}