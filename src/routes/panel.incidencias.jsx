import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { StudentPicker } from "@/components/panel/StudentPicker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDate, formatDateTime, mxToday } from "@/lib/format";
import { useSession } from "@/lib/SessionContext";

export const Route = createFileRoute("/panel/incidencias")({
  head: () => ({ meta: [{ title: "Incidencias · Panel escolar" }] }),
  component: IncidentsPage,
});

const TYPES = [
  ["conducta", "Conducta"],
  ["academica", "Académica"],
  ["salud", "Salud"],
  ["asistencia", "Asistencia"],
  ["otro", "Otra"],
];

function IncidentsPage() {
  const queryClient = useQueryClient();
  const { can } = useSession();
  const [groupId, setGroupId] = useState("todos");
  const [type, setType] = useState("todos");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });
  const list = useServiceQuery(["incidents", { groupId, type }], () =>
    services.incidents.list({ groupId, type, pageSize: 50 }),
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["incidents"] });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Académico"
        title="Incidencias y seguimiento"
        description="Registra situaciones de conducta, salud o académicas. La visibilidad define si la familia puede verlas en el portal."
        actions={
          can("incidents.manage") ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nueva incidencia
            </Button>
          ) : null
        }
      />

      <FilterBar
        onClear={() => {
          setGroupId("todos");
          setType("todos");
        }}
      >
        <FilterField label="Grupo" className="sm:w-56">
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los grupos</SelectItem>
              {(catalog.data?.groups || []).map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.displayName} · {group.levelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Tipo">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {TYPES.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <AsyncState query={list} loadingLabel="Cargando incidencias…" emptyTitle="Sin incidencias registradas">
        {(data) => (
          <DataTable
            rows={data.items}
            onRowClick={(row) => setSelected(row)}
            columns={[
              {
                key: "studentName",
                header: "Alumno",
                render: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.studentName}</p>
                    <p className="text-[11px] text-muted-foreground">{row.groupName}</p>
                  </div>
                ),
              },
              { key: "type", header: "Tipo", render: (row) => <span className="capitalize">{row.type}</span> },
              { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
              {
                key: "description",
                header: "Descripción",
                render: (row) => <span className="line-clamp-2 max-w-[320px] text-[13px] text-muted-foreground">{row.description}</span>,
              },
              {
                key: "visibility",
                header: "Visibilidad",
                render: (row) => (
                  <span className="text-[12px] text-muted-foreground">{row.visibility === "tutores" ? "Visible para tutores" : "Solo interno"}</span>
                ),
              },
              { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        )}
      </AsyncState>

      <CreateIncidentDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={refresh} />
      <IncidentDetailDialog
        incident={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onSaved={async () => {
          await refresh();
          setSelected(null);
        }}
        canManage={can("incidents.manage")}
      />
    </div>
  );
}

function CreateIncidentDialog({ open, onOpenChange, onSaved }) {
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({ type: "conducta", date: mxToday(), description: "", visibility: "tutores" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const next = {};
    if (!student) next.studentId = "Selecciona al alumno.";
    if (form.description.trim().length < 10) next.description = "Describe la incidencia (mínimo 10 caracteres).";
    setErrors(next);
    setError("");
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await services.incidents.create({ ...form, studentId: student.id });
      setStudent(null);
      setForm({ type: "conducta", date: mxToday(), description: "", visibility: "tutores" });
      onOpenChange(false);
      onSaved();
    } catch (submitError) {
      if (submitError.fieldErrors) setErrors(submitError.fieldErrors);
      setError(submitError.message || "No se pudo registrar la incidencia.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nueva incidencia</DialogTitle>
          <DialogDescription>Quedará registrada con tu nombre y fecha.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <Field label="Alumno" error={errors.studentId} required>
            <StudentPicker value={student?.id} onChange={setStudent} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fecha">
              <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            </Field>
          </div>
          <Field label="Descripción" error={errors.description} required>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Qué ocurrió, quién intervino y qué se acordó."
            />
          </Field>
          <Field label="Visibilidad" hint="«Visible para tutores» aparece en el portal familiar.">
            <Select value={form.visibility} onValueChange={(value) => setForm((current) => ({ ...current, visibility: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutores">Visible para tutores</SelectItem>
                <SelectItem value="interno">Solo interno</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Registrar incidencia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IncidentDetailDialog({ incident, onOpenChange, onSaved, canManage }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (!note.trim()) {
      setError("Escribe una nota de seguimiento.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await services.incidents.addFollowUp(incident.id, { note, status: status || undefined });
      setNote("");
      setStatus("");
      onSaved();
    } catch (submitError) {
      setError(submitError.message || "No se pudo guardar el seguimiento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(incident)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{incident?.studentName}</DialogTitle>
          <DialogDescription>
            {incident ? `${incident.groupName} · ${formatDate(incident.date)} · ${incident.reportedBy}` : ""}
          </DialogDescription>
        </DialogHeader>
        {incident ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={incident.status} />
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {TYPES.find(([value]) => value === incident.type)?.[1] || incident.type} ·{" "}
                {incident.visibility === "tutores" ? "Visible para tutores" : "Solo interno"}
              </span>
            </div>
            <p className="border-l-2 border-brand-sand pl-3 text-sm leading-relaxed text-foreground">{incident.description}</p>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Seguimiento</p>
              {incident.followUps?.length ? (
                <ul className="mt-2 space-y-3">
                  {incident.followUps.map((item) => (
                    <li key={item.id} className="border-l border-border pl-3">
                      <p className="text-[13px] text-foreground">{item.note}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.byName} · {formatDateTime(item.at)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[13px] text-muted-foreground">Sin seguimientos.</p>
              )}
            </div>

            {canManage ? (
              <form onSubmit={submit} className="space-y-3 border-t border-border pt-4">
                <FormError message={error} />
                <Field label="Agregar seguimiento">
                  <Textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Acciones acordadas con la familia" />
                </Field>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Cambiar estado">
                      <Select value={status || undefined} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin cambio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abierto">Abierto</SelectItem>
                          <SelectItem value="seguimiento">En seguimiento</SelectItem>
                          <SelectItem value="cerrado">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}