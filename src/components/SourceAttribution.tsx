import { useState } from 'react';

interface Source {
  text: string[];
  url: string[];
  additional_attribution_text?: string;
}

interface SourceAttributionProps {
  isVisible: boolean;
  source?: Source;
}

/**
 * Shows data-source links beneath a selected basemap option.
 * Optionally expands a full attribution text.
 */
const SourceAttribution = ({ isVisible, source }: SourceAttributionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || !source) return null;

  return (
    <div className="ml-0 text-xs text-gray-500 mt-1 space-y-1">
      <div>
        <span>Source{source.text.length > 1 ? 's' : ''}: </span>
        {source.text.map((text, index) => (
          <span key={index}>
            <a
              href={source.url[index]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {text}
            </a>
            {index < source.text.length - 1 && ', '}
          </span>
        ))}
      </div>

      {source.additional_attribution_text && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-700 hover:text-gray-900 cursor-pointer flex items-center gap-1"
          >
            {isExpanded ? '▼' : '▶'} Full attribution text
          </button>
          {isExpanded && (
            <div className="mt-1 pl-4 text-gray-600 text-xs leading-relaxed">
              {source.additional_attribution_text}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SourceAttribution;
