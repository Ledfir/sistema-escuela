import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency, formatDate, formatDateTime, mxToday } from "@/lib/format";

export const Route = createFileRoute("/panel/corte")({
  head: () => ({ meta: [{ title: "Corte de caja · Panel escolar" }] }),
  component: CashCutPage,
});

const METHOD_LABELS = { efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta", cheque: "Cheque" };

function CashCutPage() {
  const [filters, setFilters] = useState({ from: mxToday(), to: mxToday(), userId: "todos", method: "todos" });
  const cut = useServiceQuery(["cash-cut", filters], () => services.payments.cashCut(filters));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finanzas"
        title="Corte de caja"
        description="Totales por usuario, rango de fechas y método de pago, con impresión para el cierre del día."
        actions={
          cut.data ? (
            <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Imprimir corte
            </Button>
          ) : null
        }
      />

      <div className="no-print">
        <FilterBar>
          <FilterField label="Desde">
            <Input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} className="w-full sm:w-[160px]" />
          </FilterField>
          <FilterField label="Hasta">
            <Input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} className="w-full sm:w-[160px]" />
          </FilterField>
          <FilterField label="Usuario">
            <Select value={filters.userId} onValueChange={(value) => setFilters((current) => ({ ...current, userId: value }))}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los usuarios</SelectItem>
                {(cut.data?.cashiers || []).map((cashier) => (
                  <SelectItem key={cashier.id} value={cashier.id}>
                    {cashier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Método">
            <Select value={filters.method} onValueChange={(value) => setFilters((current) => ({ ...current, method: value }))}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>
        </FilterBar>
      </div>

      <AsyncState query={cut} loadingLabel="Calculando corte…">
        {(data) => (
          <div className="print-area space-y-5">
            <div className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="font-display text-lg text-foreground">Colegio Monteverde</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Corte de caja</p>
                </div>
                <div className="text-right text-[11px] text-muted-foreground">
                  <p>
                    Periodo: {formatDate(filters.from)} — {formatDate(filters.to)}
                  </p>
                  <p>Generado por {data.generatedBy}</p>
                  <p>{formatDateTime(data.generatedAt)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {[
                  ["Total cobrado", formatCurrency(data.totals.total)],
                  ["Movimientos", String(data.totals.count)],
                  ["Cancelados", String(data.totals.cancelled)],
                  ["Monto cancelado", formatCurrency(data.totals.cancelledTotal)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                    <p className="mt-1 font-display text-xl tabular text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border bg-card">
              <header className="border-b border-border px-4 py-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Desglose por método</h3>
              </header>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Método</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Movimientos</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byMethod.map((row) => (
                    <tr key={row.method} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2.5 capitalize">{METHOD_LABELS[row.method] || row.method}</td>
                      <td className="px-4 py-2.5 text-right tabular">{row.count}</td>
                      <td className="px-4 py-2.5 text-right tabular">{formatCurrency(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="no-print">
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Movimientos del periodo</h3>
              <DataTable
                rows={data.payments}
                emptyTitle="Sin movimientos en el periodo"
                columns={[
                  { key: "folio", header: "Folio", render: (row) => <span className="font-mono text-[11px]">{row.folio}</span> },
                  { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
                  { key: "studentName", header: "Alumno" },
                  { key: "cashierName", header: "Cajero" },
                  { key: "method", header: "Método", render: (row) => <span className="capitalize">{row.method}</span> },
                  { key: "amount", header: "Monto", align: "right", render: (row) => formatCurrency(row.amount) },
                  {
                    key: "status",
                    header: "Estado",
                    render: (row) => (
                      <span className={row.status === "cancelado" ? "text-[12px] font-medium text-destructive" : "text-[12px] text-primary"}>
                        {row.status === "cancelado" ? "Cancelado" : "Vigente"}
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            <div className="hidden border-t border-border pt-6 text-[11px] text-muted-foreground print:block">
              <div className="grid grid-cols-2 gap-10">
                <div className="border-t border-neutral-400 pt-2 text-center">Firma del cajero</div>
                <div className="border-t border-neutral-400 pt-2 text-center">Revisión de administración</div>
              </div>
            </div>
          </div>
        )}
      </AsyncState>
    </div>
  );
}