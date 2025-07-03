import React, { useState, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface CollapsibleCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ title, children, className = '', defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`glassy-card border border-gray-500 bg-white/60 backdrop-blur rounded-2xl p-0 mb-2 ${className}`} style={{ boxShadow: 'none' }}>
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-semibold text-gray-900  rounded-t-2xl bg-transparent"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
      </button>
      {open && <div className="px-6 pb-6 pt-2">{children}</div>}
    </div>
  );
};

export default CollapsibleCard;
