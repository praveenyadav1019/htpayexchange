
import React, { useState, useEffect } from 'react';
import { RefreshCw, IndianRupee, Coins, ArrowRight, Loader2, Info } from 'lucide-react';
import { api } from '../services/api';

const SwapView: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<'INR' | 'USDT'>('INR');
  const [toCurrency, setToCurrency] = useState<'INR' | 'USDT'>('USDT');
  const [fromAmount, setFromAmount] = useState<string>('100');
  const [toAmount, setToAmount] = useState<string>('');
  const [rates, setRates] = useState({ buyRate: 98.37, sellRate: 100.00 });
  const [loading, setLoading] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await api.admin.get('/rates');
        setRates(data);
      } catch (err) {
        console.error('Failed to fetch rates', err);
      } finally {
        setFetchingRates(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const val = parseFloat(fromAmount) || 0;
    if (fromCurrency === 'INR') {
      setToAmount((val / rates.sellRate).toFixed(2));
    } else {
      setToAmount((val * rates.buyRate).toFixed(2));
    }
  }, [fromAmount, fromCurrency, rates]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const handleExecuteSwap = async () => {
    setLoading(true);
    try {
      await api.user.post('/transactions/swap', {
        fromAmount: parseFloat(fromAmount),
        fromCurrency,
        toAmount: parseFloat(toAmount),
        toCurrency
      });
      alert('Swap executed successfully!');
    } catch (err: any) {
      alert(err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRates) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden p-8 md:p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Currency Bridge</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Instant INR/USDT settlement</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <RefreshCw size={24} />
          </div>
        </div>

        <div className="space-y-4 relative">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">You send</label>
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-white rounded-lg border border-gray-100 text-[10px] font-black">
                {fromCurrency === 'INR' ? <IndianRupee size={12} /> : <Coins size={12} />}
                <span>{fromCurrency}</span>
              </div>
            </div>
            <input 
              type="number" 
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="w-full bg-transparent text-3xl font-black text-gray-900 outline-none placeholder:text-gray-300"
              placeholder="0.00"
            />
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
             <button 
              onClick={handleSwapCurrencies}
              className="w-12 h-12 bg-white border-4 border-gray-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <ArrowRight size={20} className="rotate-90 md:rotate-0" />
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">You receive</label>
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-white rounded-lg border border-gray-100 text-[10px] font-black">
                {toCurrency === 'INR' ? <IndianRupee size={12} /> : <Coins size={12} />}
                <span>{toCurrency}</span>
              </div>
            </div>
            <p className="text-3xl font-black text-blue-600">{toAmount || '0.00'}</p>
          </div>
        </div>

        <div className="mt-10 space-y-4">
           <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-700">Applied System Rate</span>
              </div>
              <span className="text-xs font-black text-blue-900">
                1 {fromCurrency} = {fromCurrency === 'INR' ? (1 / rates.sellRate).toFixed(6) : rates.buyRate.toFixed(2)} {toCurrency}
              </span>
           </div>

           <button 
            onClick={handleExecuteSwap}
            disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2"
           >
             {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Confirm Exchange Settlement</span>}
           </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Execution via HTPAY Liquidity Pool HT-01</p>
        </div>
      </div>
    </div>
  );
};

export default SwapView;
