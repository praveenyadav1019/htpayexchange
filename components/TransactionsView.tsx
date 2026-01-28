
import React, { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
import { Filter, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const TransactionsView: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'USDT Sell'>('All');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Use api.user.get as defined in services/api.ts
        const data = await api.user.get('/transactions');
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-gray-900">Transactions</h3>
          <button className="p-2 text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="flex space-x-8 border-b border-gray-100 mb-8">
          <button 
            onClick={() => setActiveFilter('All')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeFilter === 'All' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            All
            {activeFilter === 'All' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
          </button>
          <button 
            onClick={() => setActiveFilter('USDT Sell')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeFilter === 'USDT Sell' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            USDT Sell
            {activeFilter === 'USDT Sell' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>}
          </button>
        </div>

        <div className="pt-4">
          {loading ? (
             <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="py-4">Date</th>
                    <th className="py-4">Type</th>
                    <th className="py-4">Amount</th>
                    <th className="py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-sm text-gray-600">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="py-4 text-sm font-bold text-gray-900">{tx.type}</td>
                      <td className="py-4 text-sm font-bold text-blue-600">{tx.amount.toLocaleString()} {tx.currency}</td>
                      <td className="py-4">
                         <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                           tx.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                         }`}>
                           {tx.status}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsView;
