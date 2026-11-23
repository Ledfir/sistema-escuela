import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency } from "@/lib/format";
import { toQueryString } from "@/lib/searchParams";
import { usePanel } from "@/components/panel/PanelContext";

export const Route = createFileRoute("/panel/alumnos/")({
  validateSearch: (search) => ({
    nivel: search.nivel || undefined,
    grado: search.grado || undefined,
    grupo: search.grupo || undefined,
    estado: search.estado || undefined,
    q: search.q || undefined,
    page: Number(search.page) || 1,
  }),
  head: () => ({ meta: [{ title: "Alumnos · Panel escolar" }] }),
  component: StudentsList,
});

function StudentsList() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { cycleId } = usePanel();
  const [term, setTerm] = useState(search.q || "");

  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });
  const list = useServiceQuery(["students", search, cycleId], () =>
    services.students.list({ ...search, cycleId, pageSize: 10 }),
  );

  const update = (patch) =>
    navigate({ to: "/panel/alumnos", search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }), replace: true });

  const grades = (catalog.data?.grades || []).filter((grade) => !search.nivel || grade.levelId === search.nivel);
  const groups = (catalog.data?.groups || []).filter(
    (group) => (!search.nivel || group.levelId === search.nivel) && (!search.grado || group.gradeId === search.grado),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comunidad"
        title="Alumnos"
        description="Expedientes, inscripciones, documentos e historial académico del ciclo escolar."
      />

      <FilterBar
        onClear={() => {
          setTerm("");
          navigate({ to: "/panel/alumnos", search: {}, replace: true });
        }}
      >
        <FilterField label="Buscar" className="sm:w-64">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              update({ q: term });
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Nombre o matrícula" className="pl-9" />
          </form>
        </FilterField>
        <FilterField label="Nivel">
          <Select value={search.nivel || "todos"} onValueChange={(value) => update({ nivel: value, grado: "", grupo: "" })}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(catalog.data?.levels || []).map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Grado">
          <Select value={search.grado || "todos"} onValueChange={(value) => update({ grado: value, grupo: "" })}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Grupo">
          <Select value={search.grupo || "todos"} onValueChange={(value) => update({ grupo: value })}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Estado">
          <Select value={search.estado || "todos"} onValueChange={(value) => update({ estado: value })}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <AsyncState query={list} loadingLabel="Cargando alumnos…" emptyTitle="Sin alumnos con estos filtros">
        {(data) => (
          <DataTable
            rows={data.items}
            onRowClick={(row) =>
              navigate({ to: "/panel/alumnos/$id", params: { id: row.id }, search: { volver: toQueryString(search) } })
            }
            columns={[
              {
                key: "fullName",
                header: "Alumno",
                render: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.fullName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{row.matricula}</p>
                  </div>
                ),
              },
              {
                key: "group",
                header: "Nivel y grupo",
                render: (row) => (
                  <div>
                    <p className="text-[13px]">
                      {row.gradeName} · {row.groupName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{row.levelName}</p>
                  </div>
                ),
              },
              {
                key: "tutors",
                header: "Tutores",
                render: (row) => <span className="text-[13px] text-muted-foreground">{row.tutorNames.join(", ") || "Sin tutor"}</span>,
              },
              { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.status} /> },
              {
                key: "balance",
                header: "Saldo",
                align: "right",
                render: (row) => (
                  <span className={row.balance > 0 ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>
                    {formatCurrency(row.balance)}
                  </span>
                ),
              },
            ]}
            pagination={{
              page: data.page,
              totalPages: data.totalPages,
              total: data.total,
              onPageChange: (page) => update({ page }),
            }}
          />
        )}
      </AsyncState>
    </div>
  );
}