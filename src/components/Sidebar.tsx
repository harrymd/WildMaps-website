import { X } from 'lucide-react';

interface SidebarProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: string;
  scrollOnOverflow?: boolean;
  className?: string;
}

/** Animated slide-in panel — shared by the dataset browser and basemap controls. */
export default function Sidebar({
  title,
  isOpen,
  onClose,
  children,
  side = 'left',
  width,
  scrollOnOverflow = false,
  className = '',
}: SidebarProps) {
  const borderSide = side === 'left' ? 'border-r-4' : 'border-l-4';

  return (
    <div
      style={{ width: isOpen ? width : '0' }}
      className={`fixed top-0 ${side}-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? `p-4 ${borderSide} border-gray-600` : 'p-0'
      } ${className}`}
    >
      <div
        className={`transition-opacity duration-300 h-full ${scrollOnOverflow ? 'overflow-y-auto' : ''} ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-1 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
