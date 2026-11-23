import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, UserCheck, UserX } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { ROLE_LABELS } from "@/lib/permissions";

export const Route = createFileRoute("/panel/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios y permisos · Panel escolar" }] }),
  component: UsersPage,
});

const ROLE_DESCRIPTIONS = {
  admin: "Configuración, usuarios, permisos y auditoría.",
  direccion: "Indicadores, reportes y revisión académica.",
  control_escolar: "Admisiones, expedientes, inscripciones y grupos.",
  docente: "Grupos y materias asignados, asistencia y calificaciones.",
  caja: "Cargos, pagos, recibos, saldos y cortes.",
  tutor: "Consulta de la información de sus hijos vinculados.",
};

function UsersPage() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const list = useServiceQuery(["users"], () => services.users.list({}));

  async function toggle(user) {
    setBusyId(user.id);
    try {
      await services.users.update(user.id, { status: user.status === "activo" ? "inactivo" : "activo" });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios y permisos"
        description="Cada persona entra con su propio usuario. El rol define los menús, las acciones visibles y lo que el servidor autoriza."
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Invitar usuario
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <div key={role} className="border border-border bg-card p-4">
            <p className="text-[13px] font-medium text-foreground">{label}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>

      <AsyncState query={list} loadingLabel="Cargando usuarios…" emptyTitle="Sin usuarios">
        {(data) => (
          <DataTable
            rows={data.items}
            columns={[
              {
                key: "name",
                header: "Usuario",
                render: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-[11px] text-muted-foreground">{row.email}</p>
                  </div>
                ),
              },
              { key: "role", header: "Rol", render: (row) => ROLE_LABELS[row.role] || row.role },
              { key: "title", header: "Puesto" },
              { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.status} /> },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (row) => (
                  <Button variant="outline" size="sm" onClick={() => toggle(row)} disabled={busyId === row.id}>
                    {row.status === "activo" ? (
                      <>
                        <UserX className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Activar
                      </>
                    )}
                  </Button>
                ),
              },
            ]}
          />
        )}
      </AsyncState>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
    </div>
  );
}

function InviteDialog({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({ name: "", email: "", role: "docente" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrors({});
    setError("");
    try {
      await services.users.invite(form);
      setDone(true);
      setForm({ name: "", email: "", role: "docente" });
      onSaved();
    } catch (submitError) {
      if (submitError.fieldErrors) setErrors(submitError.fieldErrors);
      setError(submitError.message || "No se pudo invitar al usuario.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) setDone(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Invitar usuario</DialogTitle>
          <DialogDescription>
            Se enviará una invitación por correo. La persona quedará activa al aceptarla.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="space-y-3">
            <p className="border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">
              Invitación registrada. Puedes invitar a otra persona o cerrar.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDone(false)}>
                Invitar a otra persona
              </Button>
              <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <FormError message={error} />
            <Field label="Nombre completo" error={errors.name} required>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Correo electrónico" error={errors.email} required>
              <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
            <Field label="Rol" error={errors.role} required>
              <Select value={form.role} onValueChange={(value) => setForm((current) => ({ ...current, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Enviando…" : "Enviar invitación"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}