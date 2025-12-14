import type { DrawResult, Assignment } from "../types";
import drawsJson from "../data/draws.json";

const STORAGE_LIST_KEY = "gift_exchange_draws";
const STORAGE_ACTIVE_KEY = "gift_exchange_draw_active";

/**
 * Obtiene la lista de sorteos desde localStorage o desde draws.json si es la primera vez
 */
export const getDrawList = (): DrawResult[] => {
  const stored = localStorage.getItem(STORAGE_LIST_KEY);
  if (stored) {
    try {
      const list = JSON.parse(stored);
      return list.map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      }));
    } catch {
      return [];
    }
  } else {
    // Si no hay nada en localStorage, usar draws.json y guardarlo en localStorage
    try {
      const list = (drawsJson as any[]).map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      }));
      localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(drawsJson));
      if (list.length > 0) {
        localStorage.setItem(STORAGE_ACTIVE_KEY, list[0].id);
      }
      return list;
    } catch {
      return [];
    }
  }
};

/**
 * Guarda el resultado del sorteo en localStorage
 */
export const saveDrawResult = (
  assignments: Assignment[],
  name?: string
): string => {
  const drawResult: DrawResult = {
    id: `draw-${Date.now()}`,
    assignments,
    createdAt: new Date(),
    name,
  };
  // Obtener lista actual
  const draws = getDrawList();
  draws.push(drawResult);
  localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(draws));
  localStorage.setItem(STORAGE_ACTIVE_KEY, drawResult.id);
  return drawResult.id;
};

export const getActiveDrawId = (): string | null => {
  return localStorage.getItem(STORAGE_ACTIVE_KEY);
};

export const setActiveDrawId = (id: string) => {
  localStorage.setItem(STORAGE_ACTIVE_KEY, id);
};

/**
 * Obtiene el resultado del sorteo desde localStorage
 */
export const getDrawResult = (): DrawResult | null => {
  const draws = getDrawList();
  const activeId = getActiveDrawId();
  if (!activeId) return null;
  return draws.find((d: DrawResult) => d.id === activeId) || null;
};

/**
 * Marca una asignación como accedida usando el token
 */
export const markAsAccessed = (token: string): boolean => {
  const draws = getDrawList();
  const activeId = getActiveDrawId();
  if (!activeId) return false;
  const drawIndex = draws.findIndex((d: DrawResult) => d.id === activeId);
  if (drawIndex === -1) return false;
  const assignment = draws[drawIndex].assignments.find(
    (a: Assignment) => a.token === token
  );
  if (!assignment) return false;
  assignment.accessed = true;
  localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(draws));
  return true;
};

/**
 * Verifica si un token ya fue accedido
 */
export const isTokenAccessed = (token: string): boolean => {
  const drawResult = getDrawResult();
  if (!drawResult) return false;

  const assignment = drawResult.assignments.find(
    (a: Assignment) => a.token === token
  );
  return assignment?.accessed || false;
};

/**
 * Obtiene una asignación por token
 */
export const getAssignmentByToken = (token: string): Assignment | null => {
  const drawResult = getDrawResult();
  if (!drawResult) return null;

  return (
    drawResult.assignments.find((a: Assignment) => a.token === token) || null
  );
};

/**
 * Limpia el sorteo actual
 */
export const clearDraws = (): void => {
  localStorage.removeItem(STORAGE_LIST_KEY);
  localStorage.removeItem(STORAGE_ACTIVE_KEY);
};

export const clearDraw = clearDraws;
