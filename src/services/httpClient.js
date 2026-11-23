import { API_CONFIG } from "@/config/appConfig";
import { ApiError } from "./errors";

/**
 * Cliente HTTP único para tu API REST.
 * Aquí se concentran la URL base, el token de sesión, los tiempos de espera
 * y la traducción de errores del servidor. Los servicios por módulo
 * (src/services/apiServices.js) solo declaran rutas y parámetros.
 */

function readToken() {
  try {
    return window.localStorage.getItem(API_CONFIG.auth.tokenStorageKey);
  } catch {
    return null;
  }
}

function buildUrl(path, params) {
  const url = new URL(`${API_CONFIG.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "todos") return;
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
    else url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function parseFieldErrors(body) {
  const source = body?.field_errors || body?.errors || body?.fieldErrors;
  if (!source || typeof source !== "object") return null;
  const out = {};
  Object.entries(source).forEach(([field, value]) => {
    out[field] = Array.isArray(value) ? value[0] : String(value);
  });
  return Object.keys(out).length ? out : null;
}

async function request(path, { method = "GET", body, params, headers, responseType = "json" } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);
  const token = API_CONFIG.auth.strategy === "bearer" ? readToken() : null;

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      credentials: "include",
      signal: controller.signal,
      headers: {
        Accept: responseType === "blob" ? "*/*" : "application/json",
        ...(body instanceof FormData ? {} : body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) return null;

    if (!response.ok) {
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      const message =
        payload?.message ||
        payload?.error ||
        (response.status === 401
          ? "Tu sesión expiró. Vuelve a iniciar sesión."
          : response.status === 403
            ? "No cuentas con permisos para esta operación."
            : `El servidor respondió ${response.status}.`);
      throw new ApiError(message, {
        status: response.status,
        code: payload?.code || null,
        fieldErrors: parseFieldErrors(payload),
        payload,
      });
    }

    if (responseType === "blob") return await response.blob();
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") {
      throw new ApiError("El servidor tardó demasiado en responder. Intenta de nuevo.", { status: 408 });
    }
    throw new ApiError(
      "No se pudo conectar con el servidor. Revisa tu conexión o la URL base configurada.",
      { status: 0 },
    );
  } finally {
    clearTimeout(timer);
  }
}

export const http = {
  get: (path, params, options) => request(path, { ...options, params }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
  download: (path, params) => request(path, { params, responseType: "blob" }),
};

export { buildUrl, readToken };