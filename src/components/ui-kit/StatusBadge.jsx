import { cn } from "@/lib/utils";

const TONES = {
  green: "bg-primary/10 text-primary border-primary/20",
  sand: "bg-accent/40 text-[#6b5622] border-accent",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  red: "bg-destructive/10 text-destructive border-destructive/20",
  gray: "bg-muted text-muted-foreground border-border",
  blue: "bg-sky-50 text-sky-800 border-sky-200",
};

const MAP = {
  activo: ["Activo", "green"],
  vigente: ["Vigente", "green"],
  pagado: ["Pagado", "green"],
  publicado: ["Publicado", "green"],
  autorizada: ["Autorizada", "green"],
  presente: ["Presente", "green"],
  cerrado: ["Cerrado", "green"],
  inscrito: ["Inscrito", "green"],
  aceptado: ["Aceptado", "green"],
  nuevo: ["Nuevo", "blue"],
  contactado: ["Contactado", "blue"],
  visita: ["Visita agendada", "blue"],
  evaluacion: ["En evaluación", "sand"],
  seguimiento: ["En seguimiento", "sand"],
  parcial: ["Parcial", "sand"],
  pendiente: ["Pendiente", "sand"],
  programado: ["Programado", "sand"],
  borrador: ["Borrador", "sand"],
  en_revision: ["En revisión", "sand"],
  solicitada: ["Solicitada", "sand"],
  retardo: ["Retardo", "sand"],
  justificado: ["Justificado", "blue"],
  abierto: ["Abierto", "amber"],
  invitado: ["Invitado", "gray"],
  inactivo: ["Inactivo", "gray"],
  sin_captura: ["Sin captura", "gray"],
  descartado: ["Descartado", "gray"],
  vencido: ["Vencido", "red"],
  falta: ["Falta", "red"],
  cancelado: ["Cancelado", "red"],
  rechazada: ["Rechazada", "red"],
  baja: ["Baja", "red"],
};

export function StatusBadge({ status, label, className }) {
  const [defaultLabel, tone] = MAP[status] || [status || "—", "gray"];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {label || defaultLabel}
    </span>
  );
}

export const STATUS_LABELS = Object.fromEntries(Object.entries(MAP).map(([key, [label]]) => [key, label]));