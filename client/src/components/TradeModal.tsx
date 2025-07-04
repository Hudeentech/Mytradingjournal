import React, { useState } from 'react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: {
    amount: number;
    type: 'profit' | 'loss';
    notes?: string;
  }) => void;
  trade?: {
    amount: number;
    type: 'profit' | 'loss';
    notes?: string;
  } | null;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, onSave, trade }) => {
  const [amount, setAmount] = useState(trade ? String(trade.amount) : '');
  const [notes, setNotes] = useState(trade ? trade.notes || '' : '');
  const [type, setType] = useState<'profit' | 'loss'>(trade ? trade.type : 'profit');

  React.useEffect(() => {
    if (trade) {
      setAmount(String(trade.amount));
      setNotes(trade.notes || '');
      setType(trade.type);
    } else {
      setAmount('');
      setNotes('');
      setType('profit');
    }
  }, [trade, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      amount: parseFloat(amount),
      type,
      notes,
    });
    // Reset form
    setAmount('');
    setNotes('');
    setType('profit');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 bg-white/40 backdrop-blur-sm flex items-end justify-center">
      <div className=" w-full max-w-md rounded-t-3xl border border-white/40 shadow-2xl p-6 pb-8 animate-slide-up" style={{background: 'rgba(255,255,255,0.5)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', backdropFilter: 'blur(16px)'}}>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-left">{trade ? 'Edit Trade' : 'Add New Trade'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 p-3 outline outline-blue-200 focus:border-primary focus:ring-primary bg-white/60 backdrop-blur"
              required
              placeholder='Enter amount in $'
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Trade Result</label>
            <div className="mt-2 flex gap-4">
              <button
                type="button"
                onClick={() => setType('profit')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium border-2 transition-all duration-150 ${
                  type === 'profit'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-blue-500 scale-105'
                    : 'bg-transparent border-blue-400 text-blue-700 hover:bg-blue-50'
                }`}
              >
                Profit
              </button>
              <button
                type="button"
                onClick={() => setType('loss')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium border-2 transition-all duration-150 ${
                  type === 'loss'
                    ? 'bg-gradient-to-r from-red-500 to-pink-400 text-white border-red-500 scale-105'
                    : 'bg-transparent border-red-400 text-red-700 hover:bg-red-50'
                }`}
              >
                Loss
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full border  rounded-lg border-gray-300 focus:border-primary focus:ring-primary bg-white/60 backdrop-blur"
              rows={3}
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
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg font-bold shadow hover:scale-105 transition-transform duration-200"
            >
              Save Trade
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

export default TradeModal;
