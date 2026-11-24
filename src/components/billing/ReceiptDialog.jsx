import { Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { Crest } from "@/components/public/Crest";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";

const METHOD_LABELS = { efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta", cheque: "Cheque" };

export function ReceiptDialog({ paymentId, open, onOpenChange, fetcher, scope = "panel" }) {
  const load = fetcher || ((id) => services.payments.receipt({ paymentId: id }));
  const receipt = useServiceQuery(["receipt", scope, paymentId], () => load(paymentId), {
    enabled: Boolean(paymentId) && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-white sm:max-w-lg">
        <DialogHeader className="no-print">
          <DialogTitle className="font-display text-xl">Recibo de pago</DialogTitle>
        </DialogHeader>

        <AsyncState query={receipt} loadingLabel="Cargando recibo…" rows={4}>
          {(data) => (
            <div className="space-y-4">
              <article className="print-area border border-neutral-200 p-5">
                <header className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Crest className="h-10 w-10 text-brand-ink" />
                    <div>
                      <p className="font-display text-[15px] leading-none text-brand-ink">{data.institution?.name}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-neutral-500">{data.institution?.city}, {data.institution?.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Recibo</p>
                    <p className="font-mono text-[12px] text-brand-ink">{data.folio}</p>
                    <p className="text-[10px] text-neutral-500">{formatDate(data.date)}</p>
                  </div>
                </header>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <dt className="text-neutral-500">Alumno</dt>
                    <dd className="font-medium text-brand-ink">{data.student?.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Matrícula</dt>
                    <dd className="font-mono text-brand-ink">{data.student?.matricula}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Grado y grupo</dt>
                    <dd className="text-brand-ink">
                      {data.student?.gradeName} · {data.student?.groupName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Método de pago</dt>
                    <dd className="text-brand-ink">{METHOD_LABELS[data.method] || data.method}</dd>
                  </div>
                </dl>

                <table className="mt-4 w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="border-y border-neutral-200 bg-neutral-50">
                      <th className="py-1.5 pl-2 text-left font-semibold uppercase tracking-[0.1em] text-neutral-600">Concepto</th>
                      <th className="py-1.5 pr-2 text-right font-semibold uppercase tracking-[0.1em] text-neutral-600">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.allocations.map((allocation) => (
                      <tr key={allocation.chargeId} className="border-b border-neutral-100">
                        <td className="py-1.5 pl-2 text-brand-ink">{allocation.conceptName}</td>
                        <td className="py-1.5 pr-2 text-right tabular text-brand-ink">{formatCurrency(allocation.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Total recibido</span>
                  <span className="font-display text-lg tabular text-brand-ink">{formatCurrency(data.amount)}</span>
                </div>

                <div className="mt-4 flex items-end justify-between text-[10px] text-neutral-500">
                  <span>Cajero: {data.cashierName}</span>
                  <span className={data.status === "cancelado" ? "font-medium text-red-600" : ""}>
                    {data.status === "cancelado" ? `CANCELADO · ${data.cancelReason || ""}` : "Pago vigente"}
                  </span>
                </div>
              </article>

              <div className="no-print flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
                <Button onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                  Imprimir recibo
                </Button>
              </div>
            </div>
          )}
        </AsyncState>
      </DialogContent>
    </Dialog>
  );
}