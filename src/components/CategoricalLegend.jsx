import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CategoricalLegend = ({ 
  data, 
  labelKey, 
  colorKeys = { r: 'r', g: 'g', b: 'b' }, 
  detailKey = null,
  title = "Legend",
  className = ""
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (key) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const getRgbColor = (item) => {
    const r = item[colorKeys.r] || 0;
    const g = item[colorKeys.g] || 0;
    const b = item[colorKeys.b] || 0;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const entries = Object.entries(data);

  return (
    //<div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
    <div className={`bg-white p-2 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="space-y-2">
        {entries.map(([key, item]) => {
          const isExpanded = expandedItems.has(key);
          const hasDetail = detailKey && item[detailKey];
          
          return (
            <div key={key} className="flex flex-col">
              <div className="flex items-center space-x-3">
                {/* Color square */}
                <div 
                  className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"
                  style={{ backgroundColor: getRgbColor(item) }}
                />
                
                {/* Label */}
                <span className="text-sm text-gray-700 flex-grow">
                  {item[labelKey] || key}
                </span>
                
                {/* Expand/collapse arrow */}
                {hasDetail && (
                  <button
                    onClick={() => toggleExpanded(key)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                )}
              </div>
              
              {/* Expanded detail */}
              {hasDetail && isExpanded && (
                <div className="ml-7 mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {item[detailKey]}
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
