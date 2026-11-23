/**
 * Configuración central del frontend.
 *
 * Cambia aquí el modo de ejecución y la URL base de tu API REST:
 *   VITE_DATA_MODE = "mock" | "api"
 *   VITE_API_BASE_URL = "https://tu-servidor.mx/api/v1"
 *
 * No coloques secretos del servidor en este archivo: todo lo que está aquí
 * viaja al navegador.
 */

const env = import.meta.env || {};

export const API_CONFIG = {
  /** URL base de tu API REST (sin barra final). */
  baseUrl: (env.VITE_API_BASE_URL || "https://api.colegiomonteverde.mx/v1").replace(/\/$/, ""),
  /** "mock" = datos ficticios en memoria · "api" = tu servidor real. */
  mode: env.VITE_DATA_MODE === "api" ? "api" : "mock",
  timeoutMs: 20000,
  auth: {
    /** Mecanismo de sesión que definas: "bearer" (token en cabecera) o "cookie" (HttpOnly). */
    strategy: "bearer",
    tokenStorageKey: "cm.session.token",
    loginPath: "/auth/login",
    mePath: "/auth/me",
    logoutPath: "/auth/logout",
    forgotPasswordPath: "/auth/password/forgot",
    resetPasswordPath: "/auth/password/reset",
  },
};

export const BRAND_IMAGES = {
  campus: "https://media.base44.com/images/public/6afdde31503e92897bfa1175/96871d035_generated_image.png",
  library: "https://media.base44.com/images/public/6afdde31503e92897bfa1175/e45b974b1_generated_image.png",
};

export const APP_CONFIG = {
  /** Nombre interno del producto. */
  name: "Sistema escolar",
  /** Cambio de rol y utilidades de prueba: solo existen en modo demostración. */
  demo: {
    allowRoleSwitch: true,
    /** Credenciales de demostración que se muestran en la pantalla de acceso. */
    passwordHint: "demo1234",
    accounts: [
      { email: "admin@colegiomonteverde.edu.mx", role: "admin", label: "Administrador general", name: "Alejandra Sosa" },
      { email: "direccion@colegiomonteverde.edu.mx", role: "direccion", label: "Dirección", name: "Rodrigo Márquez" },
      { email: "control@colegiomonteverde.edu.mx", role: "control_escolar", label: "Control escolar", name: "Karla Fuentes" },
      { email: "docente@colegiomonteverde.edu.mx", role: "docente", label: "Docente", name: "Daniela Ríos" },
      { email: "caja@colegiomonteverde.edu.mx", role: "caja", label: "Caja", name: "Miguel Ángel Torres" },
      { email: "tutor@colegiomonteverde.edu.mx", role: "tutor", label: "Tutor (portal familiar)", name: "Verónica Salgado" },
    ],
  },
  /** Ciclo escolar que se preselecciona al entrar. */
  defaultCycleId: "cyc-2026",
  pagination: { pageSize: 10, pageSizeOptions: [10, 25, 50] },
  supportEmail: "sistemas@colegiomonteverde.edu.mx",
};

export const isDemoMode = API_CONFIG.mode === "mock";
export const isApiMode = API_CONFIG.mode === "api";