import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute, getPreviousRoute } from '../utils/navigationUtils';
import { useAppContext } from '../context/AppContext';
import ParameterSummary from './ParameterSummary';
import type { DatasetMap } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A single option shown in the card-list. */
export interface SelectOption {
  value: string;
  /** One entry per column header. May be a string or a React element. */
  cells: (string | React.ReactNode)[];
}

interface GeneralSelectComponentProps {
  /** The URL route this component is mounted at, used for navigation. */
  route: string;
  /** URL search-param key that stores the selected value. */
  paramKey: string;
  title: string;
  description?: string;
  /**
   * Builds the list of options from the current URL params and the global dataset.
   * Evaluated on every render so filters are always up-to-date.
   */
  getOptions: (allParams: Record<string, string>, data: DatasetMap) => SelectOption[];
  /** Optional JSX to render above the option list (e.g. context breadcrumbs). */
  getContextDisplay?: ((allParams: Record<string, string>) => React.ReactNode) | null;
  /** Column headers displayed for multi-cell options. */
  tableHeaders?: string[];
  /** Called immediately when the user clicks an option (before navigation). */
  onSelect?: ((value: string) => void) | null;
  /** Override the default Back navigation. Pass null to hide the Back button. */
  customBackHandler?: (() => void) | null;
  /** Override the default Next navigation. */
  customNextHandler?: ((value: string) => void) | null;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Reusable card-list selector used by every step in the workflow.
 * Handles selection, URL param updates, and navigation automatically.
 */
const GeneralSelectComponent = ({
  route,
  paramKey,
  title,
  description,
  getOptions,
  getContextDisplay,
  tableHeaders = [title],
  onSelect = null,
  customBackHandler,
  customNextHandler,
}: GeneralSelectComponentProps) => {
  const { data } = useAppContext();
  const { getParam, getAllParams, setParamAndNavigate } = useFilterState();
  const [selectedValue, setSelectedValue] = useState(getParam(paramKey) ?? '');
  const startingFilter = getParam('startingFilter');
  const allParams = getAllParams();
  const navigate = useNavigate();

  const handleSelect = (value: string) => {
    setSelectedValue(value);

    // Immediately write the param to the URL so the browser history stays consistent
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(paramKey, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);

    onSelect?.(value);

    // Small delay to show selection feedback before navigating
    setTimeout(() => {
      if (customNextHandler) {
        customNextHandler(value);
      } else {
        const nextRoute = getNextRoute(route, startingFilter);
        setParamAndNavigate(paramKey, value, nextRoute);
      }
    }, 100);
  };

  const handleBack = () => {
    if (customBackHandler) {
      customBackHandler();
    } else {
      const prevRoute = getPreviousRoute(route, startingFilter);
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete(paramKey);
      navigate(`${prevRoute}?${currentParams.toString()}`);
    }
  };

  const options = getOptions(allParams, data);
  const contextDisplay = getContextDisplay ? getContextDisplay(allParams) : null;
  // Back button is hidden when customBackHandler is explicitly null
  const showBackButton = customBackHandler !== null;

  return (
    <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
      {/* Scrollable content area */}
      <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
        <h2 className="text-2xl mb-4">Select {title}</h2>
        {contextDisplay && <div className="mb-4">{contextDisplay}</div>}
        {description && <p className="mb-4 text-gray-600">{description}</p>}

        <div className="space-y-2 mb-4 px-2">
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
                  scale-[0.99] hover:scale-100 hover:shadow-md active:scale-[0.98]
                  ${isSelected
                    ? 'bg-blue-50 border-blue-300 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {tableHeaders.length > 1 ? (
                      // Multi-column layout
                      <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${tableHeaders.length}, 1fr)` }}
                      >
                        {option.cells.map((cell, index) => (
                          <div key={index}>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              {tableHeaders[index]}
                            </div>
                            <div className="font-medium text-gray-900">{cell}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{option.cells[0]}</span>
                    )}
                  </div>
                  {/* Chevron arrow */}
                  <div className={`${tableHeaders.length > 1 ? 'ml-4' : ''} text-blue-500`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ParameterSummary />
      </div>

      {/* Fixed Back button */}
      {showBackButton && (
        <div className="absolute bottom-0 left-0 right-0 border-t pt-4 bg-white h-15">
          <div className="flex justify-start">
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralSelectComponent;
