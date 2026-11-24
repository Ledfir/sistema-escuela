import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions, children, className }) {
  return (
    <header className={cn("flex flex-col gap-4 border-b border-border pb-5", className)}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold">{eyebrow}</p>
          ) : null}
          <h1 className="font-display text-2xl leading-tight text-foreground sm:text-[28px]">{title}</h1>
          {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}