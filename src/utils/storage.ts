import type { DrawResult, Assignment } from '../types';

const STORAGE_KEY = 'gift_exchange_draw';

/**
 * Guarda el resultado del sorteo en localStorage
 */
export const saveDrawResult = (assignments: Assignment[]): string => {
  // Limpiar sorteo anterior
  localStorage.removeItem(STORAGE_KEY);
  const drawResult: DrawResult = {
    id: `draw-${Date.now()}`,
    assignments,
    createdAt: new Date()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawResult));
  return drawResult.id;
};

/**
 * Obtiene el resultado del sorteo desde localStorage
 */
export const getDrawResult = (): DrawResult | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const result = JSON.parse(stored);
    result.createdAt = new Date(result.createdAt);
    return result;
  } catch {
    return null;
  }
};

/**
 * Marca una asignación como accedida usando el token
 */
export const markAsAccessed = (token: string): boolean => {
  const drawResult = getDrawResult();
  if (!drawResult) return false;

  const assignment = drawResult.assignments.find(a => a.token === token);
  if (!assignment) return false;

  assignment.accessed = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drawResult));
  return true;
};

/**
 * Verifica si un token ya fue accedido
 */
export const isTokenAccessed = (token: string): boolean => {
  const drawResult = getDrawResult();
  if (!drawResult) return false;

  const assignment = drawResult.assignments.find(a => a.token === token);
  return assignment?.accessed || false;
};

/**
 * Obtiene una asignación por token
 */
export const getAssignmentByToken = (token: string): Assignment | null => {
  const drawResult = getDrawResult();
  if (!drawResult) return null;

  return drawResult.assignments.find(a => a.token === token) || null;
};

/**
 * Limpia el sorteo actual
 */
export const clearDraw = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
