import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterState } from '../hooks/useFilterState';
import { getNextRoute, getPreviousRoute } from '../utils/navigationUtils';
import { useAppContext } from '../context/AppContext';
import ParameterSummary from '../components/ParameterSummary';

const GeneralSelectComponent = ({ 
  route,
  paramKey,
  title,
  description,
  getOptions,
  getContextDisplay,
  tableHeaders = [title],
  onSelect,
  customBackHandler,
  customNextHandler
}) => {
  const { data } = useAppContext();
  const { getParam, getAllParams, setParamAndNavigate } = useFilterState();
  const [selectedValue, setSelectedValue] = useState(getParam(paramKey) || '');
  const startingFilter = getParam('startingFilter');
  const allParams = getAllParams();
  const navigate = useNavigate();
  
  const handleSelect = (value) => {
    setSelectedValue(value);
    
    // Immediately update URL parameter when row is clicked
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(paramKey, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    
    // Call custom selection handler if provided
    if (onSelect) {
      onSelect(value);
    }
  };
  
  const handleNext = () => {
    if (!selectedValue) return;
    
    if (customNextHandler) {
      customNextHandler(selectedValue);
    } else {
      const nextRoute = getNextRoute(route, startingFilter);
      setParamAndNavigate(paramKey, selectedValue, nextRoute);
    }
  };
  
  const handleBack = () => {
    if (customBackHandler) {
      customBackHandler();
    } else {
      const prevRoute = getPreviousRoute(route, startingFilter);
      const currentParams = new URLSearchParams(window.location.search);
      // Remove the current parameter when going back
      currentParams.delete(paramKey);
      navigate(`${prevRoute}?${currentParams.toString()}`);
    }
  };
  
  const options = getOptions(allParams, data);
  const contextDisplay = getContextDisplay ? getContextDisplay(allParams) : null;
  
  // Determine if back button should be shown
  const showBackButton = customBackHandler !== null;
  
  return (
    <div className="relative" style={{ height: 'calc(100% - 40px)' }}>
      {/* Content area with scrolling */}
      <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
        <h2 className="text-2xl mb-4">Select {title}</h2>
        {contextDisplay && <div className="mb-4">{contextDisplay}</div>}
        {description && <p className="mb-4">{description}</p>}
        
        <table className="w-full mb-4 border">
          {tableHeaders.length > 0 && (
            <thead>
              <tr>
                {tableHeaders.map((header, index) => (
                  <th key={index} className="border px-2 text-left">{header}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              
              return (
                <tr 
                  key={optionValue} 
                  onClick={() => handleSelect(optionValue)} 
                  className={`cursor-pointer hover:bg-gray-50 ${optionValue === selectedValue ? 'bg-blue-100' : ''}`}
                >
                  {typeof option === 'string' ? (
                    <td className="border px-2 py-1">{option}</td>
                  ) : (
                    option.cells.map((cell, index) => (
                      <td key={index} className="border px-2 py-1">{cell}</td>
                    ))
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <ParameterSummary />
      </div>
      
      {/* Fixed navigation buttons at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t pt-4 bg-white h-15">
        <div className="flex justify-between gap-2">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={handleNext}
            disabled={!selectedValue}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 disabled:hover:bg-blue-500"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSelectComponent;
