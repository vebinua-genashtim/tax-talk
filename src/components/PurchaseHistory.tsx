import { Receipt, Calendar, DollarSign, Video as VideoIcon } from 'lucide-react';

interface Purchase {
  id: string;
  video_title: string;
  amount_paid: number;
  purchased_at: string;
  type: 'video' | 'subscription';
}

interface PurchaseHistoryProps {
  purchases: Purchase[];
}

export function PurchaseHistory({ purchases }: PurchaseHistoryProps) {
  if (purchases.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mb-10 px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-2 rounded-xl">
          <Receipt className="w-5 h-5 text-green-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Purchase History
        </h2>
      </div>

      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/20 border-b border-white/10">
              <tr>
                <th className="text-left text-white/60 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Item
                </th>
                <th className="text-left text-white/60 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Date
                </th>
                <th className="text-right text-white/60 text-xs font-medium uppercase tracking-wider px-6 py-4">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        purchase.type === 'subscription'
                          ? 'bg-amber-500/20'
                          : 'bg-blue-500/20'
                      }`}>
                        {purchase.type === 'subscription' ? (
                          <Receipt className="w-4 h-4 text-amber-400" />
                        ) : (
                          <VideoIcon className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {purchase.video_title}
                        </p>
                        <p className="text-white/60 text-xs capitalize">
                          {purchase.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(purchase.purchased_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-white font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {purchase.amount_paid.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
