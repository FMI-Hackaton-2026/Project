/**
 * Passive crisis keyword monitoring during SURGE intervention.
 * Hardcoded list; in production would integrate with backend or crisis service.
 */
const CRISIS_PATTERNS = [
  /\b(kill myself|suicide|end my life|want to die)\b/i,
  /\b(self[- ]?harm|cutting|hurt myself)\b/i,
  /\b(no way out|can\'t go on)\b/i,
];

export function containsCrisisLanguage(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return CRISIS_PATTERNS.some((p) => p.test(normalized));
}

export const CRISIS_RESOURCES = {
  title: 'Не сте сами',
  message: 'Ако сте в криза, моля обърнете се към специалист или човек, на когото се доверявате.',
  hotline: '988',
  hotlineLabel: 'Линия за кризи и самоубийства',
  hotlineSub: 'Обадете се или пишете на 988',
};
