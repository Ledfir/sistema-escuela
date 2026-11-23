import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calculator,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  History,
  LayoutDashboard,
  Library,
  Megaphone,
  Receipt,
  Settings,
  UserPlus,
  Users,
  CheckSquare,
} from "lucide-react";

export const ROLE_LABELS = {
  admin: "Administrador general",
  direccion: "Dirección",
  control_escolar: "Control escolar",
  docente: "Docente",
  caja: "Caja",
  tutor: "Tutor",
};

const STAFF = ["admin", "direccion", "control_escolar", "docente", "caja"];
const ALL_STAFF = ["admin", "direccion", "control_escolar", "docente", "caja"];

export const NAV_ITEMS = [
  { key: "dashboard", group: "Principal", label: "Inicio", to: "/panel", icon: LayoutDashboard, roles: ALL_STAFF },
  { key: "admisiones", group: "Comunidad", label: "Admisiones", to: "/panel/admisiones", icon: UserPlus, roles: ["admin", "direccion", "control_escolar"] },
  { key: "alumnos", group: "Comunidad", label: "Alumnos", to: "/panel/alumnos", icon: GraduationCap, roles: ALL_STAFF },
  { key: "catalogos", group: "Comunidad", label: "Catálogos", to: "/panel/catalogos", icon: Library, roles: ["admin", "control_escolar"] },
  { key: "asignaciones", group: "Comunidad", label: "Asignaciones", to: "/panel/asignaciones", icon: ClipboardList, roles: ["admin", "direccion", "control_escolar", "docente"] },
  { key: "asistencia", group: "Académico", label: "Asistencia", to: "/panel/asistencia", icon: CheckSquare, roles: ["admin", "direccion", "control_escolar", "docente"] },
  { key: "incidencias", group: "Académico", label: "Incidencias", to: "/panel/incidencias", icon: AlertTriangle, roles: ["admin", "direccion", "control_escolar", "docente"] },
  { key: "calificaciones", group: "Académico", label: "Calificaciones", to: "/panel/calificaciones", icon: BookOpen, roles: ["admin", "direccion", "control_escolar", "docente"] },
  { key: "boletas", group: "Académico", label: "Boletas", to: "/panel/boletas", icon: FileText, roles: ["admin", "direccion", "control_escolar", "docente"] },
  { key: "cargos", group: "Finanzas", label: "Cargos y estado de cuenta", to: "/panel/cargos", icon: Receipt, roles: ["admin", "direccion", "caja"] },
  { key: "pagos", group: "Finanzas", label: "Pagos y recibos", to: "/panel/pagos", icon: CreditCard, roles: ["admin", "direccion", "caja"] },
  { key: "corte", group: "Finanzas", label: "Corte de caja", to: "/panel/corte", icon: Calculator, roles: ["admin", "direccion", "caja"] },
  { key: "avisos", group: "Comunicación", label: "Avisos", to: "/panel/avisos", icon: Megaphone, roles: ["admin", "direccion", "control_escolar", "docente"] },
  { key: "calendario", group: "Comunicación", label: "Calendario", to: "/panel/calendario", icon: CalendarDays, roles: ALL_STAFF },
  { key: "reportes", group: "Análisis", label: "Reportes", to: "/panel/reportes", icon: BarChart3, roles: ["admin", "direccion", "control_escolar", "caja"] },
  { key: "auditoria", group: "Análisis", label: "Auditoría", to: "/panel/auditoria", icon: History, roles: ["admin", "direccion"] },
  { key: "usuarios", group: "Administración", label: "Usuarios y permisos", to: "/panel/usuarios", icon: Users, roles: ["admin"] },
  { key: "contenido", group: "Administración", label: "Contenido público", to: "/panel/contenido", icon: Globe, roles: ["admin", "direccion"] },
  { key: "configuracion", group: "Administración", label: "Configuración", to: "/panel/configuracion", icon: Settings, roles: ["admin", "direccion"] },
];

export const NAV_GROUPS = ["Principal", "Comunidad", "Académico", "Finanzas", "Comunicación", "Análisis", "Administración"];

export function navForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function isStaff(role) {
  return STAFF.includes(role);
}

export function homeForRole(role) {
  return role === "tutor" ? "/portal" : "/panel";
}

export function canAccessPath(role, pathname) {
  return navForRole(role).some((item) =>
    item.to === "/panel" ? pathname === "/panel" : pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
}

/** Capacidades de interfaz. La autorización real siempre la valida el servidor. */
const CAPS = {
  admin: ["*"],
  direccion: [
    "admissions.view",
    "admissions.manage",
    "students.view",
    "students.manage",
    "attendance.view",
    "attendance.report",
    "grades.view",
    "grades.publish",
    "payments.view",
    "charges.view",
    "reports.view",
    "announcements.manage",
    "calendar.manage",
    "content.edit",
    "settings.view",
    "audit.view",
    "users.view",
  ],
  control_escolar: [
    "admissions.view",
    "admissions.manage",
    "students.view",
    "students.manage",
    "catalogs.manage",
    "assignments.manage",
    "attendance.view",
    "attendance.capture",
    "attendance.report",
    "incidents.manage",
    "grades.view",
    "announcements.manage",
    "reports.view",
    "calendar.manage",
    "users.view",
  ],
  docente: [
    "students.view",
    "attendance.capture",
    "attendance.report",
    "grades.view",
    "grades.capture",
    "incidents.manage",
    "announcements.create",
    "calendar.view",
  ],
  caja: ["students.view", "payments.view", "payments.register", "payments.cancel", "charges.view", "charges.manage", "cashcut.view", "reports.view"],
  tutor: ["portal.view"],
};

export function can(role, capability) {
  const caps = CAPS[role] || [];
  return caps.includes("*") || caps.includes(capability);
}