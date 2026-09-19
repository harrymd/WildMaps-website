import { X } from 'lucide-react';
import StandardsGuidanceTable from './StandardsGuidanceTable';

interface StandardsGuidanceModalProps {
  onClose: () => void;
}

/**
 * Blocking pop-up explaining the Gold/Silver/Bronze methodological standard
 * score. Only closable via the 'X' button — clicking the backdrop does nothing,
 * so it doesn't compete with the card-list's own click-to-select behaviour.
 */
const StandardsGuidanceModal = ({ onClose }: StandardsGuidanceModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
      >
        <X size={20} />
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 pr-8">Methodological standard score</h3>
      <StandardsGuidanceTable />
    </div>
  </div>
);

export default StandardsGuidanceModal;
