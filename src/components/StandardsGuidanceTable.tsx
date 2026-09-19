import { STANDARD_GUIDANCE_ROWS } from '../constants/methodologicalStandards';
import MethodStandardMedal from './MethodStandardMedal';

const TIER_LABEL: Record<string, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

/**
 * Reusable Gold/Silver/Bronze practitioner-guidance table — shown both in the
 * 'Standard' column info pop-up (SelectDataset) and the final screen's
 * 'Methodological standard score' section, so the two stay in sync.
 */
const StandardsGuidanceTable = () => (
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="text-left border-b border-gray-300">
        <th className="py-2 pr-3 font-semibold text-gray-700">Ranking</th>
        <th className="py-2 pr-3 font-semibold text-gray-700">Score</th>
        <th className="py-2 font-semibold text-gray-700">Guidance to practitioner</th>
      </tr>
    </thead>
    <tbody>
      {STANDARD_GUIDANCE_ROWS.map((row) => (
        <tr key={row.tier} className="border-b border-gray-100 align-top last:border-0">
          <td className="py-2 pr-3 whitespace-nowrap">
            <span className="flex items-center gap-1.5 font-medium text-gray-800">
              <MethodStandardMedal tier={row.tier} /> {TIER_LABEL[row.tier]}
            </span>
          </td>
          <td className="py-2 pr-3 whitespace-nowrap text-gray-700">{row.scoreRange}</td>
          <td className="py-2 text-gray-700">
            {row.guidance.map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-1.5' : ''}>
                {paragraph}
              </p>
            ))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default StandardsGuidanceTable;
