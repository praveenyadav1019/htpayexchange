
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Search, Filter, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';

const AdminTransactionHistory: React.FC = () => {
  const [txs, setTxs] = useState<any[]>([]);
  const [filteredTxs, setFilteredTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

  const fetchTxs = async () => {
    setLoading(true);
    try {
      // Use api.admin.get as defined in services/api.ts
      const all = await api.admin.get('/transactions');
      setTxs(all);
      setFilteredTxs(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  useEffect(() => {
    let result = txs;
    if (filterType !== 'ALL') {
      result = result.filter(t => t.type === filterType);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(s) || 
        t.description?.toLowerCase().includes(s) ||
        t.user?.toLowerCase().includes(s)
      );
    }
    setFilteredTxs(result);
  }, [search, filterType, txs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'REJECTED': 
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-gray-900">Platform Ledger</h3>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              {(['ALL', 'DEPOSIT', 'WITHDRAWAL'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    filterType === type 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Description or User..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client ID</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-blue-600"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filteredTxs.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-medium">No records matching your criteria</td></tr>
              ) : filteredTxs.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {tx.type === 'DEPOSIT' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{tx.description || 'Global Payout'}</p>
                        <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-tighter">{tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-600">{tx.user}</span>
                      <Info size={12} className="text-gray-300 cursor-help" />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${tx.type === 'DEPOSIT' ? 'text-green-500' : 'text-blue-500'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {tx.amount.toLocaleString()} 
                        <span className="ml-1 text-[10px] font-bold text-gray-400">{tx.currency}</span>
                      </p>
                      {tx.rateAtTime && (
                         <p className="text-[9px] text-gray-400 font-medium mt-0.5">Rate: {tx.rateAtTime}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-xs font-bold text-gray-700">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionHistory;
