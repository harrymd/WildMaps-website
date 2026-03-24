import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ColorKeys {
  r: string;
  g: string;
  b: string;
}

interface LegendItem {
  [key: string]: string | number;
}

interface CategoricalLegendProps {
  data: Record<string, LegendItem>;
  /** Key of the field to use as the row label. */
  labelKey: string;
  /** Keys for the R, G, B colour components within each item. */
  colorKeys?: ColorKeys;
  /** Optional key whose value is shown when a row is expanded. */
  detailKey?: string | null;
  title?: string;
  className?: string;
}

/**
 * Scrollable legend that maps categories to colour swatches.
 * Rows with a `detailKey` value are expandable.
 */
const CategoricalLegend = ({
  data,
  labelKey,
  colorKeys = { r: 'r', g: 'g', b: 'b' },
  detailKey = null,
  title = 'Legend',
  className = '',
}: CategoricalLegendProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (key: string) => {
    const next = new Set(expandedItems);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedItems(next);
  };

  const getRgbColor = (item: LegendItem) =>
    `rgb(${item[colorKeys.r] ?? 0}, ${item[colorKeys.g] ?? 0}, ${item[colorKeys.b] ?? 0})`;

  return (
    <div className={`bg-white p-2 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, item]) => {
          const isExpanded = expandedItems.has(key);
          const hasDetail = detailKey != null && item[detailKey];

          return (
            <div key={key} className="flex flex-col">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"
                  style={{ backgroundColor: getRgbColor(item) }}
                />
                <span className="text-sm text-gray-700 flex-grow">{String(item[labelKey] ?? key)}</span>
                {hasDetail && (
                  <button
                    onClick={() => toggleExpanded(key)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                  >
                    {isExpanded
                      ? <ChevronDown className="w-4 h-4 text-gray-500" />
                      : <ChevronRight className="w-4 h-4 text-gray-500" />
                    }
                  </button>
                )}
              </div>
              {hasDetail && isExpanded && (
                <div className="ml-7 mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {String(item[detailKey!])}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoricalLegend;
