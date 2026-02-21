/**
 * Strict lifecycle: Design → Development → Testing → Released
 * Role-based transitions only.
 */
export const STAGE_ORDER = ['design', 'development', 'testing', 'released'];

/** Allowed (fromStage, toStage) → roles that can perform the transition */
const ALLOWED_TRANSITIONS = {
  design_development: ['developer'],
  development_testing: ['tester'],
  testing_released: ['admin'],
};

export function getNextStage(currentStage) {
  const i = STAGE_ORDER.indexOf(currentStage);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

export function getAllowedRolesForTransition(fromStage, toStage) {
  const key = `${fromStage}_${toStage}`;
  return ALLOWED_TRANSITIONS[key] || [];
}

export function isAllowedStageTransition(fromStage, toStage, userRole) {
  const next = getNextStage(fromStage);
  if (toStage !== next) return false;
  const allowed = getAllowedRolesForTransition(fromStage, toStage);
  return allowed.includes(userRole);
}

export function getTransitionErrorMessage(fromStage, toStage, userRole) {
  const next = getNextStage(fromStage);
  if (!next) return 'Product is already released. No further transitions allowed.';
  if (toStage !== next) {
    return `Invalid transition. Allowed flow: Design → Development → Testing → Released. From "${fromStage}" you can only move to "${next}".`;
  }
  const allowed = getAllowedRolesForTransition(fromStage, toStage);
  const roleLabel = { admin: 'Admin', developer: 'Developer', tester: 'Tester' }[allowed[0]];
  return `Only ${roleLabel} can move from ${fromStage} to ${toStage}.`;
}

/** Returns true if transition is invalid (wrong target); use for 400 vs 403 */
export function isInvalidTransitionTarget(fromStage, toStage) {
  const next = getNextStage(fromStage);
  return !next || toStage !== next;
}
