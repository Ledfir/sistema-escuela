import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError } from "@/components/ui-kit/Field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { useSession } from "@/lib/SessionContext";

export const Route = createFileRoute("/panel/catalogos")({
  head: () => ({ meta: [{ title: "Catálogos · Panel escolar" }] }),
  component: CatalogsPage,
});

const TABS = [
  ["ciclos", "Ciclos"],
  ["niveles", "Niveles y grados"],
  ["grupos", "Grupos"],
  ["materias", "Materias"],
  ["docentes", "Docentes"],
  ["periodos", "Periodos"],
  ["horarios", "Horarios"],
  ["conceptos", "Conceptos de cobro"],
];

const FORMS = {
  ciclos: {
    kind: "cycles",
    fields: [
      { name: "name", label: "Nombre del ciclo", required: true, placeholder: "2027-2028" },
      { name: "startDate", label: "Inicio", type: "date" },
      { name: "endDate", label: "Fin", type: "date" },
    ],
    build: (form) => ({ ...form, status: "planeado" }),
  },
  grupos: {
    kind: "groups",
    fields: [
      { name: "gradeId", label: "Grado", type: "select", options: "grades", required: true },
      { name: "name", label: "Letra del grupo", required: true, placeholder: "A" },
      { name: "capacity", label: "Cupo", type: "number", placeholder: "25" },
    ],
  },
  materias: {
    kind: "subjects",
    fields: [
      { name: "name", label: "Nombre de la materia", required: true },
      { name: "levelId", label: "Nivel", type: "select", options: "levels", required: true },
      { name: "weeklyHours", label: "Horas semanales", type: "number" },
    ],
  },
  docentes: {
    kind: "teachers",
    fields: [
      { name: "name", label: "Nombre completo", required: true },
      { name: "email", label: "Correo institucional" },
      { name: "specialty", label: "Especialidad" },
    ],
  },
  periodos: {
    kind: "periods",
    fields: [
      { name: "name", label: "Nombre del periodo", required: true },
      { name: "startDate", label: "Inicio", type: "date" },
      { name: "endDate", label: "Fin", type: "date" },
    ],
    build: (form) => ({ ...form, cycleId: "cyc-2026", status: "pendiente", order: 9 }),
  },
  conceptos: {
    kind: "concepts",
    fields: [
      { name: "name", label: "Concepto", required: true },
      { name: "amount", label: "Monto (MXN)", type: "number", required: true },
    ],
    build: (form) => ({ ...form, amount: Number(form.amount) || 0, kind: "unico" }),
  },
};

