import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { EmptyState } from "@/components/ui-kit/States";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { usePortal } from "@/components/portal/PortalContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDate, formatDateTime, weekdayShort } from "@/lib/format";

export const Route = createFileRoute("/portal/asistencia")({
  head: () => ({ meta: [{ title: "Asistencia · Portal familiar" }] }),
  component: PortalAttendance,
});

export function PortalAttendance() {
  const { student, studentId } = usePortal();
  const attendance = useServiceQuery(["portal-attendance", studentId], () => services.portal.attendance(studentId), {
    enabled: Boolean(studentId),
  });
  const incidents = useServiceQuery(["portal-incidents", studentId], () => services.portal.incidents(studentId), {
    enabled: Boolean(studentId),
  });

  if (!student) return <EmptyState title="Sin alumno seleccionado" description="Selecciona un alumno para ver su asistencia." />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{student.fullName}</p>
        <h1 className="font-display text-2xl text-foreground">Asistencia e incidencias</h1>
      </div>

      <AsyncState query={attendance} loadingLabel="Cargando asistencia…" rows={3}>
        {(data) => (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Registros", data.summary.total],
                ["Presente", data.summary.present],
                ["Faltas", data.summary.absent],
                ["Retardos", data.summary.late],
              ].map(([label, value]) => (
                <div key={label} className="border border-border bg-card p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                  <p className="mt-1 font-display text-xl tabular text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <section className="border border-border bg-card">
              <header className="border-b border-border px-4 py-3">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Registro diario</h2>
              </header>
              <ul className="divide-y divide-border">
                {data.records.map((record) => (
                  <li key={record.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div>
                      <p className="text-[13px] text-foreground">
                        {weekdayShort(record.date)} {formatDate(record.date)}
                      </p>
                      {record.note ? <p className="text-[11px] text-muted-foreground">{record.note}</p> : null}
                    </div>
                    <StatusBadge status={record.status} />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </AsyncState>

      <section className="border border-border bg-card">
        <header className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <AlertTriangle className="h-3.5 w-3.5 text-brand-gold" aria-hidden="true" />
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Incidencias visibles para la familia</h2>
        </header>
        {incidents.isPending ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">Cargando…</p>
        ) : incidents.data?.length ? (
          <ul className="divide-y divide-border">
            {incidents.data.map((incident) => (
              <li key={incident.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium capitalize text-foreground">{incident.type}</p>
                  <StatusBadge status={incident.status} />
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{incident.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDate(incident.date)} · {incident.reportedBy}
                </p>
                {incident.followUps?.length ? (
                  <ul className="mt-2 space-y-1 border-l border-border pl-3">
                    {incident.followUps.map((followUp) => (
                      <li key={followUp.id} className="text-[11px] text-muted-foreground">
                        {followUp.note} · {formatDateTime(followUp.at)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-muted-foreground">Sin incidencias registradas.</p>
        )}
      </section>
    </div>
  );
}