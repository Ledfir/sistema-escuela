import { EmptyState, ErrorState, LoadingBlock } from "./States";

/**
 * Envoltorio de estados de interfaz: carga, error y lista vacía.
 * `query` es el objeto que devuelve useQuery.
 */
export function AsyncState({
  query,
  children,
  loadingLabel,
  emptyTitle = "Aún no hay información",
  emptyDescription,
  emptyAction,
  isEmpty,
  rows = 4,
}) {
  if (query.isPending) return <LoadingBlock label={loadingLabel} rows={rows} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const data = query.data;
  const resolvedEmpty =
    typeof isEmpty === "function"
      ? isEmpty(data)
      : Array.isArray(data)
        ? data.length === 0
        : Array.isArray(data?.items)
          ? data.items.length === 0
          : false;

  if (resolvedEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return children(data);
}