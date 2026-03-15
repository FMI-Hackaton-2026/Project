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
  title: 'You’re not alone',
  message: 'If you’re in crisis, please reach out to a professional or someone you trust.',
  hotline: '988',
  hotlineLabel: 'Suicide & Crisis Lifeline',
  hotlineSub: 'Call or text 988',
};
