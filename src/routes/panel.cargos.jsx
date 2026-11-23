import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgePercent, Plus, Receipt, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { StudentPicker } from "@/components/panel/StudentPicker";
import { StatementView } from "@/components/billing/StatementView";
import { ReceiptDialog } from "@/components/billing/ReceiptDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FormError } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { useSession } from "@/lib/SessionContext";
import { usePanel } from "@/components/panel/PanelContext";
import { formatCurrency, formatDate, mxToday } from "@/lib/format";

export const Route = createFileRoute("/panel/cargos")({
  validateSearch: (search) => ({
    tab: search.tab || "listado",
    estado: search.estado || undefined,
    estudiante: search.estudiante || undefined,
    q: search.q || undefined,
    page: Number(search.page) || 1,
  }),
  head: () => ({ meta: [{ title: "Cargos y estado de cuenta · Panel escolar" }] }),
  component: ChargesPage,
});

function ChargesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const update = (patch) => navigate({ to: "/panel/cargos", search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finanzas"
        title="Cargos y estado de cuenta"
        description="Conceptos de cobro, cargos por alumno, descuentos y saldos. Los montos y folios los devuelve la API."
      />

      <Tabs value={search.tab} onValueChange={(value) => update({ tab: value })}>
        <TabsList className="flex flex-wrap bg-transparent p-0">
          {[
            ["listado", "Listado de cargos"],
            ["estado", "Estado de cuenta"],
            ["generar", "Generar cargos"],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="border border-border px-3 py-1.5 text-[12px] data-[state=active]:border-brand-ink data-[state=active]:bg-brand-ink data-[state=active]:text-brand-paper"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="listado" className="mt-4">
          <ChargesList search={search} update={update} />
        </TabsContent>
        <TabsContent value="estado" className="mt-4">
          <StudentStatement studentId={search.estudiante} onChange={(id) => update({ estudiante: id })} />
        </TabsContent>
        <TabsContent value="generar" className="mt-4">
          <GenerateCharges onDone={() => update({ tab: "listado" })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChargesList({ search, update }) {
  const queryClient = useQueryClient();
  const { can } = useSession();
  const [discount, setDiscount] = useState(null);

  const list = useServiceQuery(["charges", search], () =>
    services.payments.charges({ estado: search.estado, status: search.estado, q: search.q, page: search.page, pageSize: 10 }),
  );

  return (
    <div className="space-y-4">
      <FilterBar onClear={() => update({ estado: undefined, q: undefined, page: 1 })}>
        <FilterField label="Estado">
          <Select value={search.estado || "todos"} onValueChange={(value) => update({ estado: value, page: 1 })}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="pagado">Pagado</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <AsyncState query={list} loadingLabel="Cargando cargos…" emptyTitle="Sin cargos con este filtro">
        {(data) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Total filtrado", data.summary.total],
                ["Pagado", data.summary.paid],
                ["Saldo", data.summary.balance],
              ].map(([label, value]) => (
                <div key={label} className="border border-border bg-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                  <p className="mt-1.5 font-display text-xl tabular text-foreground">{formatCurrency(value)}</p>
                </div>
              ))}
            </div>

            <DataTable
              rows={data.items}
              columns={[
                {
                  key: "studentName",
                  header: "Alumno",
                  render: (row) => (
                    <div>
                      <p className="font-medium text-foreground">{row.studentName}</p>
                      <p className="text-[11px] text-muted-foreground">{row.groupName}</p>
                    </div>
                  ),
                },
                { key: "conceptName", header: "Concepto" },
                { key: "dueDate", header: "Vencimiento", render: (row) => formatDate(row.dueDate) },
                { key: "netAmount", header: "Monto", align: "right", render: (row) => formatCurrency(row.netAmount) },
                { key: "paidAmount", header: "Pagado", align: "right", render: (row) => formatCurrency(row.paidAmount) },
                {
                  key: "balance",
                  header: "Saldo",
                  align: "right",
                  render: (row) => (
                    <span className={row.balance > 0 ? "font-medium text-destructive" : "text-muted-foreground"}>{formatCurrency(row.balance)}</span>
                  ),
                },
                { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (row) =>
                    can("charges.manage") && row.status !== "pagado" && row.status !== "cancelado" ? (
                      <Button variant="ghost" size="sm" onClick={() => setDiscount(row)}>
                        <BadgePercent className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Descuento
                      </Button>
                    ) : null,
                },
              ]}
              pagination={{
                page: data.page,
                totalPages: data.totalPages,
                total: data.total,
                onPageChange: (page) => update({ page }),
              }}
            />
          </div>
        )}
      </AsyncState>

      <DiscountDialog
        charge={discount}
        onOpenChange={(open) => !open && setDiscount(null)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["charges"] });
          setDiscount(null);
        }}
      />
    </div>
  );
}

