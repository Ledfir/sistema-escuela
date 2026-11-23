import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/account/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui-kit/Field";
import { APP_CONFIG, isDemoMode } from "@/config/appConfig";
import { useSession } from "@/lib/SessionContext";
import { homeForRole } from "@/lib/permissions";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    returnTo: search.returnTo || undefined,
    expirada: search.expirada || undefined,
  }),
  head: () => ({ meta: [{ title: "Acceso al portal · Colegio Monteverde" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { returnTo, expirada } = Route.useSearch();
  const { login, isAuthenticated, isLoading, home } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !submitting) {
      window.location.assign(returnTo || home);
    }
  }, [isLoading, isAuthenticated, returnTo, home, submitting]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const errors = {};
    if (!form.email.trim()) errors.email = "Escribe tu correo institucional.";
    if (!form.password) errors.password = "Escribe tu contraseña.";
    setFieldErrors(errors);
    setError("");
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      const user = await login(form);
      const destination = returnTo || homeForRole(user.role);
      window.location.assign(destination);
    } catch (submitError) {
      setError(submitError.message || "No se pudo iniciar sesión.");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Acceso al portal"
      subtitle="Ingresa con la cuenta que te proporcionó el colegio. El sistema te llevará al panel que corresponde a tu rol."
      footer={
        <div className="space-y-2">
          <Link to="/recuperar" className="font-medium text-brand-ink underline decoration-brand-gold/50 underline-offset-4 hover:text-brand-gold">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      }
    >
      {expirada ? (
        <div role="alert" className="mb-5 flex items-start gap-2.5 border border-amber-300 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Tu sesión expiró o fue cerrada por seguridad. Vuelve a iniciar sesión para continuar.</span>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormError message={error} />

        <Field label="Correo electrónico" htmlFor="email" error={fieldErrors.email} required>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="nombre@colegiomonteverde.edu.mx"
            aria-invalid={Boolean(fieldErrors.email)}
            className={fieldErrors.email ? "border-destructive" : ""}
          />
        </Field>

        <Field label="Contraseña" htmlFor="password" error={fieldErrors.password} required>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.password)}
              className={fieldErrors.password ? "border-destructive pr-11" : "pr-11"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Validando…
            </>
          ) : (
            <>
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      {isDemoMode ? (
        <div className="mt-7 border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Modo demostración</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Elige un perfil para entrar con datos ficticios. Contraseña: <strong className="font-mono">{APP_CONFIG.demo.passwordHint}</strong>
          </p>
          <ul className="mt-3 grid gap-1.5">
            {APP_CONFIG.demo.accounts.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => setForm({ email: account.email, password: APP_CONFIG.demo.passwordHint })}
                  className="flex w-full items-center justify-between gap-3 border border-border/70 bg-background px-3 py-2 text-left text-[13px] transition hover:border-brand-ink/40 hover:bg-muted/60"
                >
                  <span>
                    <span className="font-medium text-foreground">{account.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{account.name}</span>
                  </span>
                  <span className="text-[11px] text-brand-ink">Usar</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </AuthShell>
  );
}