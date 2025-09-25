const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Constrói uma URL de recurso completa a partir de um caminho relativo,
 * garantindo que não haja barras duplas.
 * @param relativePath O caminho relativo do recurso (ex: /uploads/avatar.jpg).
 * @returns A URL completa do recurso.
 */
export function createResourceURL(relativePath: string | undefined | null): string | undefined {
  if (!relativePath) {
    return undefined;
  }

  // Se já for uma URL completa, retorna diretamente.
  if (relativePath.startsWith('http')) {
    return relativePath;
  }

  // Concatena a base da API e o caminho. O backend já garante a barra inicial.
  return `${API_BASE_URL}${relativePath}`;
}