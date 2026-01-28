
import React, { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
import { Filter, Calendar, ChevronDown, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface StatementViewProps {
  initialSection?: 'Trust' | 'Income';
}

const StatementView: React.FC<StatementViewProps> = ({ initialSection = 'Trust' }) => {
  const [activeSection, setActiveSection] = useState<'Trust' | 'Income'>(initialSection);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const fetchTxs = async () => {
      setLoading(true);
      try {
        const data = await api.user.get('/transactions');
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, [activeSection]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="flex space-x-8 px-8 pt-6 border-b border-gray-50">
        <button 
          onClick={() => setActiveSection('Trust')}
          className={`pb-4 text-base font-bold transition-all relative ${activeSection === 'Trust' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Trust history
          {activeSection === 'Trust' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveSection('Income')}
          className={`pb-4 text-base font-bold transition-all relative ${activeSection === 'Income' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Income balance
          {activeSection === 'Income' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full"></div>}
        </button>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Transaction ID</label>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                <input 
                  type="text" 
                  placeholder="TX-000000" 
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 font-bold"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Period</label>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-400 font-bold">Select Date</span>
                <Calendar size={16} className="text-gray-300" />
              </div>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-6 py-4 hover:bg-black rounded-2xl transition-all shadow-xl shadow-slate-100">
            <Download size={16} />
            <span>Export Statement</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="py-24"><EmptyState /></td></tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 text-xs font-mono font-bold text-gray-400">{tx.id}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{tx.type}</td>
                    <td className="py-4 px-6 text-sm font-black text-gray-900">{tx.amount.toLocaleString()} <span className="text-[10px] opacity-40">{tx.currency}</span></td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-bold uppercase">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                       <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                         tx.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                         {tx.status}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatementView;
