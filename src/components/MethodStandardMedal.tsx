import type { ChecklistTier } from '../constants/methodologicalStandards';

const TIER_META: Record<ChecklistTier, { emoji: string; label: string }> = {
  gold: { emoji: '🥇', label: 'Gold' },
  silver: { emoji: '🥈', label: 'Silver' },
  bronze: { emoji: '🥉', label: 'Bronze' },
};

interface MethodStandardMedalProps {
  /** null means "unknown" — metadata unavailable or no checklist answers to score. */
  tier: ChecklistTier | null;
  className?: string;
}

/** Gold/Silver/Bronze medal, or an empty circle when the tier is unknown. */
const MethodStandardMedal = ({ tier, className = '' }: MethodStandardMedalProps) => {
  const label = tier ? TIER_META[tier].label : 'unknown';

  return (
    <span
      className={className}
      title={`Methodological standard score: ${label}`}
      aria-label={`Methodological standard score: ${label}`}
    >
      {tier ? TIER_META[tier].emoji : '○'}
    </span>
  );
};

export default MethodStandardMedal;
