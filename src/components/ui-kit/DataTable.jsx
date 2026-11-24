import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingBlock } from "./States";
import { cn } from "@/lib/utils";

/**
 * Tabla de datos con paginación del servidor.
 * columns: [{ key, header, render(row), className, align }]
 */
export function DataTable({
  columns,
  rows = [],
  rowKey = (row) => row.id,
  onRowClick,
  loading = false,
  emptyTitle = "Sin resultados",
  emptyDescription,
  emptyAction,
  pagination,
  footer,
  dense = false,
}) {
  if (loading) return <LoadingBlock rows={5} />;
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-border/70 last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      dense ? "px-4 py-2.5" : "px-4 py-3.5",
                      "align-middle text-foreground",
                      column.align === "right" && "text-right tabular",
                      column.align === "center" && "text-center",
                      column.className,
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer ? <tfoot className="bg-muted/40 font-medium">{footer}</tfoot> : null}
        </table>
      </div>
      {pagination && pagination.total > 0 ? (
        <div className="flex flex-col items-start justify-between gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>
            {pagination.total} registro{pagination.total === 1 ? "" : "s"}
            {pagination.totalPages > 1
              ? ` · página ${pagination.page} de ${pagination.totalPages}`
              : ""}
          </p>
          {pagination.totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}