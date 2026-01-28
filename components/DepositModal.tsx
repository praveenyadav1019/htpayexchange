
import React, { useState } from 'react';
import { X, Copy, Check, Info, Loader2, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTrustBalance: number;
  tronAddress?: string;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, userTrustBalance, tronAddress }) => {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  
  if (!isOpen) return null;

  const displayAddress = tronAddress || "Initializing Node...";

  const handleCopy = () => {
    if (!tronAddress) return;
    navigator.clipboard.writeText(tronAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      // In production, this calls the /sync-deposits endpoint
      const res = await api.user.post('/sync-deposits', {});
      if (res.credited > 0) {
        setSyncMessage(`SUCCESS: Detected +${res.credited} USDT`);
      } else {
        setSyncMessage('NO PENDING ASSETS FOUND');
      }
    } catch (err) {
      setSyncMessage('NETWORK HANDSHAKE TIMED OUT');
    } finally {
      setTimeout(() => {
        setSyncing(false);
        if (syncMessage.includes('SUCCESS')) onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Refill USDT</h2>
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-0.5">TRC20 Mainnet Bridge Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-all border border-transparent">
            <X size={28} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck size={14} className="text-blue-400" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Personal Vault Node</p>
                  </div>
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                
                <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 flex items-center justify-between group-hover:border-white/30 transition-all">
                  <p className="text-base font-mono font-bold break-all leading-relaxed mr-6 text-slate-200">
                    {displayAddress}
                  </p>
                  <button onClick={handleCopy} disabled={!tronAddress} className={`p-4 rounded-xl transition-all shadow-lg flex-shrink-0 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>

                <button 
                  onClick={handleSync}
                  disabled={syncing || !tronAddress}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest text-blue-400 disabled:opacity-50"
                >
                  {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                  <span>{syncMessage || 'Scan Network for Incoming Assets'}</span>
                </button>
              </div>
              <div className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                 <Zap size={240} fill="currentColor" />
              </div>
            </div>

            <div className="flex flex-col items-center space-y-8">
              <div className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm relative group">
                {!tronAddress ? (
                  <div className="w-56 h-56 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bridging Mainnet...</p>
                  </div>
                ) : (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${tronAddress}`} alt="QR" className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl" />
                )}
              </div>

              <div className="text-center max-w-sm">
                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                  Funds deposited here are atomically settled into your <span className="text-blue-600 font-black">Cleared Income Pool</span>. 
                  Minimum threshold: <span className="text-slate-900 font-black">1.00 USDT</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-amber-50 border-t border-amber-100 flex items-start space-x-4 sticky bottom-0">
           <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
           <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase tracking-tight">
             Warning: Sending assets via non-TRC20 networks (ERC20/BEP20/POLYGON) will result in irreversible data loss and capital forfeiture.
           </p>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
