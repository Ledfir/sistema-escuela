import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/account/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui-kit/Field";
import { services } from "@/services";

export const Route = createFileRoute("/restablecer")({
  validateSearch: (search) => ({ token: search.token || "" }),
  head: () => ({ meta: [{ title: "Nueva contraseña · Colegio Monteverde" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const errors = {};
    if (form.password.length < 8) errors.password = "Usa al menos 8 caracteres.";
    if (form.password !== form.confirm) errors.confirm = "Las contraseñas no coinciden.";
    setFieldErrors(errors);
    setError("");
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      await services.auth.resetPassword({ token, password: form.password });
      setDone(true);
    } catch (submitError) {
      if (submitError.fieldErrors) setFieldErrors(submitError.fieldErrors);
      setError(submitError.message || "No se pudo actualizar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Define una contraseña de al menos 8 caracteres. Te recomendamos combinar letras, números y símbolos."
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 font-medium text-brand-ink hover:text-brand-gold">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al acceso
        </Link>
      }
    >
      {done ? (
        <div className="border border-primary/25 bg-primary/5 p-6">
          <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl text-foreground">Contraseña actualizada</h2>
          <p className="mt-2 text-sm text-muted-foreground">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/login">Ir al acceso</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {!token ? (
            <p role="alert" className="border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              El enlace no incluye un token válido. Solicita uno nuevo desde «Recuperar contraseña».
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Field label="Nueva contraseña" htmlFor="password" error={fieldErrors.password} required>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </Field>
          <Field label="Confirmar contraseña" htmlFor="confirm" error={fieldErrors.confirm} required>
            <Input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))}
              autoComplete="new-password"
              placeholder="Repite la contraseña"
            />
          </Field>
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting || !token}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
                Guardar contraseña
              </>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}