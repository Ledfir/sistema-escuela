import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/account/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui-kit/Field";
import { services } from "@/services";

export const Route = createFileRoute("/recuperar")({
  head: () => ({ meta: [{ title: "Recuperar contraseña · Colegio Monteverde" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await services.auth.requestPasswordReset({ email });
      setSent(true);
    } catch (submitError) {
      setError(submitError.message || "No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Escribe el correo con el que te dieron acceso. Te enviaremos un enlace para crear una nueva contraseña."
      footer={
        <Link to="/login" className="inline-flex items-center gap-2 font-medium text-brand-ink hover:text-brand-gold">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al acceso
        </Link>
      }
    >
      {sent ? (
        <div className="border border-primary/25 bg-primary/5 p-6">
          <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl text-foreground">Revisa tu correo</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Si <strong className="text-foreground">{email}</strong> está registrado, recibirás un enlace para restablecer
            tu contraseña. Por seguridad no confirmamos si el correo existe.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            ¿No llega en unos minutos? Revisa spam o solicita apoyo a la administración del colegio.
          </p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {error ? (
            <p role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Field label="Correo electrónico" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="nombre@colegiomonteverde.edu.mx"
              autoComplete="email"
            />
          </Field>
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Enviando…
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Enviar enlace
              </>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}