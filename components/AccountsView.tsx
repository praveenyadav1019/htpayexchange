
import React, { useState, useEffect } from 'react';
import EmptyState from './EmptyState';
import { Filter, Plus, ChevronDown, ListFilter, Loader2, Edit2, Trash2, MoreVertical } from 'lucide-react';
import AddAccountModal from './AddAccountModal';
import { api } from '../services/api';

const AccountsView: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const data = await api.user.get('/accounts');
      setAccounts(data);
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this account?')) return;
    setDeletingId(id);
    try {
      await api.user.delete(`/accounts/${id}`);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete account');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h3 className="text-xl font-bold text-gray-900">Accounts</h3>
          <div className="flex items-center space-x-3 w-full md:w-auto">
             <button 
              onClick={() => { setEditingAccount(null); setShowAddModal(true); }}
              className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Plus size={18} />
              <span>Add account</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Account number</label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <input type="text" placeholder="Account number" className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Device status</label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">All</span>
                  <ChevronDown size={16} className="text-gray-300" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Account status</label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">All</span>
                  <ChevronDown size={16} className="text-gray-300" />
                </div>
              </div>
            </div>
            <button className="p-3 text-gray-400 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
              <ListFilter size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account ID</th>
                  <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">System</th>
                  <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                  <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Device Status</th>
                  <th className="text-left py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center text-blue-600"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan={5} className="py-20"><EmptyState /></td></tr>
                ) : (
                  accounts.map(acc => (
                    <tr key={acc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                      <td className="py-4 text-sm font-bold text-gray-900">{acc.id}</td>
                      <td className="py-4 text-sm text-gray-600 capitalize">{acc.systemName}</td>
                      <td className="py-4 text-sm text-gray-600">
                        {acc.accountNumber || acc.upiId || acc.bankAccountNumber || 'No details'}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 ${acc.deviceStatus === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'} text-[10px] font-bold rounded-lg uppercase`}>
                          {acc.deviceStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(acc)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(acc.id)}
                            disabled={deletingId === acc.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingId === acc.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddAccountModal 
        isOpen={showAddModal} 
        account={editingAccount}
        onClose={() => { setShowAddModal(false); setEditingAccount(null); fetchAccounts(); }} 
      />
    </div>
  );
};

export default AccountsView;
