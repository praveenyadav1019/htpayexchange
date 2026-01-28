
import React, { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
import { Calendar, Download, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, Loader2, IndianRupee } from 'lucide-react';
import { api } from '../services/api';

const StatisticsView: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
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
  }, []);

  const totalDeposits = transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0);
  const totalConversions = transactions.filter(t => t.type === 'CONVERSION').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Analytics Terminal</h2>
        <div className="flex items-center bg-white px-4 py-3 rounded-2xl border border-gray-100 text-xs font-bold text-gray-500 space-x-3 shadow-sm">
          <Calendar size={14} />
          <span className="uppercase tracking-widest">Real-time Stream • Today</span>
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-blue-50/50">
                <IndianRupee size={120} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight relative z-10">Liquidity Summary</h3>
              <div className="space-y-6 relative z-10">
                <StatRow label="Gross refills" value={`${totalDeposits.toLocaleString()} USDT`} />
                <StatRow label="Account settlements" value={`${totalWithdrawals.toLocaleString()} INR`} />
                <StatRow label="Swap volume" value={`${totalConversions.toLocaleString()} INR`} />
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-8 text-white relative overflow-hidden">
              <h3 className="text-xl font-bold uppercase tracking-tight">Yield & Growth</h3>
              <div className="space-y-6">
                <StatRow label="Income commission" value="0.5% (AVG)" dark />
                <StatRow label="Referral turnover" value="0 INR" dark />
                <StatRow label="Bonus accruals" value="0 INR" dark />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Operational Log</h3>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Asset</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">System Path</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</th>
                      <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trust Impact</th>
                      <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.length === 0 ? (
                      <tr><td colSpan={5} className="py-24"><EmptyState /></td></tr>
                    ) : (
                      transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-gray-50/30 transition-all">
                          <td className="py-5 px-6 font-mono text-xs font-bold text-gray-400">#{tx.id.slice(-6)}</td>
                          <td className="py-5 px-6 text-sm font-bold text-gray-900">{tx.type}</td>
                          <td className="py-5 px-6 text-sm font-black text-gray-900">{tx.amount.toLocaleString()}</td>
                          <td className="py-5 px-6 text-xs font-bold text-gray-500">{tx.status === 'COMPLETED' ? 'Impact Executed' : 'Awaiting Settlement'}</td>
                          <td className="py-5 px-6 text-right">
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border tracking-widest ${
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
        </>
      )}
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string; dark?: boolean }> = ({ label, value, dark }) => (
  <div className="flex justify-between items-center group">
    <span className={`text-sm font-bold uppercase tracking-tight ${dark ? 'text-slate-400' : 'text-gray-400'}`}>{label}</span>
    <span className={`text-lg font-black ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
  </div>
);

export default StatisticsView;
