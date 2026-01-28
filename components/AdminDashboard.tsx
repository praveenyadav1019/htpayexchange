
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Users, ArrowUpCircle, ArrowDownCircle, Wallet, Activity, Zap, Server, ShieldCheck } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.admin.get('/stats');
        setStats(data);
      } catch (err) {
        console.error('Stats Load Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-red-500" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decrypting Management Stats...</p>
    </div>
  );

  if (!stats) return (
    <div className="p-12 text-center bg-slate-800/50 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <Activity className="mx-auto text-red-400 mb-4" size={48} />
      <h3 className="text-lg font-bold text-white">Telemetry Link Failure</h3>
      <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Encrypted node handshake timed out</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users size={20} />} 
          label="Global Client Base" 
          value={stats.totalUsers || 0} 
          color="slate" 
          trend="+2 Authorized"
        />
        <StatCard 
          icon={<Zap size={20} />} 
          label="Pending Liquidity" 
          value={stats.pendingDeposits || 0} 
          color="red" 
          subValue="USDT Deposits"
        />
        <StatCard 
          icon={<Server size={20} />} 
          label="Pending Payouts" 
          value={stats.pendingWithdrawals || 0} 
          color="amber" 
          subValue="INR Withdrawals"
        />
        <StatCard 
          icon={<ShieldCheck size={20} />} 
          label="System Liquidity" 
          value={`${(stats.totalPlatformUsdt || 0).toLocaleString()} USDT`} 
          color="green" 
          subValue={`${(stats.totalPlatformInr || 0).toLocaleString()} INR`}
        />
      </div>

      <div className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none"></div>
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Operation Telemetry</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Mainnet Bridge Activity</p>
          </div>
          <Activity className="text-red-500 animate-pulse" size={32} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <TelemetryNode label="CPU Load" value="12%" status="Optimal" />
          <TelemetryNode label="DB Latency" value="18ms" status="Fast" />
          <TelemetryNode label="SSL Status" value="Valid" status="Secure" />
        </div>

        <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">A{i}</div>)}
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3 Admins Currently Logged In</p>
           </div>
           <button className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">Emergency Node Lockout</button>
        </div>
      </div>
    </div>
  );
};

const TelemetryNode = ({ label, value, status }: any) => (
  <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 group hover:border-red-500/20 transition-all">
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-2xl font-black text-white">{value}</p>
    <div className="flex items-center space-x-1.5 mt-2">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{status}</span>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color, subValue, trend }: any) => {
  const colors: any = {
    slate: 'bg-slate-800 text-white border-white/5',
    red: 'bg-red-600 text-white border-red-500 shadow-red-900/20',
    amber: 'bg-amber-500 text-white border-amber-400 shadow-amber-900/10',
    green: 'bg-slate-800 text-white border-white/5',
  };

  return (
    <div className={`p-6 rounded-[2rem] border shadow-xl ${colors[color] || colors.slate} space-y-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${color === 'red' || color === 'amber' ? 'bg-white/10' : 'bg-red-600/10 text-red-500'}`}>
          {icon}
        </div>
        {trend && <span className="text-[9px] font-black uppercase bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm tracking-widest">{trend}</span>}
      </div>
      <div>
        <p className={`text-[9px] font-black uppercase tracking-widest ${color === 'red' || color === 'amber' ? 'text-white/60' : 'text-slate-500'}`}>
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight mt-1">{value}</p>
        {subValue && <p className={`text-[10px] font-bold mt-1 ${color === 'red' || color === 'amber' ? 'text-white/40' : 'text-slate-400'}`}>{subValue}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
