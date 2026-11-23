/** Descarga un Blob generado por los servicios (exportaciones, documentos). */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Imprime un contenedor específico (boletas, recibos, cortes). */
export function printArea() {
  window.print();
}