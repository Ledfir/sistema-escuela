import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { EmptyState } from "@/components/ui-kit/States";
import { StatementView } from "@/components/billing/StatementView";
import { ReceiptDialog } from "@/components/billing/ReceiptDialog";
import { usePortal } from "@/components/portal/PortalContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/portal/estado-cuenta")({
  head: () => ({ meta: [{ title: "Estado de cuenta · Portal familiar" }] }),
  component: PortalStatement,
});

function PortalStatement() {
  const { student, studentId } = usePortal();
  const [receiptId, setReceiptId] = useState(null);
  const statement = useServiceQuery(["portal-statement", studentId], () => services.portal.statement(studentId), {
    enabled: Boolean(studentId),
  });

  if (!student) return <EmptyState title="Sin alumno seleccionado" description="Selecciona un alumno para ver su estado de cuenta." />;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{student.fullName}</p>
        <h1 className="font-display text-2xl text-foreground">Estado de cuenta</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Consulta conceptos, vencimientos, pagos y recibos. Los pagos se registran en caja.
        </p>
      </div>

      <AsyncState query={statement} loadingLabel="Consultando estado de cuenta…" rows={3}>
        {(data) => (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border border-border bg-card px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Saldo actual</p>
                <p className={`font-display text-2xl tabular ${data.summary.balance > 0 ? "text-destructive" : "text-primary"}`}>
                  {formatCurrency(data.summary.balance)}
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>Próximo vencimiento</p>
                <p className="text-[13px] text-foreground">{data.summary.nextDueDate ? formatDate(data.summary.nextDueDate) : "Sin pendientes"}</p>
              </div>
            </div>
            <StatementView statement={data} onViewReceipt={setReceiptId} />
          </div>
        )}
      </AsyncState>

      <ReceiptDialog
        paymentId={receiptId}
        open={Boolean(receiptId)}
        onOpenChange={(open) => !open && setReceiptId(null)}
        scope="portal"
        fetcher={(id) => services.portal.receipt({ paymentId: id })}
      />
    </div>
  );
}