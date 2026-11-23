import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/panel/auditoria")({
  head: () => ({ meta: [{ title: "Auditoría · Panel escolar" }] }),
  component: AuditPage,
});

const ACTION_LABELS = {
  crear: "Creó",
  actualizar: "Actualizó",
  guardar: "Guardó",
  registrar: "Registró",
  cancelar: "Canceló",
  publicar: "Publicó",
  eliminar: "Eliminó",
  inscribir: "Inscribió",
  baja: "Dio de baja",
  cambiar_grupo: "Cambió de grupo",
  reinscribir: "Reinscribió",
  descuento: "Aplicó descuento",
  invitar: "Invitó",
  autorizar: "Autorizó",
  rechazar: "Rechazó",
  subir: "Subió",
  asignar: "Asignó",
  solicitar: "Solicitó",
};

function AuditPage() {
  const [filters, setFilters] = useState({ userId: "todos", from: "", to: "" });
  const list = useServiceQuery(["audit", filters], () => services.audit.list({ ...filters, pageSize: 50 }));

  const users = useMemo(() => {
    const map = new Map();
    (list.data?.items || []).forEach((item) => {
      if (item.userId) map.set(item.userId, item.userName);
    });
    return [...map.entries()];
  }, [list.data]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Análisis"
        title="Auditoría"
        description="Registro de operaciones sensibles: quién hizo qué y cuándo. No editable desde la interfaz."
      />

      <FilterBar onClear={() => setFilters({ userId: "todos", from: "", to: "" })}>
        <FilterField label="Usuario">
          <Select value={filters.userId} onValueChange={(value) => setFilters((current) => ({ ...current, userId: value }))}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {users.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Desde">
          <Input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} className="w-full sm:w-[160px]" />
        </FilterField>
        <FilterField label="Hasta">
          <Input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} className="w-full sm:w-[160px]" />
        </FilterField>
      </FilterBar>

      <AsyncState query={list} loadingLabel="Cargando registro de auditoría…" emptyTitle="Sin movimientos en el periodo">
        {(data) => (
          <DataTable
            rows={data.items}
            columns={[
              { key: "at", header: "Fecha y hora", render: (row) => <span className="whitespace-nowrap text-[12px]">{formatDateTime(row.at)}</span> },
              { key: "userName", header: "Usuario", render: (row) => <span className="font-medium">{row.userName}</span> },
              {
                key: "action",
                header: "Acción",
                render: (row) => (
                  <span>
                    {ACTION_LABELS[row.action] || row.action} <span className="text-muted-foreground">{row.entity?.toLowerCase()}</span>
                  </span>
                ),
              },
              { key: "detail", header: "Detalle", render: (row) => <span className="text-[12px] text-muted-foreground">{row.detail}</span> },
              { key: "entityId", header: "Referencia", render: (row) => <span className="font-mono text-[11px] text-muted-foreground">{row.entityId}</span> },
            ]}
          />
        )}
      </AsyncState>
    </div>
  );
}