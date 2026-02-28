import React, { useState, useEffect } from 'react';


interface GeneralTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: number) => void;
  defaultTarget?: number;
}

const GeneralTargetModal: React.FC<GeneralTargetModalProps> = ({ isOpen, onClose, onSave, defaultTarget }) => {
  const [target, setTarget] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTarget(defaultTarget !== undefined ? String(defaultTarget) : '');
    }
  }, [isOpen, defaultTarget]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(target);
    if (!isNaN(num) && num >= 0) {
      onSave(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center pb-4 sm:pb-0">
      <div className="glassy-card w-[calc(100%-2rem)] sm:w-full max-w-md rounded-3xl border border-white/40 shadow-2xl p-6 pb-8 animate-slide-up" style={{ background: 'rgba(255,255,255,0.5)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', backdropFilter: 'blur(16px)' }}>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-left">Set General Target</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="general-target" className="block text-sm font-semibold text-gray-700 mb-1">
              General Target ($)
            </label>
            <input
              id="general-target"
              type="number"
              min="0"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 p-3 outline outline-gray-300 focus:border-primary focus:ring-primary bg-white/60 backdrop-blur"
              placeholder="Set your general target"
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white/70 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg font-bold shadow hover:scale-105 transition-transform duration-200"
            >
              Save Target
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(.4,1.7,.7,1) both; }
      `}</style>
    </div>
  );
};

export default GeneralTargetModal;
