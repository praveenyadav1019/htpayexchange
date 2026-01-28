
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  ArrowUpRight, 
  Search, 
  Coins, 
  ArrowRightLeft, 
  Gift, 
  Percent,
  Banknote,
  RotateCcw
} from 'lucide-react';

interface Props {
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

type StatusType = 'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
type TxType = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'CONVERSION' | 'COMMISSION' | 'REFERRAL_BONUS';

const AdminTransactionManager: React.FC<Props> = ({ type }) => {
  const [txs, setTxs] = useState<any[]>([]);
  const [filteredTxs, setFilteredTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusType>('ALL');
  const [typeFilter, setTypeFilter] = useState<TxType>(type);

  const fetchTxs = async () => {
    setLoading(true);
    try {
      const all = await api.admin.get('/transactions');
      setTxs(all);
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
    if (typeFilter !== 'ALL') result = result.filter(t => t.type === typeFilter);
    if (statusFilter !== 'ALL') result = result.filter(t => t.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(s) || 
        (t.user && (typeof t.user === 'string' ? t.user : t.user.name || '').toLowerCase().includes(s)) ||
        (t.description && t.description.toLowerCase().includes(s))
      );
    }
    setFilteredTxs(result);
  }, [search, statusFilter, typeFilter, txs]);

  const handleAction = async (id: string, action: 'approve' | 'reject', txType: string) => {
    try {
      const endpoint = txType === 'DEPOSIT' ? `/deposits/${id}/${action}` : `/withdrawals/${id}/${action}`;
      await api.admin.post(endpoint, {});
      fetchTxs();
    } catch (err) {
      alert('Operation failed. Admin authorization may be required.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="flex items-center space-x-1 px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest"><Clock size={10} /><span>Pending</span></span>;
      case 'COMPLETED': return <span className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[10px] font-black uppercase tracking-widest"><CheckCircle size={10} /><span>Finalized</span></span>;
      case 'REJECTED': return <span className="flex items-center space-x-1 px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-widest"><XCircle size={10} /><span>Rejected</span></span>;
      default: return <span className="px-2 py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  const getTypeIcon = (tType: string) => {
    switch (tType) {
      case 'DEPOSIT': return <ArrowUpRight size={14} />;
      case 'WITHDRAWAL': return <Banknote size={14} />;
      case 'CONVERSION': return <ArrowRightLeft size={14} />;
      case 'COMMISSION': return <Percent size={14} />;
      case 'REFERRAL_BONUS': return <Gift size={14} />;
      default: return <Coins size={14} />;
    }
  };

  const typeOptions: { value: TxType; label: string; icon: any }[] = [
    { value: 'ALL', label: 'All Operations', icon: <Coins size={12} /> },
    { value: 'DEPOSIT', label: 'USDT Deposits', icon: <ArrowUpRight size={12} /> },
    { value: 'WITHDRAWAL', label: 'INR Payouts', icon: <Banknote size={12} /> },
    { value: 'CONVERSION', label: 'Swaps', icon: <ArrowRightLeft size={12} /> },
    { value: 'COMMISSION', label: 'Commissions', icon: <Percent size={12} /> },
    { value: 'REFERRAL_BONUS', label: 'Bonuses', icon: <Gift size={12} /> },
  ];

  const statusOptions: StatusType[] = ['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REJECTED'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Platform Asset Ledger</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">Monitoring global capital movement</p>
            </div>
            <button onClick={fetchTxs} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-xl transition-all">
              <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by TX ID or Remark..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                typeFilter === opt.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">State:</span>
           <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-50 overflow-x-auto no-scrollbar">
            {statusOptions.map(option => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={`whitespace-nowrap px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  statusFilter === option ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-blue-600"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center space-y-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-200">
                      <Search size={32} />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No matches found for this view</p>
                  </td>
                </tr>
              ) : filteredTxs.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'DEPOSIT' ? 'bg-green-600 text-white' : 
                        tx.type === 'WITHDRAWAL' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">{tx.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-gray-700">{typeof tx.user === 'string' ? tx.user : tx.user?.name || 'Unknown'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className={`text-sm font-black ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-blue-600'}`}>
                      {tx.amount.toLocaleString()} <span className="text-[10px] opacity-70">{tx.currency}</span>
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(tx.status)}</td>
                  <td className="py-4 px-6 text-right">
                    {(tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL') && tx.status === 'PENDING' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleAction(tx.id, 'approve', tx.type)} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase hover:bg-black transition-all">Approve</button>
                        <button onClick={() => handleAction(tx.id, 'reject', tx.type)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase hover:bg-red-100 transition-all border border-red-100">Reject</button>
                      </div>
                    ) : <span className="text-[9px] font-black text-gray-300 uppercase bg-gray-50 px-2 py-1 rounded-md">Locked</span>}
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

export default AdminTransactionManager;
