
import React, { useState } from 'react';
import { ShieldAlert, Loader2, Lock, Info } from 'lucide-react';
import { api } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: (data: any) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Small artificial delay to mimic network latency in simulation
      const data = await api.admin.post('/login', { email, password });
      console.log('[UI] Admin Login Successful, triggering success callback');
      onLoginSuccess(data);
    } catch (err: any) {
      console.error('[UI] Admin Login Error:', err.message);
      setError(err.message || 'Access Denied: Invalid Administrative Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-6 font-sans">
      <div className="w-full max-w-md bg-[#1e293b] rounded-[2rem] p-10 shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20">
            <ShieldAlert size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Admin Terminal</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Authorized Personnel Access Only</p>
          </div>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="admin@htpay.io"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Access Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Execute Secure Login</span>}
          </button>
        </form>
        
        <div className="mt-8 p-4 bg-slate-800/40 rounded-xl border border-white/5 flex items-start space-x-3">
          <Info size={14} className="text-slate-500 mt-0.5" />
          <div className="space-y-1">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Credentials:</p>
             <p className="text-[10px] text-slate-500 font-mono">admin@htpay.io / admin123</p>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
        Encrypted Session • HTPAY Management v4.2
      </p>
    </div>
  );
};

export default AdminLogin;
