import { API_CONFIG } from "@/config/appConfig";

export const SELECTED_STUDENT_KEY = "cm.portal.student";

export function readToken() {
  try {
    return window.localStorage.getItem(API_CONFIG.auth.tokenStorageKey);
  } catch {
    return null;
  }
}

export function writeToken(token) {
  try {
    window.localStorage.setItem(API_CONFIG.auth.tokenStorageKey, token);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(API_CONFIG.auth.tokenStorageKey);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function readSelectedStudent() {
  try {
    return window.localStorage.getItem(SELECTED_STUDENT_KEY);
  } catch {
    return null;
  }
}

export function writeSelectedStudent(id) {
  try {
    if (id) window.localStorage.setItem(SELECTED_STUDENT_KEY, id);
    else window.localStorage.removeItem(SELECTED_STUDENT_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}