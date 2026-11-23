import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Crest } from "@/components/public/Crest";
import { useSession } from "@/lib/SessionContext";

export const Route = createFileRoute("/acceso-denegado")({
  head: () => ({ meta: [{ title: "Acceso denegado · Colegio Monteverde" }] }),
  component: AccessDeniedPage,
});

function AccessDeniedPage() {
  const { home, isAuthenticated } = useSession();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <Crest className="h-14 w-14 text-brand-ink" />
      <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-display text-3xl text-foreground">Acceso denegado</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Tu cuenta no tiene permisos para esta sección. Si necesitas acceso, solicítalo a la administración del colegio.
        El servidor valida cada operación, incluso cuando se abre una dirección directamente.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {isAuthenticated ? (
          <Button asChild className="rounded-full">
            <Link to={home}>Volver a mi panel</Link>
          </Button>
        ) : (
          <Button asChild className="rounded-full">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        )}
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Ir al sitio del colegio
          </Link>
        </Button>
      </div>
    </div>
  );
}