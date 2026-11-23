import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { saveBlob } from "@/lib/download";
import { mxToday } from "@/lib/format";

export const Route = createFileRoute("/panel/reportes")({
  head: () => ({ meta: [{ title: "Reportes · Panel escolar" }] }),
  component: ReportsPage,
});

const TYPES = [
  ["matricula", "Matrícula"],
  ["asistencia", "Asistencia"],
  ["calificaciones", "Calificaciones"],
  ["cobranza", "Cobranza"],
];

export function reportHeaders(columns = []) {
  return columns.map((column) => column.replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase()));
}

function ReportsPage() {
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });
  const [type, setType] = useState("matricula");
  const [params, setParams] = useState({ levelId: "todos", from: "2026-11-01", to: mxToday(), periodId: "todos" });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const report = useServiceQuery(["report", type, params], () => services.reports.get({ type, params }));

  async function download() {
    setExporting(true);
    setExportError("");
    try {
      const result = await services.reports.export({ type, params });
      saveBlob(result.blob, result.filename);
    } catch (error) {
      setExportError(error.message || "No se pudo generar la exportación.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Análisis"
        title="Reportes"
        description="Matrícula, asistencia, calificaciones y cobranza con filtros y exportación a CSV."
        actions={
          <Button variant="outline" size="sm" onClick={download} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {exporting ? "Generando…" : "Exportar CSV"}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1">
        {TYPES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`border px-3 py-1.5 text-[12px] transition ${
              type === value ? "border-brand-ink bg-brand-ink text-brand-paper" : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <FilterBar>
        <FilterField label="Nivel">
          <Select value={params.levelId} onValueChange={(value) => setParams((current) => ({ ...current, levelId: value }))}>
            <SelectTrigger className="w-full sm:w-[170px]">
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
        {type === "asistencia" || type === "cobranza" ? (
          <>
            <FilterField label="Desde">
              <Input type="date" value={params.from} onChange={(event) => setParams((current) => ({ ...current, from: event.target.value }))} className="w-full sm:w-[160px]" />
            </FilterField>
            <FilterField label="Hasta">
              <Input type="date" value={params.to} onChange={(event) => setParams((current) => ({ ...current, to: event.target.value }))} className="w-full sm:w-[160px]" />
            </FilterField>
          </>
        ) : null}
        {type === "calificaciones" ? (
          <FilterField label="Periodo">
            <Select value={params.periodId} onValueChange={(value) => setParams((current) => ({ ...current, periodId: value }))}>
              <SelectTrigger className="w-full sm:w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(catalog.data?.periods || []).map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        ) : null}
      </FilterBar>

      {exportError ? (
        <p role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {exportError}
        </p>
      ) : null}

      <AsyncState query={report} loadingLabel="Calculando reporte…" emptyTitle="Sin datos para este reporte">
        {(data) => (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {(data.summary || []).map((item) => (
                <div key={item.label} className="border border-border bg-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1.5 font-display text-2xl tabular text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <DataTable
              rows={data.rows}
              rowKey={(row) => JSON.stringify(row)}
              dense
              columns={data.columns.map((column) => ({
                key: column,
                header: column.replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase()),
                align: typeof data.rows[0]?.[column] === "number" || /^\d/.test(String(data.rows[0]?.[column] ?? "")) ? "right" : "left",
              }))}
            />
            <p className="text-[11px] text-muted-foreground">
              La exportación usa el mismo filtro aplicado y se genera en el servidor.
            </p>
          </div>
        )}
      </AsyncState>
    </div>
  );
}