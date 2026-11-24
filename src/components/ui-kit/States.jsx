import { AlertTriangle, Inbox, Loader2, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingBlock({ label = "Cargando información…", rows = 4 }) {
  return (
    <div className="space-y-3 py-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {label}
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-11 animate-pulse rounded-sm bg-muted"
            style={{ animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title = "Sin resultados", description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description ? <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, title }) {
  const status = error?.status;
  const forbidden = status === 403;
  const message =
    error?.message ||
    (status === 401
      ? "Tu sesión expiró. Vuelve a iniciar sesión."
      : "No se pudo cargar la información. Intenta de nuevo.");

  return (
    <div
      role="alert"
      className={`border px-5 py-6 ${forbidden ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            forbidden ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          }`}
        >
          {forbidden ? <Lock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </span>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{title || (forbidden ? "Acceso denegado" : "No se pudo cargar la información")}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
          {status ? <p className="text-xs uppercase tracking-wider text-muted-foreground">Código HTTP {status}</p> : null}
        </div>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}

export function AccessDenied({ message = "No cuentas con permisos para ver esta sección.", onBack }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Lock className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-foreground">Acceso denegado</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">
          Si necesitas acceso, solicítalo a la administración del colegio. Cada operación se valida también en el servidor.
        </p>
      </div>
      {onBack}
    </div>
  );
}