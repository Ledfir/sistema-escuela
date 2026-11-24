import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";

/** Estado de cuenta de un alumno: resumen, cargos y pagos. */
export function StatementView({ statement, onViewReceipt }) {
  const { summary, charges, payments } = statement;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total del ciclo", summary.total, "text-foreground"],
          ["Pagado", summary.paid, "text-primary"],
          ["Saldo pendiente", summary.balance, summary.balance > 0 ? "text-destructive" : "text-primary"],
          ["Vencido", summary.overdue, summary.overdue > 0 ? "text-destructive" : "text-muted-foreground"],
        ].map(([label, value, tone]) => (
          <div key={label} className="border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
            <p className={`mt-1.5 font-display text-xl tabular ${tone}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      <section className="border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Cargos</h3>
          <span className="text-[11px] text-muted-foreground">{charges.length} conceptos</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Concepto</th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Vence</th>
                <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Monto</th>
                <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Saldo</th>
                <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((charge) => (
                <tr key={charge.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2.5">
                    {charge.conceptName}
                    {charge.discountPercent ? (
                      <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-brand-gold">-{charge.discountPercent}%</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(charge.dueDate)}</td>
                  <td className="px-4 py-2.5 text-right tabular">{formatCurrency(charge.netAmount)}</td>
                  <td className="px-4 py-2.5 text-right tabular">{formatCurrency(charge.balance)}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={charge.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pagos y recibos</h3>
          <span className="text-[11px] text-muted-foreground">{payments.length} movimientos</span>
        </header>
        {payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Folio</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Fecha</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Método</th>
                  <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Monto</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[11px]">{payment.folio}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatDate(payment.date)}</td>
                    <td className="px-4 py-2.5 capitalize">{payment.method}</td>
                    <td className="px-4 py-2.5 text-right tabular">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReceipt?.(payment.id)}
                        className="text-[12px] text-brand-ink underline decoration-border underline-offset-2 hover:decoration-brand-ink"
                      >
                        Ver recibo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-4 py-4 text-sm text-muted-foreground">Sin pagos registrados.</p>
        )}
      </section>
    </div>
  );
}