import { Layers, type LucideProps } from 'lucide-react';

interface SidebarToggleButtonProps {
  position: 'left' | 'right';
  onClick: () => void;
  title: string;
  /** Lucide icon component to display. Defaults to the Layers icon. */
  Icon?: React.ComponentType<LucideProps>;
  className?: string;
}

/** Floating button shown when a sidebar is closed, used to reopen it. */
export default function SidebarToggleButton({
  position,
  onClick,
  title,
  Icon = Layers,
  className = '',
}: SidebarToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-4 ${position}-4 z-30 p-2 bg-white shadow rounded-full hover:bg-gray-100 ${className}`}
      title={title}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