function DiscountDialog({ charge, onOpenChange, onSaved }) {
  const [percent, setPercent] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPercent("");
    setReason("");
    setError("");
  }, [charge]);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const value = Number(percent);
    if (!value || value <= 0 || value > 100) {
      setError("El descuento debe estar entre 1 y 100%.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await services.payments.applyDiscount({ chargeId: charge.id, percent: value, reason });
      onSaved();
    } catch (submitError) {
      setError(submitError.message || "No se pudo aplicar el descuento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(charge)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Aplicar descuento</DialogTitle>
          <DialogDescription>
            {charge ? `${charge.studentName} · ${charge.conceptName} · ${formatCurrency(charge.netAmount)}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <Field label="Porcentaje de descuento" required>
            <Input type="number" min="1" max="100" value={percent} onChange={(event) => setPercent(event.target.value)} />
          </Field>
          <Field label="Motivo" hint="Queda registrado en la auditoría">
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Beca académica, hermanos, convenio…" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Aplicando…" : "Aplicar descuento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudentStatement({ studentId, onChange }) {
  const [receiptId, setReceiptId] = useState(null);
  const statement = useServiceQuery(["statement", studentId], () => services.payments.statement({ studentId }), {
    enabled: Boolean(studentId),
  });

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Alumno</p>
        <StudentPicker value={studentId} onChange={(student) => onChange(student?.id || "")} />
      </div>

      {!studentId ? (
        <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Busca un alumno para consultar su estado de cuenta.
        </p>
      ) : (
        <AsyncState query={statement} loadingLabel="Consultando estado de cuenta…">
          {(data) => (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border border-border bg-card px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{data.student.fullName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {data.student.matricula} · {data.student.gradeName} {data.student.groupName}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/panel/pagos" search={{ estudiante: data.student.id }}>
                    <Receipt className="mr-2 h-4 w-4" aria-hidden="true" />
                    Registrar pago
                  </Link>
                </Button>
              </div>
              <StatementView statement={data} onViewReceipt={setReceiptId} />
            </div>
          )}
        </AsyncState>
      )}

      <ReceiptDialog paymentId={receiptId} open={Boolean(receiptId)} onOpenChange={(open) => !open && setReceiptId(null)} />
    </div>
  );
}

function GenerateCharges({ onDone }) {
  const { cycleId } = usePanel();
  const concepts = useServiceQuery(["billing-concepts"], () => services.payments.concepts());
  const [conceptId, setConceptId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(mxToday());
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const concept = concepts.data?.find((item) => item.id === conceptId);

  function addStudent(student) {
    if (!student) return;
    setStudents((current) => (current.some((item) => item.id === student.id) ? current : [...current, student]));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (!conceptId || !students.length || !Number(amount)) {
      setError("Selecciona concepto, al menos un alumno y un monto mayor a cero.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await services.payments.createCharges({
        conceptId,
        studentIds: students.map((student) => student.id),
        amount: Number(amount),
        dueDate,
        cycleId,
      });
      setMessage(`Se generaron ${result.created} cargos de ${concept?.name}.`);
      setStudents([]);
    } catch (submitError) {
      setError(submitError.message || "No se pudieron generar los cargos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-4 border border-border bg-card p-5">
        <FormError message={error} />
        {message ? <p className="border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">{message}</p> : null}

        <Field label="Concepto" required>
          <Select
            value={conceptId || undefined}
            onValueChange={(value) => {
              setConceptId(value);
              const selected = concepts.data?.find((item) => item.id === value);
              if (selected) setAmount(String(selected.amount));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un concepto" />
            </SelectTrigger>
            <SelectContent>
              {(concepts.data || []).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} · {formatCurrency(item.amount)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Monto por alumno (MXN)" required>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </Field>
          <Field label="Fecha de vencimiento" required>
            <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </Field>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Agregar alumnos</p>
          <StudentPicker value={null} onChange={addStudent} placeholder="Buscar alumno para agregarlo" />
          {students.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {students.map((student) => (
                <li key={student.id} className="flex items-center gap-1.5 border border-border bg-background px-2 py-1 text-[12px]">
                  {student.fullName}
                  <button
                    type="button"
                    onClick={() => setStudents((current) => current.filter((item) => item.id !== student.id))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Quitar ${student.fullName}`}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">Aún no has agregado alumnos.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-[12px] text-muted-foreground">
            {students.length} alumno{students.length === 1 ? "" : "s"} · {formatCurrency(Number(amount || 0) * students.length)} total
          </p>
          <Button type="submit" disabled={saving}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {saving ? "Generando…" : "Generar cargos"}
          </Button>
        </div>
      </section>

      <aside className="space-y-3 border border-border bg-card p-5 text-[13px] text-muted-foreground">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">Vista previa</p>
        <p>
          Se crearán <strong className="text-foreground">{students.length}</strong> cargos por{" "}
          <strong className="text-foreground">{formatCurrency(Number(amount || 0))}</strong> con vencimiento el{" "}
          <strong className="text-foreground">{formatDate(dueDate)}</strong>.
        </p>
        <p>Los cargos quedan en estado pendiente y aparecen de inmediato en el estado de cuenta de cada familia.</p>
        <p className="border-t border-border pt-3 text-[12px]">
          Ciclo escolar aplicado: <span className="text-foreground">2026-2027</span>
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onDone} className="px-0 text-brand-ink">
          Ir al listado de cargos →
        </Button>
      </aside>
    </form>
  );
}