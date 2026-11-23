/** Convierte un objeto de filtros en query string (omite vacíos y page=1). */
export function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "todos") return;
    if (key === "page" && Number(value) === 1) return;
    search.set(key, String(value));
  });
  const result = search.toString();
  return result ? `?${result}` : "";
}