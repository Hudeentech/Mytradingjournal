import React, { useState, useEffect } from 'react';

interface GeneralTargetProps {
  onTargetChange?: (target: number) => void;
}

const LOCAL_STORAGE_KEY = 'generalTarget';

const GeneralTarget: React.FC<GeneralTargetProps> = ({ onTargetChange }) => {
  const [target, setTarget] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setTarget(saved);
  }, []);

  useEffect(() => {
    if (target) {
      localStorage.setItem(LOCAL_STORAGE_KEY, target);
      if (onTargetChange) onTargetChange(Number(target));
    }
  }, [target, onTargetChange]);

  return (
    <div className="glassy-card p-4 flex flex-col gap-2 items-start mb-4 bg-white/60 backdrop-blur border border-white/40">
      <label htmlFor="general-target" className="text-sm font-semibold text-gray-700 mb-1">General Target ($)</label>
      <input
        id="general-target"
        type="number"
        min="0"
        value={target}
        onChange={e => setTarget(e.target.value)}
        className="rounded-lg border border-gray-300 p-2 bg-white/80 focus:border-gray-400 focus:ring-gray-200 outline-none"
        placeholder="Set your general target"
      />
    </div>
  );
};

export default GeneralTarget;
