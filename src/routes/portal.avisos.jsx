import { createFileRoute } from "@tanstack/react-router";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { EmptyState } from "@/components/ui-kit/States";
import { usePortal } from "@/components/portal/PortalContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/portal/avisos")({
  head: () => ({ meta: [{ title: "Avisos · Portal familiar" }] }),
  component: PortalAnnouncements,
});

function PortalAnnouncements() {
  const { student, studentId } = usePortal();
  const announcements = useServiceQuery(["portal-announcements", studentId], () => services.portal.announcements(studentId), {
    enabled: Boolean(studentId),
  });

  if (!student) return <EmptyState title="Sin alumno seleccionado" description="Selecciona un alumno para ver los avisos de su grupo." />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {student.gradeName} · Grupo {student.groupName}
        </p>
        <h1 className="font-display text-2xl text-foreground">Avisos del colegio</h1>
      </div>

      <AsyncState query={announcements} loadingLabel="Cargando avisos…" emptyTitle="Sin avisos por ahora" emptyDescription="Los comunicados del colegio aparecerán aquí.">
        {(data) => (
          <ul className="space-y-3">
            {data.map((announcement) => (
              <li key={announcement.id} className="border border-border bg-card p-5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-brand-gold">{announcement.audienceLabel}</p>
                <h2 className="mt-1.5 font-display text-lg text-foreground">{announcement.title}</h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{announcement.body}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {announcement.authorName} · {formatDateTime(announcement.publishAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AsyncState>
    </div>
  );
}