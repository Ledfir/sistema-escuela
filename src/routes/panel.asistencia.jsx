import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Check, Clock, FileWarning, Save, X } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDate, mxToday } from "@/lib/format";

export const Route = createFileRoute("/panel/asistencia")({
  validateSearch: (search) => ({
    tab: search.tab || "captura",
    grupo: search.grupo || undefined,
    fecha: search.fecha || undefined,
    materia: search.materia || undefined,
  }),
  head: () => ({ meta: [{ title: "Asistencia · Panel escolar" }] }),
  component: AttendancePage,
});

const STATUS_OPTIONS = [
  ["presente", "Presente", "border-primary bg-primary text-primary-foreground"],
  ["falta", "Falta", "border-destructive bg-destructive text-destructive-foreground"],
  ["retardo", "Retardo", "border-amber-500 bg-amber-500 text-white"],
  ["justificado", "Justificado", "border-sky-600 bg-sky-600 text-white"],
];

function AttendancePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });

  const date = search.fecha || mxToday();
  const groupId = search.grupo || "";
  const subjectId = search.materia || "";

  const group = (catalog.data?.groups || []).find((item) => item.id === groupId);
  const subjects = (catalog.data?.subjects || []).filter((subject) => subject.levelId === group?.levelId);

  const sheet = useServiceQuery(["attendance-sheet", { groupId, date, subjectId }], () => services.attendance.sheet({ groupId, date, subjectId }), {
    enabled: Boolean(groupId),
  });

  const [records, setRecords] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sheet.data) {
      const map = {};
      sheet.data.records.forEach((record) => {
        map[record.studentId] = { status: record.status || "", note: record.note || "" };
      });
      setRecords(map);
      setMessage("");
      setError("");
    }
  }, [sheet.data]);

  const counts = useMemo(() => {
    const values = Object.values(records);
    return {
      marked: values.filter((value) => value.status).length,
      total: values.length,
      falta: values.filter((value) => value.status === "falta").length,
    };
  }, [records]);

  const setStatus = (studentId, status) =>
    setRecords((current) => ({ ...current, [studentId]: { ...(current[studentId] || { note: "" }), status } }));

  const setNote = (studentId, note) =>
    setRecords((current) => ({ ...current, [studentId]: { ...(current[studentId] || { status: "" }), note } }));

  function markAll() {
    const next = {};
    sheet.data.records.forEach((record) => {
      next[record.studentId] = { status: "presente", note: records[record.studentId]?.note || "" };
    });
    setRecords(next);
  }

  async function save() {
    if (saving) return;
    const payload = sheet.data.records
      .map((record) => ({ studentId: record.studentId, ...records[record.studentId] }))
      .filter((record) => record.status);
    if (!payload.length) {
      setError("Marca al menos un alumno antes de guardar.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await services.attendance.save({ groupId, date, subjectId, records: payload });
      setMessage(`Se guardaron ${result.saved} registros de asistencia.`);
      await queryClient.invalidateQueries({ queryKey: ["attendance-sheet"] });
    } catch (saveError) {
      setError(saveError.message || "No se pudo guardar la asistencia.");
    } finally {
      setSaving(false);
    }
  }

  const update = (patch) => navigate({ to: "/panel/asistencia", search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Académico"
        title="Asistencia e incidencias"
        description="Pase de lista por fecha, grupo y materia, con historial y reportes por rango de fechas."
      />

      <Tabs value={search.tab} onValueChange={(value) => update({ tab: value })}>
        <TabsList className="bg-transparent p-0">
          <TabsTrigger value="captura" className="border border-border px-3 py-1.5 text-[12px] data-[state=active]:border-brand-ink data-[state=active]:bg-brand-ink data-[state=active]:text-brand-paper">
            Captura
          </TabsTrigger>
          <TabsTrigger value="reporte" className="border border-border px-3 py-1.5 text-[12px] data-[state=active]:border-brand-ink data-[state=active]:bg-brand-ink data-[state=active]:text-brand-paper">
            Reporte por grupo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="captura" className="mt-4 space-y-4">
          <FilterBar>
            <FilterField label="Fecha">
              <Input type="date" value={date} onChange={(event) => update({ fecha: event.target.value })} className="w-full sm:w-[160px]" />
            </FilterField>
            <FilterField label="Grupo" className="sm:w-56">
              <Select value={groupId || undefined} onValueChange={(value) => update({ grupo: value, materia: "" })}>
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
              <Select value={subjectId || "diario"} onValueChange={(value) => update({ materia: value === "diario" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Registro diario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Registro diario</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
            {groupId && sheet.data ? (
              <Button variant="outline" size="sm" className="sm:mb-0.5" onClick={markAll}>
                <CalendarCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Marcar todos presentes
              </Button>
            ) : null}
          </FilterBar>

          {!groupId ? (
            <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              Selecciona un grupo para comenzar el pase de lista.
            </p>
          ) : (
            <AsyncState query={sheet} loadingLabel="Cargando lista del grupo…" emptyTitle="El grupo no tiene alumnos activos">
              {(data) => (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-4 py-3">
                    <div className="text-[13px] text-muted-foreground">
                      <span className="font-medium text-foreground">{data.group.gradeName} · Grupo {data.group.name}</span> ·{" "}
                      {formatDate(date)} {subjectId ? "· materia seleccionada" : "· registro diario"}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                      <span>
                        {counts.marked}/{counts.total} marcados
                      </span>
                      {counts.falta > 0 ? <span className="text-destructive">{counts.falta} faltas</span> : null}
                    </div>
                  </div>

                  {message ? <p className="border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">{message}</p> : null}
                  {error ? <p className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}

                  <ul className="space-y-2">
                    {data.records.map((record) => {
                      const current = records[record.studentId] || { status: "", note: "" };
                      return (
                        <li key={record.studentId} className="border border-border bg-card p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                          <div className="mb-2 sm:mb-0">
                            <p className="text-sm font-medium text-foreground">{record.fullName}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{record.matricula}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="grid grid-cols-4 gap-1">
                              {STATUS_OPTIONS.map(([value, label, activeClass]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setStatus(record.studentId, value)}
                                  className={`flex min-h-[40px] min-w-[64px] items-center justify-center gap-1 border px-2 text-[11px] font-medium transition ${
                                    current.status === value ? activeClass : "border-border bg-background text-muted-foreground hover:bg-muted"
                                  }`}
                                  aria-pressed={current.status === value}
                                >
                                  {value === "presente" ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                                  {value === "falta" ? <X className="h-3 w-3" aria-hidden="true" /> : null}
                                  {value === "retardo" ? <Clock className="h-3 w-3" aria-hidden="true" /> : null}
                                  {value === "justificado" ? <FileWarning className="h-3 w-3" aria-hidden="true" /> : null}
                                  {label}
                                </button>
                              ))}
                            </div>
                            {current.status && current.status !== "presente" ? (
                              <Input
                                value={current.note}
                                onChange={(event) => setNote(record.studentId, event.target.value)}
                                placeholder="Nota (opcional)"
                                className="h-10 w-full sm:w-44"
                              />
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex justify-end">
                    <Button onClick={save} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                      {saving ? "Guardando…" : "Guardar asistencia"}
                    </Button>
                  </div>
                </div>
              )}
            </AsyncState>
          )}
        </TabsContent>

        <TabsContent value="reporte" className="mt-4">
          <AttendanceReport groups={catalog.data?.groups || []} initialGroup={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceReport({ groups, initialGroup }) {
  const [groupId, setGroupId] = useState(initialGroup || "");
  const [from, setFrom] = useState("2026-11-01");
  const [to, setTo] = useState(mxToday());

  const report = useServiceQuery(["attendance-report", { groupId, from, to }], () => services.attendance.report({ groupId, from, to }), {
    enabled: Boolean(groupId),
  });

  return (
    <div className="space-y-4">
      <FilterBar>
        <FilterField label="Grupo" className="sm:w-56">
          <Select value={groupId || undefined} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.displayName} · {group.levelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Desde">
          <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-full sm:w-[160px]" />
        </FilterField>
        <FilterField label="Hasta">
          <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-full sm:w-[160px]" />
        </FilterField>
      </FilterBar>

      {!groupId ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Selecciona un grupo para consultar su reporte de asistencia.
        </p>
      ) : (
        <AsyncState query={report} loadingLabel="Calculando reporte…">
          {(data) => (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["Registros", data.totals.records],
                  ["Presentes", data.totals.present],
                  ["Faltas", data.totals.absent],
                  ["Retardos", data.totals.late],
                ].map(([label, value]) => (
                  <div key={label} className="border border-border bg-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                    <p className="mt-1.5 font-display text-2xl tabular text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <DataTable
                rows={data.rows}
                rowKey={(row) => row.studentId}
                columns={[
                  { key: "fullName", header: "Alumno", render: (row) => <span className="font-medium">{row.fullName}</span> },
                  { key: "total", header: "Registros", align: "right" },
                  { key: "present", header: "Presente", align: "right" },
                  { key: "late", header: "Retardo", align: "right" },
                  { key: "absent", header: "Falta", align: "right" },
                  { key: "justified", header: "Justificado", align: "right" },
                  {
                    key: "rate",
                    header: "% asistencia",
                    align: "right",
                    render: (row) => (
                      <span className={row.rate < 85 ? "font-medium text-destructive" : "font-medium text-primary"}>{row.rate}%</span>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </AsyncState>
      )}
    </div>
  );
}