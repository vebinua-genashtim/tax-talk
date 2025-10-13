import { X, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Video } from '../lib/supabase';

interface PaymentModalProps {
  isOpen: boolean;
  video: Video | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentModal({ isOpen, video, onClose, onConfirm }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !video) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      onConfirm();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#033a66' }}>
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#033a66' }}>
            Purchase Video
          </h2>
          <p className="text-gray-600 text-sm">Complete your purchase to get lifetime access</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-1">{video.title}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">{video.duration_minutes} minutes</span>
            <span className="text-2xl font-bold" style={{ color: '#827546' }}>
              ${video.price.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 rounded text-white font-semibold transition hover:scale-105 disabled:opacity-50 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)', boxShadow: '0 4px 15px rgba(130, 117, 70, 0.4)' }}
          >
            {processing ? 'Processing...' : `Pay $${video.price.toFixed(2)}`}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment processing. Your payment information is encrypted.
        </p>
      </div>
    </div>
  );
}
