import React from 'react';

const ClickableOption = ({ 
  onClick, 
  children, 
  className = "", 
  icon = null,
  title = null,
  subtitle = null,
  isSelected = false 
}) => {
  const baseClasses = "border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 flex items-center";
  const hoverClasses = "hover:border-blue-400 hover:bg-blue-50 hover:shadow-md";
  const selectedClasses = isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200";
  
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${selectedClasses} ${className}`}
    >
      {icon && (
        <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
      )}
      <div className="flex-1">
        {title && (
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
        )}
        {subtitle && (
          <p className="text-gray-600 text-sm">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
};

export default ClickableOption;
