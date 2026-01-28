
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Loader2, 
  ClipboardList, 
  Clock, 
  Shield, 
  Search, 
  Terminal, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  X, 
  ChevronRight,
  Database,
  Code
} from 'lucide-react';

const AdminLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.admin.get('/logs');
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Audit Log Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.admin?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.admin?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const act = action || 'UNKNOWN';
    const baseStyle = "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center space-x-1.5";
    
    if (act.includes('REJECT') || act.includes('FREEZE')) {
      return (
        <span className={`${baseStyle} text-red-600 bg-red-50 border-red-100`}>
          <AlertTriangle size={10} />
          <span>{act.replace('_', ' ')}</span>
        </span>
      );
    }
    
    if (act.includes('APPROVE') || act.includes('UNFREEZE')) {
      return (
        <span className={`${baseStyle} text-green-600 bg-green-50 border-green-100`}>
          <ShieldCheck size={10} />
          <span>{act.replace('_', ' ')}</span>
        </span>
      );
    }
    
    return (
      <span className={`${baseStyle} text-blue-600 bg-blue-50 border-blue-100`}>
        <Terminal size={10} />
        <span>{act.replace('_', ' ')}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
            <ClipboardList size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Platform Audit Trail</h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">Immutable log of administrative command executions</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-slate-500/10 focus:border-slate-300 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrator</th>
                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Command</th>
                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</th>
                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details Snippet</th>
                <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center space-y-3 opacity-30">
                    <ClipboardList size={48} />
                    <p className="text-xs font-black uppercase tracking-widest">Log database empty</p>
                  </div>
                </td></tr>
              ) : filteredLogs.map(log => (
                <tr key={log._id || Math.random()} className="hover:bg-gray-50/50 transition-all group">
                  <td className="py-5 px-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                        {(log.admin?.name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{log.admin?.name || 'System'}</p>
                        <p className="text-[10px] text-gray-400">{log.admin?.email || 'root@htpay.io'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.targetType || 'Object'}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <div className="text-[10px] text-gray-400 font-mono max-w-[150px] truncate">
                      {log.details ? JSON.stringify(log.details) : 'No extra data'}
                    </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-gray-100"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                  <Code size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Log Inspection</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLog.action}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Initiator</p>
                  <p className="text-sm font-bold text-gray-900">{selectedLog.admin?.name || 'System Root'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Execution Date</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Raw Payload</label>
                <div className="bg-slate-900 text-blue-400 p-6 rounded-3xl overflow-x-auto text-xs font-mono leading-relaxed ring-1 ring-white/10">
                  <pre>{JSON.stringify(selectedLog.details || {}, null, 2)}</pre>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-end">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogView;
