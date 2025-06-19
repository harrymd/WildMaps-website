import { X } from 'lucide-react';

export default function Sidebar({ title, isOpen, onClose, children, side = 'left', width }) {
  return (
    <div
      style={{ width: isOpen ? width : '0' }}
      className={`fixed top-0 ${side}-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'p-6' : 'p-0'
      }`}
    >
      <div
        className={`transition-opacity duration-300 h-full overflow-y-auto ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          {/*<h2 className="text-lg font-semibold">{title}</h2>*/}
          <h2 className="text-lg font-semibold"></h2>
          <button onClick={onClose} className="hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
