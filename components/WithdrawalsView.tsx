
import React, { useState } from 'react';
import { User } from '../types';
import EmptyState from './EmptyState';
import { Filter, Info } from 'lucide-react';
import WithdrawModal from './WithdrawModal';

const WithdrawalsView: React.FC<{ user: User }> = ({ user }) => {
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-blue-500 font-semibold mb-1">Trust</h3>
              <p className="text-xs text-gray-400">Allowable minimum trust balance</p>
              <p className="text-sm font-bold text-gray-800">10.000 INR</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{user.trustBalance.toLocaleString()}</p>
              <p className="text-xs font-semibold text-gray-400">INR</p>
            </div>
          </div>
          <button 
            onClick={() => setShowWithdraw(true)}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Withdraw
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-blue-500 font-semibold mb-1">Income</h3>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{user.incomeBalance.toLocaleString()}</p>
              <p className="text-xs font-semibold text-gray-400">INR</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-xl">
             <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Deduct from income</span>
                <Info size={16} className="text-gray-300" />
             </div>
             <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle-withdraw" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                <label htmlFor="toggle-withdraw" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-gray-900">Withdrawals</h3>
          <button className="p-2 text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Filter size={20} />
          </button>
        </div>
        <EmptyState />
      </div>

      <WithdrawModal 
        isOpen={showWithdraw} 
        onClose={() => setShowWithdraw(false)} 
        availableBalance={user.trustBalance} 
      />
    </div>
  );
};

export default WithdrawalsView;
