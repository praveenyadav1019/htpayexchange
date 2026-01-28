
import React, { useState, useEffect } from 'react';
import { X, Loader2, Wallet, ChevronDown, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: (refreshed?: boolean) => void;
  availableBalance: number;
}

const WITHDRAW_LIMIT = 50000;

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, availableBalance }) => {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [amount, setAmount] = useState('1000');
  const [understand, setUnderstand] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAccounts = async () => {
        setFetchingAccounts(true);
        try {
          const data = await api.user.get('/accounts');
          const active = data.filter((a: any) => a.status === 'active');
          setAccounts(active);
          if (active.length > 0) setSelectedAccountId(active[0].id);
        } catch (err) {
          console.error(err);
        } finally {
          setFetchingAccounts(false);
        }
      };
      fetchAccounts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const isOverLimit = numAmount > WITHDRAW_LIMIT;
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const handleWithdraw = async () => {
    if (!understand || !selectedAccountId || numAmount <= 0 || isOverLimit) return;
    setLoading(true);
    try {
      await api.user.post('/transactions/withdraw', { 
        accountId: selectedAccountId, 
        amount: numAmount
      });
      onClose(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">Authorize Payout</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Encrypted Settlement Node</p>
          </div>
          <button onClick={() => onClose()} className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-white transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Cleared Liquidity</p>
                <p className="text-3xl font-black">{availableBalance.toLocaleString()} <span className="text-sm font-medium opacity-60">INR</span></p>
              </div>
              <ShieldCheck size={40} className="opacity-20" />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Destination Profile</label>
            <div 
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-white transition-all group"
            >
              {fetchingAccounts ? <Loader2 size={16} className="animate-spin text-blue-600" /> : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Wallet size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900">{selectedAccount?.accountName || 'Select Profile'}</p>
                       <p className="text-[10px] text-gray-400 uppercase font-black">{selectedAccount?.systemName} • {selectedAccount?.accountNumber?.slice(-4) || 'UPI'}</p>
                    </div>
                  </div>
                  <ChevronDown size={20} className="text-gray-300" />
                </>
              )}
            </div>

            {showAccountDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[110] animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                {accounts.length === 0 ? (
                   <div className="px-6 py-8 text-center space-y-2">
                     <AlertTriangle className="mx-auto text-amber-400" size={24} />
                     <p className="text-[10px] text-gray-400 font-black uppercase">No verified bank profiles</p>
                   </div>
                ) : accounts.map(acc => (
                  <button 
                    key={acc.id}
                    onClick={() => { setSelectedAccountId(acc.id); setShowAccountDropdown(false); }}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 flex items-center justify-between ${selectedAccountId === acc.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{acc.accountName}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{acc.systemName}</p>
                    </div>
                    {selectedAccountId === acc.id && <Check size={16} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Withdrawal Quantum</label>
            <div className={`p-5 rounded-3xl border transition-all flex items-center ${isOverLimit ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10'}`}>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-gray-900 font-black text-3xl"
              />
              <span className="text-xs font-black text-gray-400 ml-4">INR</span>
            </div>
            {isOverLimit && (
              <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-2 flex items-center space-x-1">
                <AlertTriangle size={10} />
                <span>Exceeds single transaction cap ({WITHDRAW_LIMIT.toLocaleString()} INR)</span>
              </p>
            )}
          </div>

          <div className="p-5 bg-slate-900 rounded-3xl space-y-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
                Funds will be settled within <span className="text-white">48 hours</span>. Ensure the destination account is active to avoid rejection fees.
              </p>
            </div>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer group px-1">
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${understand ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 group-hover:border-blue-400'}`}>
               {understand && <Check size={14} className="text-white" />}
            </div>
            <input 
              type="checkbox" 
              checked={understand}
              onChange={(e) => setUnderstand(e.target.checked)}
              className="hidden"
            />
            <span className="text-xs text-gray-500 font-bold uppercase tracking-tight group-hover:text-gray-900">I confirm the payout profile is valid</span>
          </label>

          <button 
            onClick={handleWithdraw}
            disabled={!understand || !selectedAccountId || numAmount <= 0 || isOverLimit || loading}
            className={`w-full py-5 font-black uppercase tracking-[0.2em] text-xs rounded-3xl transition-all flex items-center justify-center space-x-2 ${
              understand && selectedAccountId && numAmount > 0 && !isOverLimit && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-200' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Execute Settlement</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
