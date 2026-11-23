/** Error normalizado para todas las respuestas de la API (reales o simuladas). */
export class ApiError extends Error {
  constructor(message, { status = 0, code = null, fieldErrors = null, payload = null } = {}) {
    super(message || "Ocurrió un error inesperado.");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.payload = payload;
  }
}

const handlers = { onUnauthorized: null, onForbidden: null };

/** La sesión de la app registra aquí qué hacer ante 401 / 403. */
export function setServiceHandlers(next) {
  Object.assign(handlers, next);
}

export function notifyServiceError(error) {
  if (!(error instanceof ApiError)) return;
  if (error.status === 401 && handlers.onUnauthorized) handlers.onUnauthorized(error);
  if (error.status === 403 && handlers.onForbidden) handlers.onForbidden(error);
}

export function isUnauthorized(error) {
  return error instanceof ApiError && error.status === 401;
}

export function isForbidden(error) {
  return error instanceof ApiError && error.status === 403;
}

export function errorMessage(error, fallback = "No se pudo completar la operación.") {
  if (!error) return fallback;
  return error.message || fallback;
}