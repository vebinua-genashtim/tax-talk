import { X } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'annual') => void;
}

export function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [billedTo, setBilledTo] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [country, setCountry] = useState('Singapore');
  const [zipCode, setZipCode] = useState('');

  if (!isOpen) return null;

  const monthlyPrice = 99;
  const annualPrice = 999;
  const monthlyPricePerMonth = monthlyPrice;
  const annualPricePerMonth = Math.round(annualPrice / 12);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubscribe(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full relative shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L4 10V16C4 23 9 27.5 16 28C23 27.5 28 23 28 16V10L16 4Z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upgrade to a Pro Membership
            </h2>
            <p className="text-sm text-gray-500">
              Get all access and an extra 20% off when you subscribe annually
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Billing Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Billed to
                  </label>
                  <input
                    type="text"
                    value={billedTo}
                    onChange={(e) => setBilledTo(e.target.value)}
                    placeholder="Jhon Smith"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ focusRingColor: '#033a66' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ focusRingColor: '#033a66' }}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-6 h-4 bg-red-500 rounded"></div>
                      <div className="w-6 h-4 bg-orange-400 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      MM / YY
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="12 / 25"
                      maxLength={7}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ focusRingColor: '#033a66' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ focusRingColor: '#033a66' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent appearance-none"
                      style={{ focusRingColor: '#033a66' }}
                      required
                    >
                      <option>Singapore</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>Canada</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      🇸🇬
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ focusRingColor: '#033a66' }}
                    required
                  />
                </div>

                <div className="text-xs text-gray-500 leading-relaxed pt-2">
                  By continuing you agree to our{' '}
                  <a href="#" className="hover:underline" style={{ color: '#033a66' }}>
                    terms and conditions
                  </a>
                  .
                </div>
              </div>

              {/* Right Column - Membership Type */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-700 mb-3">
                  Membership Type
                </label>

                {/* Monthly Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className="w-full p-4 rounded-xl border-2 transition text-left"
                  style={{
                    borderColor: selectedPlan === 'monthly' ? '#033a66' : '#e5e7eb',
                    backgroundColor: selectedPlan === 'monthly' ? '#f0f4f8' : 'transparent'
                  }}
                >
                  <div className="flex items-start">
                    <div
                      className="w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center"
                      style={{ borderColor: selectedPlan === 'monthly' ? '#033a66' : '#d1d5db' }}
                    >
                      {selectedPlan === 'monthly' && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#033a66' }}></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Pay Monthly</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        ${monthlyPricePerMonth} / Month Per Member
                      </div>
                    </div>
                  </div>
                </button>

                {/* Annual Option */}
                <button
                  type="button"
                  onClick={() => setSelectedPlan('annual')}
                  className="w-full p-4 rounded-xl border-2 transition text-left relative"
                  style={{
                    borderColor: selectedPlan === 'annual' ? '#827546' : '#e5e7eb',
                    backgroundColor: selectedPlan === 'annual' ? '#faf9f6' : 'transparent'
                  }}
                >
                  {selectedPlan === 'annual' && (
                    <div className="absolute -top-2 right-3 px-2 py-0.5 text-white text-xs font-semibold rounded" style={{ backgroundColor: '#827546' }}>
                      Save 20%
                    </div>
                  )}
                  <div className="flex items-start">
                    <div
                      className="w-5 h-5 rounded-full border-2 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center"
                      style={{ borderColor: selectedPlan === 'annual' ? '#827546' : '#d1d5db' }}
                    >
                      {selectedPlan === 'annual' && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#827546' }}></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Pay Annually</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        ${annualPricePerMonth} / Month Per Member
                      </div>
                    </div>
                  </div>
                </button>

                {/* Add-ons Section */}
                <div className="pt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-3">
                    Add ons
                  </label>

                  <div className="p-4 rounded-xl border-2 border-gray-200">
                    <div className="flex items-start">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5 mr-3 flex-shrink-0"></div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          AI Particle Accelerator
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 mb-2">
                          $20,000,000 / Month Per Member
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                          Unlimited use of AI or Q&A, Autofill, writer, and more
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${selectedPlan === 'monthly' ? monthlyPrice : annualPrice} / {selectedPlan === 'monthly' ? 'Month' : 'Year'}
                </div>
                <button
                  type="button"
                  className="text-sm hover:underline mt-1"
                  style={{ color: '#033a66' }}
                >
                  Details
                </button>
              </div>
              <button
                type="submit"
                className="px-8 py-3 rounded-lg text-white font-semibold transition hover:opacity-90 shadow-lg text-sm"
                style={{ background: 'linear-gradient(135deg, #827546 0%, #a08f5a 100%)' }}
              >
                Upgrade to Plus
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
