
import React, { useState } from 'react';
import { 
  Bell, 
  LayoutDashboard, 
  ArrowRightLeft, 
  Download, 
  Wallet, 
  FileText,
  LogOut,
  Shield,
  BarChart3,
  Users,
  Settings,
  ShieldAlert,
  ChevronRight,
  History,
  ClipboardList,
  RefreshCw,
  Cpu,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { AppTab, User } from '../types';
import Logo from './Logo';

interface LayoutProps {
  user: User;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, activeTab, onTabChange, onLogout, children }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user.role === 'admin';

  const userMenuItems = [
    { id: AppTab.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: AppTab.SWAP, label: 'Swap Exchange', icon: <RefreshCw size={18} /> },
    { id: AppTab.TRANSACTIONS, label: 'History', icon: <ArrowRightLeft size={18} /> },
    { id: AppTab.WITHDRAWALS, label: 'Withdrawals', icon: <Download size={18} /> },
    { id: AppTab.ACCOUNTS, label: 'Bank Accounts', icon: <Wallet size={18} /> },
    { id: AppTab.STATEMENT, label: 'Statement', icon: <FileText size={18} /> },
    { id: AppTab.STATISTICS, label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  const adminMenuItems = [
    { id: AppTab.ADMIN_DASHBOARD, label: 'Control Center', icon: <ShieldAlert size={18} /> },
    { id: AppTab.ADMIN_USERS, label: 'Client Base', icon: <Users size={18} /> },
    { id: AppTab.ADMIN_ALL_TRANSACTIONS, label: 'Global History', icon: <History size={18} /> },
    { id: AppTab.ADMIN_DEPOSITS, label: 'Approval (USDT)', icon: <ArrowRightLeft size={18} /> },
    { id: AppTab.ADMIN_WITHDRAWALS, label: 'Payouts (INR)', icon: <Download size={18} /> },
    { id: AppTab.ADMIN_LOGS, label: 'Audit Logs', icon: <ClipboardList size={18} /> },
    { id: AppTab.ADMIN_RATES, label: 'System Rates', icon: <Settings size={18} /> },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const getTabTitle = () => {
    const item = [...userMenuItems, ...adminMenuItems].find(item => item.id === activeTab);
    return item?.label || 'Overview';
  };

  return (
    <div className={`min-h-screen flex ${isAdmin ? 'bg-slate-900' : 'bg-[#f9fafb]'}`}>
      {/* Sidebar - Visual Distinction Logic */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 border-r hidden md:flex flex-col z-50 transition-all duration-300 ${
        isAdmin 
        ? 'bg-slate-950 border-white/5 text-slate-400' 
        : 'bg-white border-gray-100 text-gray-500'
      }`}>
        <div className="p-8">
          <Logo className="h-10" color={isAdmin ? 'white' : 'dark'} />
          {isAdmin && (
            <div className="mt-4 flex items-center space-x-2 px-3 py-1.5 bg-red-600/10 text-red-500 rounded-lg border border-red-500/20">
              <Shield size={10} fill="currentColor" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Management Node</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 mt-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id 
                ? (isAdmin ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-blue-600 text-white shadow-xl shadow-blue-100')
                : (isAdmin ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-gray-50 hover:text-gray-900')
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={activeTab === item.id ? 'text-inherit' : 'opacity-50 group-hover:opacity-100'}>
                  {item.icon}
                </span>
                <span className={`text-sm font-bold tracking-tight ${isAdmin ? 'uppercase text-[11px] tracking-wider' : ''}`}>
                  {item.label}
                </span>
              </div>
              {activeTab === item.id && <ChevronRight size={14} className="opacity-50" />}
            </button>
          ))}
        </nav>

        <div className={`p-6 border-t mt-auto ${isAdmin ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50/50'}`}>
          {!isAdmin ? (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Trust Balance</p>
                <p className="text-lg font-black text-gray-900">{user.trustBalance.toLocaleString()} <span className="text-xs font-medium opacity-50">INR</span></p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span>System Pulse</span>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <Cpu size={12} />
                  <span className="text-[10px] font-bold">Encrypted Link</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 truncate">Sess_7x92_Auth_OK</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`md:ml-64 flex flex-col flex-1 min-h-screen transition-colors duration-300 ${
        isAdmin ? 'bg-slate-900' : 'bg-[#f9fafb]'
      }`}>
        <header className={`h-20 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between border-b ${
          isAdmin 
          ? 'bg-slate-900/80 border-white/5' 
          : 'bg-white/80 border-gray-50'
        }`}>
          <div className="flex items-center space-x-4">
             <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl border ${isAdmin ? 'bg-slate-800 border-white/10 text-white' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
             >
               {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
             <div>
               <h1 className={`text-xl font-black tracking-tight uppercase ${isAdmin ? 'text-white' : 'text-[#1e293b]'}`}>
                 {getTabTitle()}
               </h1>
               {isAdmin && <div className="text-[9px] font-black text-red-500 uppercase tracking-widest -mt-1">Superuser Privilege</div>}
             </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className={`p-2.5 rounded-xl transition-all relative border ${
              isAdmin 
              ? 'text-slate-400 bg-slate-800 border-white/10 hover:bg-slate-700' 
              : 'text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-100'
            }`}>
              <Bell size={20} />
              <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 ${isAdmin ? 'bg-red-500 border-slate-800' : 'bg-red-500 border-white'}`}></span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border font-black transition-all ${
                  isAdmin 
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20' 
                  : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                  <div className={`absolute right-0 mt-3 w-72 rounded-3xl shadow-2xl border py-6 z-50 animate-in fade-in zoom-in duration-200 ${
                    isAdmin 
                    ? 'bg-slate-800 border-white/10 text-white' 
                    : 'bg-white border-gray-100 text-gray-900'
                  }`}>
                    <div className="px-8 mb-6">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isAdmin ? 'text-slate-500' : 'text-gray-400'}`}>Account Identity</p>
                      <p className="font-black text-lg leading-tight">{user.name}</p>
                      <p className={`text-sm font-medium ${isAdmin ? 'text-slate-400' : 'text-gray-500'}`}>{user.email}</p>
                    </div>
                    
                    <div className="px-4 space-y-1">
                      <button 
                        onClick={onLogout}
                        className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-bold transition-all text-left ${
                          isAdmin 
                          ? 'text-red-400 hover:bg-red-500/10' 
                          : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <LogOut size={20} />
                        <span className="text-sm">Disconnect Session</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className={`flex-1 p-8 rounded-tl-[3rem] ${isAdmin ? 'bg-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' : 'bg-[#f9fafb]'}`}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in">
           <div className={`w-64 h-full flex flex-col p-6 animate-in slide-in-from-left ${isAdmin ? 'bg-slate-950' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-10">
                 <Logo className="h-8" color={isAdmin ? 'white' : 'dark'} />
                 <button onClick={() => setMobileMenuOpen(false)} className={isAdmin ? 'text-white' : 'text-gray-900'}>
                    <X size={24} />
                 </button>
              </div>
              <nav className="flex-1 space-y-2">
                 {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-bold ${
                        activeTab === item.id 
                        ? (isAdmin ? 'bg-red-600 text-white' : 'bg-blue-600 text-white')
                        : (isAdmin ? 'text-slate-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100')
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </button>
                 ))}
              </nav>
              <button 
                onClick={onLogout}
                className="mt-auto flex items-center space-x-3 px-4 py-4 text-red-500 font-bold border-t border-gray-100"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
