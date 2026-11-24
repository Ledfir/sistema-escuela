import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { Crest } from "@/components/public/Crest";
import { BRAND_IMAGES } from "@/config/appConfig";

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand-ink lg:block">
        <Image src={BRAND_IMAGES.campus} alt="Campus del colegio" fittingType="fill" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/95 via-brand-ink/90 to-brand-ink/95" />
        <div className="relative flex h-full flex-col justify-between p-12 text-brand-paper">
          <Link to="/" className="flex items-center gap-3">
            <Crest className="h-11 w-11" />
            <span>
              <span className="block font-display text-lg leading-none">Colegio Monteverde</span>
              <span className="mt-1.5 block text-[9px] uppercase tracking-[0.22em] text-brand-paper/50">
                Puebla · Desde 1998
              </span>
            </span>
          </Link>
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-sand">Sistema escolar</p>
            <p className="mt-4 font-display text-[2.6rem] leading-[1.08]">
              Un solo lugar para la vida académica del colegio.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-brand-paper/70">
              Admisiones, expedientes, asistencia, calificaciones, colegiaturas y comunicación con las familias, con
              acceso según el rol de cada persona.
            </p>
          </div>
          <p className="text-xs text-brand-paper/45">Excelencia académica con corazón · Formación cristiana</p>
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-3 text-brand-ink lg:hidden">
            <Crest className="h-10 w-10" />
            <span className="font-display text-lg leading-none">Colegio Monteverde</span>
          </Link>
          <h1 className="font-display text-[2rem] leading-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
          <p className="mt-10 text-xs text-muted-foreground">
            <Link to="/" className="underline decoration-border underline-offset-4 hover:text-brand-ink">
              Volver al sitio del colegio
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}