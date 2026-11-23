import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { useSession } from "@/lib/SessionContext";

export const Route = createFileRoute("/panel/asignaciones")({
  head: () => ({ meta: [{ title: "Asignaciones docentes · Panel escolar" }] }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const queryClient = useQueryClient();
  const { user, can } = useSession();
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });
  const [groupId, setGroupId] = useState("");

  const groups = (catalog.data?.groups || []).filter((group) => {
    if (user?.role !== "docente") return true;
    return true;
  });

  const assignments = useServiceQuery(["assignments", groupId], () => services.catalog.assignments({ groupId }), {
    enabled: Boolean(groupId),
  });

  const [draft, setDraft] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (assignments.data) {
      const map = {};
      assignments.data.forEach((row) => {
        map[row.subjectId] = row.teacherId || "";
      });
      setDraft(map);
    }
  }, [assignments.data]);

  async function save(subjectId) {
    setSavingId(subjectId);
    setMessage("");
    try {
      await services.catalog.saveAssignment({ groupId, subjectId, teacherId: draft[subjectId] });
      await queryClient.invalidateQueries({ queryKey: ["assignments", groupId] });
      setMessage("Asignación guardada.");
    } catch (error) {
      setMessage(error.message || "No se pudo guardar la asignación.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comunidad"
        title="Asignación docente"
        description="Define qué docente imparte cada materia en cada grupo del ciclo escolar."
      />

      <div className="max-w-xs">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Grupo</p>
        <Select value={groupId || undefined} onValueChange={setGroupId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un grupo" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.displayName} · {group.levelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {message ? (
        <p role="status" className="border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          {message}
        </p>
      ) : null}

      {!groupId ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Selecciona un grupo para ver y editar sus materias.
        </p>
      ) : (
        <AsyncState query={assignments} loadingLabel="Cargando materias del grupo…" emptyTitle="El grupo no tiene materias">
          {(rows) => (
            <div className="overflow-x-auto border border-border bg-card">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Materia</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Docente asignado</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Horario</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.subjectId} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{row.subjectName}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={draft[row.subjectId] || "sin"}
                          onValueChange={(value) => setDraft((current) => ({ ...current, [row.subjectId]: value === "sin" ? "" : value }))}
                          disabled={!can("assignments.manage")}
                        >
                          <SelectTrigger className="h-9 w-[220px]">
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sin">Sin asignar</SelectItem>
                            {(catalog.data?.teachers || []).map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">
                        {row.schedule.length ? row.schedule.map((slot) => `${slot.day} ${slot.start}-${slot.end}`).join(" · ") : "Sin horario"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {can("assignments.manage") ? (
                          <Button size="sm" variant="outline" onClick={() => save(row.subjectId)} disabled={savingId === row.subjectId}>
                            {savingId === row.subjectId ? "Guardando…" : "Guardar"}
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncState>
      )}
    </div>
  );
}