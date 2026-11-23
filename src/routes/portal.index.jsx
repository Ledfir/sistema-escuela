import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, CreditCard, Megaphone, TrendingUp, UserRound } from "lucide-react";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { EmptyState } from "@/components/ui-kit/States";
import { usePortal } from "@/components/portal/PortalContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency, formatDate, formatDateTime, initials } from "@/lib/format";

export const Route = createFileRoute("/portal/")({
  head: () => ({ meta: [{ title: "Inicio · Portal familiar" }] }),
  component: PortalHome,
});

function PortalHome() {
  const { student, studentId } = usePortal();
  const summary = useServiceQuery(["portal-summary", studentId], () => services.portal.summary(studentId), {
    enabled: Boolean(studentId),
  });

  if (!student) return <EmptyState title="Sin alumnos vinculados" description="Solicita a control escolar que vincule a tus hijos con tu cuenta." />;

  return (
    <div className="space-y-5">
      <section className="border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-sand/40 font-display text-lg text-brand-ink">
            {initials(student.fullName)}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Alumno</p>
            <h1 className="truncate font-display text-2xl leading-tight text-foreground">{student.fullName}</h1>
            <p className="text-[12px] text-muted-foreground">
              {student.gradeName} · Grupo {student.groupName} · {student.matricula}
            </p>
          </div>
        </div>
      </section>

      <AsyncState query={summary} loadingLabel="Preparando el resumen…" rows={3}>
        {(data) => (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Link to="/portal/estado-cuenta" className="border border-border bg-card p-4 transition hover:border-brand-ink/30">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                  Saldo
                </p>
                <p className={`mt-1.5 font-display text-2xl tabular ${data.balance > 0 ? "text-destructive" : "text-primary"}`}>
                  {formatCurrency(data.balance)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {data.nextDueDate ? `Próximo vencimiento ${formatDate(data.nextDueDate)}` : "Sin cargos pendientes"}
                </p>
              </Link>

              <Link to="/portal/asistencia" className="border border-border bg-card p-4 transition hover:border-brand-ink/30">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                  Asistencia
                </p>
                <p className="mt-1.5 font-display text-2xl tabular text-foreground">{data.attendanceRate}%</p>
                <p className="mt-1 text-[11px] text-muted-foreground">del ciclo registrado</p>
              </Link>

              <Link to="/portal/asistencia" className="border border-border bg-card p-4 transition hover:border-brand-ink/30">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                  Incidencias abiertas
                </p>
                <p className="mt-1.5 font-display text-2xl tabular text-foreground">{data.openIncidents}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">con seguimiento del colegio</p>
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    Próximos eventos
                  </h2>
                  <Link to="/portal/calendario" className="text-[11px] text-brand-ink hover:underline">
                    Ver calendario
                  </Link>
                </header>
                <ul className="divide-y divide-border">
                  {data.events.map((event) => (
                    <li key={event.id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{event.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(event.date)} · {event.startTime} - {event.endTime}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
                    Avisos recientes
                  </h2>
                  <Link to="/portal/avisos" className="text-[11px] text-brand-ink hover:underline">
                    Ver todos
                  </Link>
                </header>
                <ul className="divide-y divide-border">
                  {data.announcements.map((announcement) => (
                    <li key={announcement.id} className="px-4 py-3">
                      <p className="text-[13px] font-medium text-foreground">{announcement.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{announcement.body}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {announcement.audienceLabel} · {formatDateTime(announcement.publishAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["/portal/calificaciones", "Boletas", "Consulta calificaciones publicadas"],
                ["/portal/estado-cuenta", "Estado de cuenta", "Cargos, pagos y recibos"],
                ["/portal/avisos", "Avisos", "Comunicados del colegio"],
              ].map(([to, title, description]) => (
                <Link key={to} to={to} className="flex items-center justify-between gap-2 border border-border bg-card px-4 py-3 transition hover:border-brand-ink/30">
                  <span>
                    <span className="block text-[13px] font-medium text-foreground">{title}</span>
                    <span className="block text-[11px] text-muted-foreground">{description}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
}