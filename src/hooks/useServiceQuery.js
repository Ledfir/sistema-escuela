import { useQuery } from "@tanstack/react-query";

/** Consulta de servicios con valores por defecto adecuados para el panel. */
export function useServiceQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 10_000,
    retry: 0,
    ...options,
  });
}