import { Layers } from 'lucide-react';

export default function SidebarToggleButton({ 
  position, 
  onClick, 
  title, 
  Icon = Layers, // Default to Layers icon
  ClassName = ''
}) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-4 ${position}-4 z-30 p-2 bg-white shadow rounded-full hover:bg-gray-100`}
      title={title}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
