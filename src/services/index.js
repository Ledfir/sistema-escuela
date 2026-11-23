import { API_CONFIG } from "@/config/appConfig";
import { createApiServices } from "./apiServices";
import { createMockServices } from "./mockServices";

/**
 * Punto único de acceso a los servicios.
 *
 * Las pantallas siempre llaman `services.<módulo>.<acción>()` y reciben la misma
 * forma de respuesta en ambos modos. Cambiar `VITE_DATA_MODE` a "api" no obliga
 * a tocar ninguna pantalla.
 */

let instance = null;

function getServices() {
  if (!instance) {
    instance = API_CONFIG.mode === "api" ? createApiServices() : createMockServices();
  }
  return instance;
}

export const services = getServices();
export const isDemoMode = API_CONFIG.mode === "mock";
export { ApiError, errorMessage, isForbidden, isUnauthorized } from "./errors";