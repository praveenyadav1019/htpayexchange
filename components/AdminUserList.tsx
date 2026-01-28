
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Search, MoreVertical, Shield, ShieldOff, Eye, IndianRupee, Coins, UserCheck, AlertCircle } from 'lucide-react';

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.get('/users');
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    setFilteredUsers(
      users.filter(u => 
        (u.name || '').toLowerCase().includes(s) || 
        (u.email || '').toLowerCase().includes(s) ||
        (u._id || u.id || '').toLowerCase().includes(s)
      )
    );
  }, [search, users]);

  const toggleFreeze = async (userId: string) => {
    try {
      const res = await api.admin.patch(`/users/${userId}/freeze`, {});
      setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? { ...u, isFrozen: res.isFrozen } : u));
    } catch (err) {
      alert('Security action failed. Admin session may be invalid.');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Client Management</h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">Verified user identities and capital tracking</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/30">
              <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Identity</th>
              <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Portfolio</th>
              <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account State</th>
              <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Date</th>
              <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Terminal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="py-24 text-center">
                <div className="flex flex-col items-center space-y-3">
                   <AlertCircle className="text-gray-200" size={48} />
                   <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">No client records found in database</p>
                </div>
              </td></tr>
            ) : filteredUsers.map(user => {
              const uId = user._id || user.id;
              return (
                <tr key={uId} className="hover:bg-gray-50/50 transition-all group">
                  <td className="py-5 px-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-xs font-bold text-gray-900">
                        <IndianRupee size={12} className="text-gray-400" />
                        <span>{user.trustBalance?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                        <Coins size={10} className="text-blue-400" />
                        <span>{user.incomeBalance?.toLocaleString() || 0} USDT</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                      user.isFrozen ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {user.isFrozen ? 'Access Restricted' : 'Active Status'}
                    </span>
                  </td>
                  <td className="py-5 px-8">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                  </td>
                  <td className="py-5 px-8 text-right">
                     <div className="flex items-center justify-end space-x-2">
                       <button className="p-2.5 text-gray-400 hover:text-blue-600 transition-all hover:bg-blue-50 rounded-xl" title="Deep Audit">
                         <Eye size={18} />
                       </button>
                       <button 
                         onClick={() => toggleFreeze(uId)}
                         className={`p-2.5 transition-all rounded-xl ${user.isFrozen ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                         title={user.isFrozen ? 'Authorize Access' : 'Suspend Account'}
                       >
                         {user.isFrozen ? <Shield size={18} /> : <ShieldOff size={18} />}
                       </button>
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserList;
