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
import { formatDate } from "@/lib/format";
import { toQueryString } from "@/lib/searchParams";

const STAGES = [
  ["nuevo", "Nuevo"],
  ["contactado", "Contactado"],
  ["visita", "Visita agendada"],
  ["evaluacion", "En evaluación"],
  ["aceptado", "Aceptado"],
  ["inscrito", "Inscrito"],
  ["descartado", "Descartado"],
];

export const Route = createFileRoute("/panel/admisiones/")({
  validateSearch: (search) => ({
    nivel: search.nivel || undefined,
    etapa: search.etapa || undefined,
    responsable: search.responsable || undefined,
    q: search.q || undefined,
    page: Number(search.page) || 1,
  }),
  head: () => ({ meta: [{ title: "Admisiones · Panel escolar" }] }),
  component: AdmissionsList,
});

function AdmissionsList() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(search.q || "");

  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });
  const owners = useServiceQuery(["admission-owners"], () => services.admissions.owners());
  const list = useServiceQuery(["admissions", search], () => services.admissions.list({ ...search, pageSize: 10 }));

  const update = (patch) =>
    navigate({ to: "/panel/admisiones", search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }), replace: true });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comunidad"
        title="Admisiones"
        description="Prospectos que llegan desde el sitio web, recomendaciones y visitas. Da seguimiento y conviértelos en inscripción."
      />

      <FilterBar
        onClear={() => {
          setTerm("");
          navigate({ to: "/panel/admisiones", search: {}, replace: true });
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
            <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Nombre, correo o teléfono" className="pl-9" />
          </form>
        </FilterField>
        <FilterField label="Nivel">
          <Select value={search.nivel || "todos"} onValueChange={(value) => update({ nivel: value })}>
            <SelectTrigger className="w-full sm:w-[160px]">
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
        <FilterField label="Etapa">
          <Select value={search.etapa || "todos"} onValueChange={(value) => update({ etapa: value })}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {STAGES.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Responsable">
          <Select value={search.responsable || "todos"} onValueChange={(value) => update({ responsable: value })}>
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(owners.data || []).map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <AsyncState query={list} loadingLabel="Cargando prospectos…" emptyTitle="Sin prospectos con estos filtros" emptyDescription="Ajusta los filtros o espera nuevas solicitudes desde el sitio web.">
        {(data) => (
          <DataTable
            rows={data.items}
            rowKey={(row) => row.id}
            onRowClick={(row) =>
              navigate({
                to: "/panel/admisiones/$id",
                params: { id: row.id },
                search: { volver: toQueryString(search) },
              })
            }
            columns={[
              {
                key: "fullName",
                header: "Prospecto",
                render: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{row.email || row.phone}</p>
                  </div>
                ),
              },
              {
                key: "level",
                header: "Nivel",
                render: (row) => (
                  <div>
                    <p className="text-[13px]">{row.levelName}</p>
                    <p className="text-[11px] text-muted-foreground">{row.gradeName || "Por definir"}</p>
                  </div>
                ),
              },
              { key: "stage", header: "Etapa", render: (row) => <StatusBadge status={row.stage} /> },
              { key: "owner", header: "Responsable", render: (row) => <span className="text-[13px]">{row.ownerName}</span> },
              {
                key: "nextAction",
                header: "Próxima acción",
                render: (row) => (
                  <div>
                    <p className="max-w-[220px] truncate text-[13px]">{row.nextAction}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(row.nextActionDate)}</p>
                  </div>
                ),
              },
              {
                key: "createdAt",
                header: "Registrado",
                align: "right",
                render: (row) => <span className="text-[12px] text-muted-foreground">{formatDate(row.createdAt)}</span>,
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