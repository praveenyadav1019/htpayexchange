
import React, { useState, useEffect } from 'react';
import { AppTab, User as UserType } from './types';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import WithdrawalsView from './components/WithdrawalsView';
import AccountsView from './components/AccountsView';
import StatementView from './components/StatementView';
import StatisticsView from './components/StatisticsView';
import EarnMoneyView from './components/EarnMoneyView';
import SwapView from './components/SwapView';
import AdminDashboard from './components/AdminDashboard';
import AdminUserList from './components/AdminUserList';
import AdminTransactionManager from './components/AdminTransactionManager';
import AdminTransactionHistory from './components/AdminTransactionHistory';
import AdminLogView from './components/AdminLogView';
import { api } from './services/api';
import { Loader2, ShieldCheck, User, Save, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'USER' | 'ADMIN'>(
    window.location.pathname.includes('/admin') ? 'ADMIN' : 'USER'
  );
  
  const [user, setUser] = useState<UserType | null>(null);
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateSaving, setRateSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(
    window.location.pathname.includes('/admin') ? AppTab.ADMIN_DASHBOARD : AppTab.DASHBOARD
  );

  const [rates, setRates] = useState({ buyRate: 98.37, sellRate: 100.00 });

  useEffect(() => {
    initializeSession();
    const handlePopState = () => {
      const isNowAdmin = window.location.pathname.includes('/admin');
      setAppMode(isNowAdmin ? 'ADMIN' : 'USER');
      setActiveTab(isNowAdmin ? AppTab.ADMIN_DASHBOARD : AppTab.DASHBOARD);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const initializeSession = async (targetMode?: 'USER' | 'ADMIN') => {
    setLoading(true);
    const mode = targetMode || appMode;
    
    try {
      if (mode === 'ADMIN') {
        const token = localStorage.getItem('admin_auth_token');
        if (token) {
          const res = await api.admin.get('/me');
          if (res && res.user) {
            setAdmin(res.user);
            const currentRates = await api.admin.get('/rates');
            if (currentRates) setRates(currentRates);
          } else {
            localStorage.removeItem('admin_auth_token');
            setAdmin(null);
          }
        } else {
          setAdmin(null);
        }
      } else {
        const token = localStorage.getItem('user_auth_token');
        if (token) {
          const res = await api.user.get('/me');
          if (res && res.user && res.balances) {
            setUser({
              ...res.user,
              trustBalance: res.balances.trust || 0,
              incomeBalance: res.balances.income || 0,
              usdtRate: rates.buyRate
            });
          } else {
            localStorage.removeItem('user_auth_token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('[SESSION] Authentication failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRates = async () => {
    setRateSaving(true);
    try {
      await api.admin.post('/rates', rates);
      alert('System liquidity rates committed successfully.');
    } catch (err) {
      alert('Commitment failed. Unauthorized execution.');
    } finally {
      setRateSaving(false);
    }
  };

  const handleUserLogin = (data: { token: string; user: any }) => {
    localStorage.setItem('user_auth_token', data.token);
    initializeSession('USER');
  };

  const handleAdminLogin = (data: { token: string; user: any }) => {
    localStorage.setItem('admin_auth_token', data.token);
    initializeSession('ADMIN');
  };

  /**
   * Refined Logout Function
   * Purges tokens, resets local state, and re-routes to login entry points.
   */
  const handleLogout = () => {
    if (appMode === 'ADMIN') {
      console.log('[LOGOUT] Disconnecting Admin Node...');
      localStorage.removeItem('admin_auth_token');
      setAdmin(null);
      // Clean up high-privilege context
      setActiveTab(AppTab.ADMIN_DASHBOARD);
      window.history.pushState({}, '', '/admin/login');
    } else {
      console.log('[LOGOUT] Terminating Client Session...');
      localStorage.removeItem('user_auth_token');
      setUser(null);
      // Reset to standard entry
      setActiveTab(AppTab.DASHBOARD);
      window.history.pushState({}, '', '/login');
    }
    // Final check to ensure UI reflects the empty state immediately
    setLoading(false);
  };

  const toggleAppMode = () => {
    const nextMode = appMode === 'USER' ? 'ADMIN' : 'USER';
    setAppMode(nextMode);
    const nextPath = nextMode === 'ADMIN' ? '/admin/login' : '/login';
    window.history.pushState({}, '', nextPath);
    setActiveTab(nextMode === 'ADMIN' ? AppTab.ADMIN_DASHBOARD : AppTab.DASHBOARD);
    initializeSession(nextMode);
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${appMode === 'ADMIN' ? 'bg-slate-950' : 'bg-white'}`}>
      <div className="flex flex-col items-center space-y-6">
        <Loader2 className={`animate-spin ${appMode === 'ADMIN' ? 'text-red-500' : 'text-blue-600'}`} size={48} />
        <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${appMode === 'ADMIN' ? 'text-slate-600' : 'text-slate-400'}`}>
          Initializing Secured Environment...
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {/* Role Switcher - Dedicated Aesthetic */}
      <div className="fixed bottom-6 right-6 z-[999]">
        <button 
          onClick={toggleAppMode}
          className={`flex items-center space-x-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-3xl shadow-2xl transition-all border active:scale-95 ${
            appMode === 'USER' 
            ? 'bg-slate-900 text-white border-white/10 hover:bg-black' 
            : 'bg-white text-slate-900 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {appMode === 'USER' ? <ShieldCheck size={16} className="text-red-500" /> : <User size={16} className="text-blue-600" />}
          <span>Switch to {appMode === 'USER' ? 'Admin Node' : 'Client Terminal'}</span>
        </button>
      </div>

      {appMode === 'ADMIN' ? (
        !admin ? (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        ) : (
          <Layout user={{ ...admin, trustBalance: 0, incomeBalance: 0, usdtRate: 0, role: 'admin' }} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
            {activeTab === AppTab.ADMIN_DASHBOARD && <AdminDashboard />}
            {activeTab === AppTab.ADMIN_USERS && <AdminUserList />}
            {activeTab === AppTab.ADMIN_ALL_TRANSACTIONS && <AdminTransactionHistory />}
            {activeTab === AppTab.ADMIN_DEPOSITS && <AdminTransactionManager type="DEPOSIT" />}
            {activeTab === AppTab.ADMIN_WITHDRAWALS && <AdminTransactionManager type="WITHDRAWAL" />}
            {activeTab === AppTab.ADMIN_LOGS && <AdminLogView />}
            {activeTab === AppTab.ADMIN_RATES && (
               <div className="bg-slate-800/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl animate-in zoom-in duration-300">
                 <div className="flex items-center space-x-4 mb-10">
                    <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg">
                       <Settings size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">System Liquidity Configuration</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Market Parameter Settlement</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">USDT Purchase Rate (Buy-In)</label>
                      <div className="flex items-center bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 focus-within:border-red-500 transition-all">
                        <input type="number" value={rates.buyRate} onChange={(e) => setRates({ ...rates, buyRate: parseFloat(e.target.value) })} className="w-full bg-transparent text-white font-black text-2xl outline-none" />
                        <span className="text-xs font-black text-slate-600 ml-4">INR</span>
                      </div>
                    </div>
                    <div className="space-y-3 p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">USDT Liquidity Release (Sell-Out)</label>
                      <div className="flex items-center bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 focus-within:border-red-500 transition-all">
                        <input type="number" value={rates.sellRate} onChange={(e) => setRates({ ...rates, sellRate: parseFloat(e.target.value) })} className="w-full bg-transparent text-white font-black text-2xl outline-none" />
                        <span className="text-xs font-black text-slate-600 ml-4">INR</span>
                      </div>
                    </div>
                 </div>

                 <div className="mt-10 flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest max-w-md">
                      Warning: These rates globally impact all pending settlements. Confirm market stability before commitment.
                    </p>
                    <button 
                      onClick={updateRates} 
                      disabled={rateSaving} 
                      className="px-10 py-5 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 flex items-center space-x-3 disabled:opacity-50"
                    >
                      {rateSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      <span>Apply Global Parameters</span>
                    </button>
                 </div>
               </div>
            )}
          </Layout>
        )
      ) : (
        !user ? <Login onLoginSuccess={handleUserLogin} /> : (
          <Layout user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
            {activeTab === AppTab.DASHBOARD && <DashboardView user={user} onRefresh={() => initializeSession('USER')} onTabChange={setActiveTab} />}
            {activeTab === AppTab.SWAP && <SwapView />}
            {activeTab === AppTab.TRANSACTIONS && <TransactionsView />}
            {activeTab === AppTab.WITHDRAWALS && <WithdrawalsView user={user} />}
            {activeTab === AppTab.ACCOUNTS && <AccountsView />}
            {activeTab === AppTab.STATEMENT && <StatementView initialSection="Trust" />}
            {activeTab === AppTab.INCOME_BALANCE && <StatementView initialSection="Income" />}
            {activeTab === AppTab.STATISTICS && <StatisticsView />}
            {activeTab === AppTab.EARN_MONEY && <EarnMoneyView />}
          </Layout>
        )
      )}
    </div>
  );
};

export default App;
