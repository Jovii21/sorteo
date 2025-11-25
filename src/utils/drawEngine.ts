import type { Participant, Restriction, Assignment } from '../types';

/**
 * Genera un token único para cada participante
 */
export const generateToken = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Valida que la configuración del sorteo sea correcta
 */
export const validateDrawConfig = (
  participants: Participant[],
  restrictions: Restriction[]
): { valid: boolean; error?: string } => {
  if (participants.length !== 13) {
    return {
      valid: false,
      error: 'Debes ingresar exactamente 13 participantes'
    };
  }

  const participantIds = new Set(participants.map(p => p.id));
  
  // Validar que las restricciones sean válidas
  for (const restriction of restrictions) {
    if (!participantIds.has(restriction.participantId)) {
      return {
        valid: false,
        error: 'Una restricción hace referencia a un participante inexistente'
      };
    }

    for (const restrictedId of restriction.cannotGiveTo) {
      if (!participantIds.has(restrictedId)) {
        return {
          valid: false,
          error: 'Una restricción hace referencia a un participante inexistente'
        };
      }
    }
  }

  return { valid: true };
};

/**
 * Verifica si una asignación es válida según las restricciones
 */
const isValidAssignment = (
  giverId: string,
  receiverId: string,
  restrictions: Restriction[]
): boolean => {
  if (giverId === receiverId) return false;

  const giverRestriction = restrictions.find(r => r.participantId === giverId);
  if (giverRestriction && giverRestriction.cannotGiveTo.includes(receiverId)) {
    return false;
  }

  return true;
};

/**
 * Implementa un algoritmo de backtracking para encontrar una asignación válida
 */
const findValidAssignment = (
  participants: Participant[],
  restrictions: Restriction[],
  assignments: Map<string, string>,
  availableReceivers: Set<string>,
  currentIndex: number
): boolean => {
  if (currentIndex === participants.length) {
    return true;
  }

  const giver = participants[currentIndex];
  const receivers = Array.from(availableReceivers);

  // Intentar asignar a cada receptor disponible
  for (const receiverId of receivers) {
    if (isValidAssignment(giver.id, receiverId, restrictions)) {
      assignments.set(giver.id, receiverId);
      availableReceivers.delete(receiverId);

      if (findValidAssignment(participants, restrictions, assignments, availableReceivers, currentIndex + 1)) {
        return true;
      }

      // Backtrack
      assignments.delete(giver.id);
      availableReceivers.add(receiverId);
    }
  }

  return false;
};

/**
 * Ejecuta el sorteo de intercambio de regalos
 */
export const performDraw = (
  participants: Participant[],
  restrictions: Restriction[]
): Assignment[] | null => {
  const validation = validateDrawConfig(participants, restrictions);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Mezclar participantes para añadir aleatoriedad
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
  const assignments = new Map<string, string>();
  const availableReceivers = new Set(participants.map(p => p.id));

  // Intentar encontrar una asignación válida
  const success = findValidAssignment(
    shuffledParticipants,
    restrictions,
    assignments,
    availableReceivers,
    0
  );

  if (!success) {
    return null;
  }

  // Convertir el mapa a la estructura de Assignment
  const result: Assignment[] = [];
  assignments.forEach((receiverId, giverId) => {
    const giver = participants.find(p => p.id === giverId);
    const receiver = participants.find(p => p.id === receiverId);

    if (giver && receiver) {
      result.push({
        giver: giver.name,
        receiver: receiver.name,
        token: generateToken(),
        accessed: false
      });
    }
  });

  return result;
};
