
import React, { useState, useEffect } from 'react';
import { User, AppTab } from '../types';
import EmptyState from './EmptyState';
import { Info, Plus, ChevronDown, Loader2, Calendar, BarChart3, ArrowRightLeft } from 'lucide-react';
import { api } from '../services/api';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

interface DashboardViewProps {
  user: User & { tronAddress?: string };
  onRefresh: () => void;
  onTabChange: (tab: AppTab) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, onRefresh, onTabChange }) => {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTxs = async () => {
      try {
        const data = await api.user.get('/transactions');
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTxs();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Balance Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Plus size={20} />
              </div>
              <div>
                <button 
                  onClick={() => onTabChange(AppTab.STATEMENT)}
                  className="text-blue-600 font-bold hover:underline text-left"
                >
                  Trust balance
                </button>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-[10px] text-gray-400 font-medium">Allowable minimum trust balance</span>
                  <Info size={12} className="text-gray-300" />
                </div>
                <p className="text-xs font-bold text-gray-800">10,000 INR</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end space-x-1">
                <p className="text-4xl font-black text-gray-900 tracking-tight">{user.trustBalance.toLocaleString()}</p>
                <span className="text-xs font-bold text-gray-400">INR</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex space-x-4">
            <button 
              onClick={() => setShowDeposit(true)}
              className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              Deposit
            </button>
            <button 
              onClick={() => setShowWithdraw(true)}
              className="flex-1 py-3.5 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-all active:scale-95"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Income Balance Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <div>
                <button 
                  onClick={() => onTabChange(AppTab.INCOME_BALANCE)}
                  className="text-blue-600 font-bold hover:underline text-left"
                >
                  Income balance
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end space-x-1">
                <p className="text-4xl font-black text-gray-900 tracking-tight">{user.incomeBalance.toLocaleString()}</p>
                <span className="text-xs font-bold text-gray-400">INR</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
             <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deduct from income</span>
                <Info size={14} className="text-gray-300" />
             </div>
             <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle-deduct" className="sr-only peer"/>
                <div className="block bg-gray-300 w-10 h-6 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h3 className="text-xl font-bold text-gray-900">Statistics</h3>
          <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-500 space-x-3 cursor-pointer hover:bg-gray-100 transition-colors">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deposits</h4>
            <div className="space-y-3">
              <StatRow label="Deposit amount" value={`${transactions.filter(t => t.type === 'DEPOSIT').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} INR`} />
              <StatRow label="Withdrawals" value={`${transactions.filter(t => t.type === 'WITHDRAWAL').reduce((acc, t) => acc + t.amount, 0).toLocaleString()} INR`} />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transactions</h4>
            <div className="space-y-3">
              <StatRow label="Total operations" value={transactions.length.toString()} />
              <StatRow label="Last update" value={transactions.length > 0 ? new Date(transactions[0].createdAt).toLocaleTimeString() : 'N/A'} />
            </div>
          </div>
        </div>

        <button 
          onClick={() => onTabChange(AppTab.STATISTICS)}
          className="mt-8 text-blue-600 font-bold text-sm hover:underline flex items-center space-x-1"
        >
          <span>Show details</span>
        </button>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
          <button className="p-2 text-gray-400 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors" onClick={onRefresh}>
             <ArrowRightLeft size={18} />
          </button>
        </div>
        <div className="p-4">
          {loading ? (
             <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {tx.type === 'DEPOSIT' ? <Plus size={18} /> : <ArrowRightLeft size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{tx.amount.toLocaleString()} INR</p>
                    <p className={`text-[10px] font-black uppercase ${tx.status === 'COMPLETED' ? 'text-green-500' : 'text-amber-500'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DepositModal 
        isOpen={showDeposit} 
        onClose={() => setShowDeposit(false)} 
        userTrustBalance={user.trustBalance} 
        tronAddress={user.tronAddress}
      />
      
      <WithdrawModal 
        isOpen={showWithdraw} 
        onClose={(refreshed) => { 
          setShowWithdraw(false); 
          if(refreshed) onRefresh(); 
        }} 
        availableBalance={user.trustBalance} 
      />
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center group">
    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

export default DashboardView;
