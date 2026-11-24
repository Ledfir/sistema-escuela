import { cn } from "@/lib/utils";

export function Field({ label, htmlFor, error, hint, required, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-foreground">
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  );
}

export function FormSuccess({ message }) {
  if (!message) return null;
  return (
    <div role="status" className="border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">
      {message}
    </div>
  );
}