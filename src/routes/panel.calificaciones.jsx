import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Lock, Save, Send } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/panel/calificaciones")({
  head: () => ({ meta: [{ title: "Calificaciones · Panel escolar" }] }),
  component: GradesPage,
});

const QUALITATIVE = [
  ["A", "Avanzado"],
  ["S", "Satisfactorio"],
  ["B", "Básico"],
  ["R", "Requiere apoyo"],
];

function GradesPage() {
  const queryClient = useQueryClient();
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });

  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [periodId, setPeriodId] = useState("");

  const group = (catalog.data?.groups || []).find((item) => item.id === groupId);
  const subjects = (catalog.data?.subjects || []).filter((subject) => subject.levelId === group?.levelId);

  const sheet = useServiceQuery(["grades-sheet", { groupId, subjectId, periodId }], () => services.grades.sheet({ groupId, subjectId, periodId }), {
    enabled: Boolean(groupId && subjectId && periodId),
  });

  const [entries, setEntries] = useState({});
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sheet.data) {
      const map = {};
      sheet.data.rows.forEach((row) => {
        map[row.studentId] = {
          value: row.value === null || row.value === undefined ? "" : String(row.value),
          qualitative: row.qualitative || "",
        };
      });
      setEntries(map);
      setMessage("");
      setError("");
    }
  }, [sheet.data]);

  const summary = useMemo(() => {
    const values = Object.values(entries);
    const captured = values.filter((entry) => entry.value !== "" || entry.qualitative).length;
    const numeric = values.filter((entry) => entry.value !== "").map((entry) => Number(entry.value));
    return {
      captured,
      total: values.length,
      average: numeric.length ? (numeric.reduce((sum, value) => sum + value, 0) / numeric.length).toFixed(1) : "—",
      zeros: numeric.filter((value) => value === 0).length,
    };
  }, [entries]);

  const update = (studentId, patch) =>
    setEntries((current) => ({ ...current, [studentId]: { ...(current[studentId] || { value: "", qualitative: "" }), ...patch } }));

  async function save(action) {
    if (saving) return;
    const invalid = Object.entries(entries).find(([, entry]) => entry.value !== "" && (Number(entry.value) < 0 || Number(entry.value) > 10));
    if (invalid) {
      setError("Las calificaciones numéricas deben estar entre 0 y 10.");
      return;
    }
    setSaving(action);
    setError("");
    setMessage("");
    try {
      const payload = Object.entries(entries).map(([studentId, entry]) => ({
        studentId,
        value: entry.value === "" ? null : Number(entry.value),
        qualitative: entry.qualitative || null,
      }));
      await services.grades.save({ groupId, subjectId, periodId, entries: payload, action });
      setMessage(
        action === "draft"
          ? "Borrador guardado. Nadie más ve estas calificaciones todavía."
          : action === "review"
            ? "Enviado a revisión de dirección académica."
            : action === "publish"
              ? "Calificaciones publicadas: ya son visibles en el portal familiar."
              : "Periodo cerrado para esta materia.",
      );
      await queryClient.invalidateQueries({ queryKey: ["grades-sheet"] });
      await queryClient.invalidateQueries({ queryKey: ["panel-catalog"] });
    } catch (saveError) {
      setError(saveError.message || "No se pudieron guardar las calificaciones.");
    } finally {
      setSaving(null);
    }
  }

  const gradingType = sheet.data?.gradingType || "numerica";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Académico"
        title="Captura de calificaciones"
        description="Captura grupal por materia y periodo. Un campo vacío significa «sin captura»; 0 es una calificación válida."
      />

      <FilterBar>
        <FilterField label="Grupo" className="sm:w-52">
          <Select value={groupId || undefined} onValueChange={(value) => { setGroupId(value); setSubjectId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona grupo" />
            </SelectTrigger>
            <SelectContent>
              {(catalog.data?.groups || []).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.displayName} · {item.levelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Materia" className="sm:w-56">
          <Select value={subjectId || undefined} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona materia" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Periodo" className="sm:w-52">
          <Select value={periodId || undefined} onValueChange={setPeriodId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona periodo" />
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
      </FilterBar>

      {!groupId || !subjectId || !periodId ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Selecciona grupo, materia y periodo para abrir la captura.
        </p>
      ) : (
        <AsyncState query={sheet} loadingLabel="Abriendo hoja de captura…" emptyTitle="El grupo no tiene alumnos activos">
          {(data) => (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-4 py-3">
                <div className="text-[13px] text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {data.group.gradeName} · {data.subject.name} · {data.period.name}
                  </p>
                  <p className="mt-0.5">
                    {formatDate(data.period.startDate)} — {formatDate(data.period.endDate)} ·{" "}
                    {gradingType === "numerica" ? "Escala 0 a 10" : "Escala cualitativa A/S/B/R"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={data.period.status} />
                  <span className="text-[12px] text-muted-foreground">
                    {summary.captured}/{summary.total} capturados
                  </span>
                  {gradingType === "numerica" ? (
                    <span className="text-[12px] text-muted-foreground">Promedio {summary.average}</span>
                  ) : null}
                  {summary.zeros ? <span className="text-[12px] text-amber-700">{summary.zeros} con 0</span> : null}
                </div>
              </div>

              {message ? (
                <p className="flex items-center gap-2 border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {message}
                </p>
              ) : null}
              {error ? (
                <p role="alert" className="flex items-center gap-2 border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {error}
                </p>
              ) : null}

              <div className="overflow-x-auto border border-border bg-card">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/60">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Alumno</th>
                      <th className="w-[180px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Calificación
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row) => {
                      const entry = entries[row.studentId] || { value: "", qualitative: "" };
                      const empty = entry.value === "" && !entry.qualitative;
                      return (
                        <tr key={row.studentId} className="border-b border-border/70 last:border-0">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-foreground">{row.fullName}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{row.matricula}</p>
                          </td>
                          <td className="px-4 py-2.5">
                            {gradingType === "numerica" ? (
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={entry.value}
                                onChange={(event) => update(row.studentId, { value: event.target.value })}
                                disabled={!data.canCapture}
                                placeholder="Sin captura"
                                className="h-9 w-[110px] tabular"
                                aria-label={`Calificación de ${row.fullName}`}
                              />
                            ) : (
                              <Select
                                value={entry.qualitative || "sin"}
                                onValueChange={(value) => update(row.studentId, { qualitative: value === "sin" ? "" : value })}
                                disabled={!data.canCapture}
                              >
                                <SelectTrigger className="h-9 w-[160px]" aria-label={`Calificación de ${row.fullName}`}>
                                  <SelectValue placeholder="Sin captura" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sin">Sin captura</SelectItem>
                                  {QUALITATIVE.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {value} · {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {empty ? (
                              <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Sin captura</span>
                            ) : (
                              <span className="text-[11px] uppercase tracking-[0.1em] text-primary">
                                {entry.value === "0" ? "Cero registrado" : "Capturado"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-2 border border-border bg-card px-4 py-3">
                <Button variant="outline" onClick={() => save("draft")} disabled={Boolean(saving) || !data.canCapture}>
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                  {saving === "draft" ? "Guardando…" : "Guardar borrador"}
                </Button>
                <Button variant="outline" onClick={() => save("review")} disabled={Boolean(saving) || !data.canCapture}>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  Enviar a revisión
                </Button>
                {data.canPublish ? (
                  <Button onClick={() => save("publish")} disabled={Boolean(saving)}>
                    Publicar calificaciones
                  </Button>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Publicar requiere permiso de captura docente o dirección.</span>
                )}
                {data.canClose ? (
                  <Button variant="outline" onClick={() => save("close")} disabled={Boolean(saving)}>
                    <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                    Cerrar periodo
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </AsyncState>
      )}
    </div>
  );
}