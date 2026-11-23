import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, ClipboardCheck, CreditCard, Megaphone, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { KpiCard } from "@/components/panel/KpiCard";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { useSession } from "@/lib/SessionContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency, formatDate, formatDateTime, mxToday } from "@/lib/format";

export const Route = createFileRoute("/panel/")({
  head: () => ({ meta: [{ title: "Inicio · Panel escolar" }] }),
  component: DashboardPage,
});

const QUICK_ACTIONS = {
  admin: [
    { to: "/panel/admisiones", label: "Revisar prospectos", icon: UserPlus },
    { to: "/panel/calificaciones", label: "Calificaciones en captura", icon: ClipboardCheck },
    { to: "/panel/cargos", label: "Cargos y adeudos", icon: CreditCard },
    { to: "/panel/avisos", label: "Publicar un aviso", icon: Megaphone },
  ],
  direccion: [
    { to: "/panel/reportes", label: "Reportes académicos", icon: ClipboardCheck },
    { to: "/panel/boletas", label: "Revisar boletas", icon: ClipboardCheck },
    { to: "/panel/calendario", label: "Calendario escolar", icon: CalendarClock },
  ],
  control_escolar: [
    { to: "/panel/admisiones", label: "Prospectos por atender", icon: UserPlus },
    { to: "/panel/alumnos", label: "Expedientes de alumnos", icon: ClipboardCheck },
    { to: "/panel/asignaciones", label: "Asignaciones docentes", icon: CalendarClock },
  ],
  docente: [
    { to: "/panel/asistencia", label: "Pasar lista de hoy", icon: ClipboardCheck },
    { to: "/panel/calificaciones", label: "Capturar calificaciones", icon: ClipboardCheck },
    { to: "/panel/incidencias", label: "Registrar incidencia", icon: Megaphone },
  ],
  caja: [
    { to: "/panel/pagos", label: "Registrar un pago", icon: CreditCard },
    { to: "/panel/cargos", label: "Generar cargos", icon: CreditCard },
    { to: "/panel/corte", label: "Corte de caja del día", icon: ClipboardCheck },
  ],
};

function DashboardPage() {
  const { user, roleLabel } = useSession();
  const overview = useServiceQuery(["dashboard-overview"], () => services.dashboard.overview());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatDate(mxToday())}
        title={`Buen día, ${user?.name?.split(" ")[0] || ""}`}
        description={`${roleLabel} · Este es el resumen de la operación del colegio.`}
      />

      <AsyncState query={overview} loadingLabel="Preparando el resumen…" rows={3}>
        {(data) => (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.kpis.map((kpi) => (
                <KpiCard key={kpi.key} kpi={kpi} />
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <section className="border border-border bg-card lg:col-span-2">
                <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {data.myGroups ? "Mis grupos asignados" : data.recentPayments ? "Últimos pagos registrados" : "Actividad reciente"}
                  </h3>
                  <Link
                    to={data.myGroups ? "/panel/asignaciones" : data.recentPayments ? "/panel/pagos" : "/panel/auditoria"}
                    className="text-[12px] text-brand-ink hover:underline"
                  >
                    Ver todo
                  </Link>
                </header>

                {data.myGroups ? (
                  <ul className="divide-y divide-border">
                    {data.myGroups.map((group) => (
                      <li key={group.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {group.gradeName} · Grupo {group.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {group.levelName} · {group.students} alumnos
                          </p>
                        </div>
                        <Link
                          to="/panel/asistencia"
                          search={{ grupo: group.id }}
                          className="text-[12px] text-brand-ink hover:underline"
                        >
                          Pasar lista
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : data.recentPayments ? (
                  <ul className="divide-y divide-border">
                    {data.recentPayments.map((payment) => (
                      <li key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">{payment.studentName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {payment.folio} · {formatDate(payment.date)}
                          </p>
                        </div>
                        <span className="tabular text-sm font-medium text-foreground">{formatCurrency(payment.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="divide-y divide-border">
                    {data.activity.map((item) => (
                      <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{item.userName}</span> · {item.detail || item.action}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.entity} · {formatDateTime(item.at)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="border border-border bg-card">
                <header className="border-b border-border px-5 py-3.5">
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Accesos rápidos</h3>
                </header>
                <ul className="p-2">
                  {(QUICK_ACTIONS[data.role] || []).map((action) => {
                    const Icon = action.icon;
                    return (
                      <li key={action.to}>
                        <Link
                          to={action.to}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] text-foreground transition hover:bg-muted"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
                            {action.label}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-border px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Estado del ciclo</p>
                  <p className="mt-1.5 text-sm text-foreground">2026-2027 · Segundo trimestre en captura</p>
                  <StatusBadge status="en_revision" label="Calificaciones en revisión" className="mt-2" />
                </div>
              </section>
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
}