function CatalogsPage() {
  const queryClient = useQueryClient();
  const { can } = useSession();
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get());
  const [tab, setTab] = useState("ciclos");
  const [addOpen, setAddOpen] = useState(false);
  const [scheduleGroup, setScheduleGroup] = useState("");

  const canManage = can("catalogs.manage");
  const data = catalog.data;
  const config = FORMS[tab];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["panel-catalog"] });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comunidad"
        title="Catálogos"
        description="Ciclos, niveles, grados, grupos, materias, docentes y periodos que sostienen la operación académica."
        actions={
          config && canManage ? (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Agregar
            </Button>
          ) : null
        }
      />

      <AsyncState query={catalog} loadingLabel="Cargando catálogos…">
        {(catalogs) => (
          <>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
                {TABS.map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="border border-border px-3 py-1.5 text-[12px] data-[state=active]:border-brand-ink data-[state=active]:bg-brand-ink data-[state=active]:text-brand-paper"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="ciclos" className="mt-4">
                <DataTable
                  rows={catalogs.cycles}
                  columns={[
                    { key: "name", header: "Ciclo", render: (row) => <span className="font-medium">{row.name}</span> },
                    { key: "startDate", header: "Inicio", render: (row) => formatDate(row.startDate) },
                    { key: "endDate", header: "Fin", render: (row) => formatDate(row.endDate) },
                    { key: "status", header: "Estado", render: (row) => <span className="capitalize">{row.status}</span> },
                  ]}
                />
              </TabsContent>

              <TabsContent value="niveles" className="mt-4 space-y-4">
                <DataTable
                  rows={catalogs.levels}
                  columns={[
                    { key: "name", header: "Nivel", render: (row) => <span className="font-medium">{row.name}</span> },
                    { key: "gradingType", header: "Tipo de evaluación", render: (row) => (row.gradingType === "numerica" ? "Numérica (0-10)" : "Cualitativa (A/S/B/R)") },
                    {
                      key: "grades",
                      header: "Grados",
                      render: (row) => catalogs.grades.filter((grade) => grade.levelId === row.id).length,
                    },
                  ]}
                />
                <DataTable
                  rows={catalogs.grades}
                  columns={[
                    { key: "name", header: "Grado" },
                    { key: "levelName", header: "Nivel" },
                    {
                      key: "groups",
                      header: "Grupos",
                      render: (row) => catalogs.groups.filter((group) => group.gradeId === row.id).length,
                    },
                  ]}
                />
              </TabsContent>

              <TabsContent value="grupos" className="mt-4">
                <DataTable
                  rows={catalogs.groups}
                  columns={[
                    { key: "displayName", header: "Grupo", render: (row) => <span className="font-medium">{row.displayName}</span> },
                    { key: "gradeName", header: "Grado" },
                    { key: "levelName", header: "Nivel" },
                    { key: "classroom", header: "Salón" },
                    {
                      key: "cupo",
                      header: "Cupo",
                      align: "right",
                      render: (row) => (
                        <span className={row.enrolled >= row.capacity ? "font-medium text-destructive" : ""}>
                          {row.enrolled}/{row.capacity}
                        </span>
                      ),
                    },
                  ]}
                />
              </TabsContent>

              <TabsContent value="materias" className="mt-4">
                <DataTable
                  rows={catalogs.subjects}
                  columns={[
                    { key: "name", header: "Materia", render: (row) => <span className="font-medium">{row.name}</span> },
                    { key: "levelName", header: "Nivel" },
                    { key: "teacherName", header: "Docente titular" },
                    { key: "weeklyHours", header: "Horas/semana", align: "right" },
                  ]}
                />
              </TabsContent>

              <TabsContent value="docentes" className="mt-4">
                <DataTable
                  rows={catalogs.teachers}
                  columns={[
                    { key: "name", header: "Docente", render: (row) => <span className="font-medium">{row.name}</span> },
                    { key: "specialty", header: "Especialidad" },
                    { key: "email", header: "Correo" },
                  ]}
                />
              </TabsContent>

              <TabsContent value="periodos" className="mt-4">
                <DataTable
                  rows={catalogs.periods}
                  columns={[
                    { key: "name", header: "Periodo", render: (row) => <span className="font-medium">{row.name}</span> },
                    { key: "startDate", header: "Inicio", render: (row) => formatDate(row.startDate) },
                    { key: "endDate", header: "Fin", render: (row) => formatDate(row.endDate) },
                    { key: "status", header: "Estado", render: (row) => <span className="capitalize">{row.status.replace("_", " ")}</span> },
                  ]}
                />
              </TabsContent>

              <TabsContent value="horarios" className="mt-4 space-y-3">
                <div className="max-w-xs">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Grupo</p>
                  <Select value={scheduleGroup || undefined} onValueChange={setScheduleGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.displayName} · {group.levelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {scheduleGroup ? (
                  <ScheduleTable groupId={scheduleGroup} />
                ) : (
                  <p className="border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    Selecciona un grupo para consultar su horario.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="conceptos" className="mt-4">
                <DataTable
                  rows={catalogs.concepts}
                  columns={[
                    { key: "name", header: "Concepto", render: (row) => <span className="font-medium">{row.name}</span> },
                    { key: "kind", header: "Tipo", render: (row) => (row.kind === "mensual" ? "Mensual" : "Único") },
                    { key: "amount", header: "Monto", align: "right", render: (row) => formatCurrency(row.amount) },
                  ]}
                />
              </TabsContent>
            </Tabs>

            {config ? (
              <AddDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                config={config}
                catalogs={catalogs}
                onSaved={refresh}
              />
            ) : null}
          </>
        )}
      </AsyncState>
    </div>
  );
}

function ScheduleTable({ groupId }) {
  const assignments = useServiceQuery(["assignments", groupId], () => services.catalog.assignments({ groupId }));
  return (
    <AsyncState query={assignments} loadingLabel="Cargando horario…" emptyTitle="Sin materias asignadas">
      {(rows) => (
        <DataTable
          rows={rows}
          rowKey={(row) => row.subjectId}
          columns={[
            { key: "subjectName", header: "Materia", render: (row) => <span className="font-medium">{row.subjectName}</span> },
            { key: "teacherName", header: "Docente" },
            {
              key: "schedule",
              header: "Horario",
              render: (row) =>
                row.schedule.length
                  ? row.schedule.map((slot) => `${slot.day} ${slot.start}-${slot.end}`).join(" · ")
                  : "Sin horario",
            },
          ]}
        />
      )}
    </AsyncState>
  );
}

function AddDialog({ open, onOpenChange, config, catalogs, onSaved }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const missing = config.fields.filter((field) => field.required && !String(form[field.name] || "").trim());
    if (missing.length) {
      setError(`Completa: ${missing.map((field) => field.label).join(", ")}.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      let payload = config.build ? config.build(form) : { ...form };
      if (config.kind === "groups") {
        const grade = catalogs.grades.find((item) => item.id === form.gradeId);
        payload = {
          ...payload,
          capacity: Number(form.capacity) || 25,
          displayName: `${grade?.shortName || ""} ${form.name}`.trim(),
          cycleId: "cyc-2026",
          levelId: grade?.levelId,
          classroom: `Salón ${form.name}`,
          enrolled: 0,
        };
      }
      await services.catalog.create(config.kind, payload);
      setForm({});
      onOpenChange(false);
      onSaved();
    } catch (submitError) {
      setError(submitError.message || "No se pudo guardar el registro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Agregar al catálogo</DialogTitle>
          <DialogDescription>El registro se enviará a los servicios de catálogos de la API.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          {config.fields.map((field) => (
            <Field key={field.name} label={field.label} required={field.required}>
              {field.type === "select" ? (
                <Select value={form[field.name] || undefined} onValueChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {(catalogs[field.options] || []).map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type || "text"}
                  value={form[field.name] || ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  placeholder={field.placeholder}
                />
              )}
            </Field>
          ))}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}