import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Printer, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { DataTable } from "@/components/ui-kit/DataTable";
import { StudentPicker } from "@/components/panel/StudentPicker";
import { ReceiptDialog } from "@/components/billing/ReceiptDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatCurrency, formatDate, mxToday } from "@/lib/format";

export const Route = createFileRoute("/panel/pagos")({
  validateSearch: (search) => ({ estudiante: search.estudiante || undefined }),
  head: () => ({ meta: [{ title: "Pagos y recibos · Panel escolar" }] }),
  component: PaymentsPage,
});

const METHODS = [
  ["efectivo", "Efectivo"],
  ["transferencia", "Transferencia"],
  ["tarjeta", "Tarjeta"],
  ["cheque", "Cheque"],
];

function PaymentsPage() {
  const { estudiante } = Route.useSearch();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState(estudiante || "");
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ amount: "", method: "efectivo", date: mxToday(), reference: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [receiptId, setReceiptId] = useState(null);
  const [cancelPayment, setCancelPayment] = useState(null);

  const statement = useServiceQuery(["statement", studentId], () => services.payments.statement({ studentId }), {
    enabled: Boolean(studentId),
  });
  const recent = useServiceQuery(["payments-recent"], () => services.payments.cashCut({ from: "2026-08-01", to: mxToday() }));

  const pending = (statement.data?.charges || []).filter((charge) => charge.balance > 0 && charge.status !== "cancelado");

  useEffect(() => {
    setSelected([]);
    setForm((current) => ({ ...current, amount: "", reference: "" }));
    setError("");
    setMessage("");
  }, [studentId]);

  function toggle(chargeId) {
    const next = selected.includes(chargeId) ? selected.filter((id) => id !== chargeId) : [...selected, chargeId];
    setSelected(next);
    const total = (statement.data?.charges || [])
      .filter((charge) => next.includes(charge.id))
      .reduce((sum, charge) => sum + charge.balance, 0);
    setForm((current) => ({ ...current, amount: total ? String(total.toFixed(2)) : "" }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const amount = Number(form.amount);
    if (!studentId) {
      setError("Selecciona al alumno que realiza el pago.");
      return;
    }
    if (!amount || amount <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }
    if (amount > (statement.data?.summary.balance || 0) + 0.01) {
      setError("El monto excede el saldo pendiente del alumno.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const allocations = selected.map((chargeId) => ({
        chargeId,
        amount: (statement.data?.charges || []).find((charge) => charge.id === chargeId)?.balance || 0,
      }));
      const result = await services.payments.registerPayment({
        studentId,
        amount,
        method: form.method,
        date: form.date,
        reference: form.reference,
        allocations,
      });
      setMessage(`Pago registrado con folio ${result.payment.folio}. Saldo actualizado: ${formatCurrency(result.statement.summary.balance)}.`);
      setReceiptId(result.payment.id);
      setSelected([]);
      setForm((current) => ({ ...current, amount: "", reference: "" }));
      await queryClient.invalidateQueries({ queryKey: ["statement"] });
      await queryClient.invalidateQueries({ queryKey: ["payments-recent"] });
      await queryClient.invalidateQueries({ queryKey: ["charges"] });
    } catch (submitError) {
      setError(submitError.message || "No se pudo registrar el pago.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmCancel(reason) {
    await services.payments.cancelPayment(cancelPayment.id, { reason });
    setCancelPayment(null);
    await queryClient.invalidateQueries({ queryKey: ["payments-recent"] });
    await queryClient.invalidateQueries({ queryKey: ["statement"] });
    await queryClient.invalidateQueries({ queryKey: ["charges"] });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finanzas"
        title="Pagos y recibos"
        description="Registra pagos totales o parciales, aplícalos a uno o varios cargos y entrega el recibo impreso."
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <form onSubmit={submit} className="space-y-4 border border-border bg-card p-5 lg:col-span-3">
          <FormError message={error} />
          {message ? (
            <p className="flex items-start gap-2 border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {message}
            </p>
          ) : null}

          <Field label="Alumno" required>
            <StudentPicker value={studentId} onChange={(student) => setStudentId(student?.id || "")} />
          </Field>

          {studentId && statement.data ? (
            <>
              <div className="grid grid-cols-3 gap-2 border border-border bg-background p-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Saldo</p>
                  <p className="mt-0.5 font-display text-lg tabular text-destructive">{formatCurrency(statement.data.summary.balance)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Pagado</p>
                  <p className="mt-0.5 font-display text-lg tabular text-primary">{formatCurrency(statement.data.summary.paid)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Próximo vencimiento</p>
                  <p className="mt-0.5 text-[13px] text-foreground">{formatDate(statement.data.summary.nextDueDate)}</p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Aplicar a cargos pendientes
                </p>
                {pending.length ? (
                  <ul className="max-h-56 divide-y divide-border overflow-y-auto border border-border">
                    {pending.map((charge) => (
                      <li key={charge.id}>
                        <label className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 hover:bg-muted/50">
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={selected.includes(charge.id)}
                              onChange={() => toggle(charge.id)}
                              className="h-4 w-4 accent-[#245447]"
                            />
                            <span>
                              <span className="block text-[13px] text-foreground">{charge.conceptName}</span>
                              <span className="block text-[11px] text-muted-foreground">
                                Vence {formatDate(charge.dueDate)} · {charge.status}
                              </span>
                            </span>
                          </span>
                          <span className="tabular text-[13px] text-foreground">{formatCurrency(charge.balance)}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="border border-dashed border-border px-3 py-4 text-[13px] text-muted-foreground">
                    Este alumno no tiene cargos pendientes.
                  </p>
                )}
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Si no seleccionas cargos, el pago se aplica a los más antiguos.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Monto recibido (MXN)" required>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="0.00"
                    className="tabular"
                  />
                </Field>
                <Field label="Método de pago">
                  <Select value={form.method} onValueChange={(value) => setForm((current) => ({ ...current, method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fecha del pago">
                  <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
                </Field>
                <Field label="Referencia" hint="Folio de transferencia o autorización">
                  <Input value={form.reference} onChange={(event) => setForm((current) => ({ ...current, reference: event.target.value }))} />
                </Field>
              </div>

              <Button type="submit" className="w-full" disabled={saving || !pending.length}>
                <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
                {saving ? "Registrando pago…" : "Registrar pago"}
              </Button>
            </>
          ) : (
            <p className="border border-dashed border-border px-3 py-6 text-center text-[13px] text-muted-foreground">
              Busca un alumno para consultar sus cargos pendientes.
            </p>
          )}
        </form>

        <aside className="border border-border bg-card p-5 lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pagos de hoy</p>
          {recent.data ? (
            <>
              <p className="mt-2 font-display text-3xl tabular text-foreground">
                {formatCurrency(
                  recent.data.payments
                    .filter((payment) => payment.date === mxToday() && payment.status === "vigente")
                    .reduce((sum, payment) => sum + payment.amount, 0),
                )}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {recent.data.payments.filter((payment) => payment.date === mxToday() && payment.status === "vigente").length} movimientos registrados
              </p>
            </>
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">Calculando…</p>
          )}
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-[12px] text-muted-foreground">
            <p>Los pagos parciales actualizan el saldo del cargo y el estado de cuenta que ve la familia.</p>
            <p>El recibo se genera con folio consecutivo y puede imprimirse o cancelarse con motivo.</p>
          </div>
        </aside>
      </div>

      <section>
        <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Movimientos recientes</h2>
        <AsyncState query={recent} loadingLabel="Cargando movimientos…" emptyTitle="Sin pagos registrados">
          {(data) => (
            <DataTable
              rows={data.payments.slice(0, 25)}
              columns={[
                { key: "folio", header: "Folio", render: (row) => <span className="font-mono text-[11px]">{row.folio}</span> },
                { key: "date", header: "Fecha", render: (row) => formatDate(row.date) },
                { key: "studentName", header: "Alumno" },
                { key: "method", header: "Método", render: (row) => <span className="capitalize">{row.method}</span> },
                { key: "amount", header: "Monto", align: "right", render: (row) => formatCurrency(row.amount) },
                { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.status === "cancelado" ? "cancelado" : "vigente"} /> },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (row) => (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setReceiptId(row.id)}>
                        <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Recibo
                      </Button>
                      {row.status === "vigente" ? (
                        <Button variant="ghost" size="sm" onClick={() => setCancelPayment(row)} className="text-destructive">
                          <XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          Cancelar
                        </Button>
                      ) : null}
                    </div>
                  ),
                },
              ]}
            />
          )}
        </AsyncState>
      </section>

      <ReceiptDialog paymentId={receiptId} open={Boolean(receiptId)} onOpenChange={(open) => !open && setReceiptId(null)} />
      <CancelDialog payment={cancelPayment} onClose={() => setCancelPayment(null)} onConfirm={confirmCancel} />
    </div>
  );
}

function CancelDialog({ payment, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setReason("");
    setError("");
  }, [payment]);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (reason.trim().length < 5) {
      setError("Escribe el motivo de la cancelación.");
      return;
    }
    setSaving(true);
    try {
      await onConfirm(reason);
    } catch (submitError) {
      setError(submitError.message || "No se pudo cancelar el pago.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(payment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Cancelar pago</DialogTitle>
          <DialogDescription>
            {payment ? `${payment.folio} · ${payment.studentName} · ${formatCurrency(payment.amount)}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <Field label="Motivo de la cancelación" required>
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Error de captura, cheque sin fondos…" />
          </Field>
          <p className="text-[12px] text-muted-foreground">
            Los cargos vuelven a su saldo anterior y el movimiento queda registrado en la auditoría.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Volver
            </Button>
            <Button type="submit" variant="destructive" disabled={saving}>
              {saving ? "Cancelando…" : "Cancelar pago"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}