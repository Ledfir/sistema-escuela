const LOCALE = "es-MX";
const TZ = "America/Mexico_City";

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value || 0);
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatNumber(value) {
  return new Intl.NumberFormat(LOCALE).format(Number(value || 0));
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateLong(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

export function formatTime(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}

export function formatMonthYear(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatMonthShort(value) {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, { month: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
}

export function weekdayShort(value) {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat(LOCALE, { weekday: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
}

/** Fecha de hoy (zona centro de México) en formato YYYY-MM-DD. */
export function mxToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

export function addDays(iso, days) {
  const d = toDate(iso);
  if (!d) return iso;
  const copy = new Date(d.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy.toISOString().slice(0, 10);
}

export function daysBetween(fromIso, toIso) {
  const a = toDate(fromIso);
  const b = toIso ? toDate(toIso) : toDate(mxToday());
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function fullName(person) {
  if (!person) return "—";
  return [person.firstName, person.lastName].filter(Boolean).join(" ");
}

export function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}