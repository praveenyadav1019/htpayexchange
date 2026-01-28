
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Loader2, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: any; // Optional account for editing
}

interface PaymentSystem {
  id: string;
  name: string;
  logo: string;
}

const paymentSystems: PaymentSystem[] = [
  { id: 'iob', name: 'indian overseas bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_T7x0Vz0H0_X-y_F4f0X_k_X0_X0_X0_X0&s' },
  { id: 'upi', name: 'bhim sbi app', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png' },
  { id: 'uco', name: 'uco bank', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/UCO_Bank_Logo.svg/1200px-UCO_Bank_Logo.svg.png' },
];

const bankNames = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'];
const bankAccountTypes = ['Savings', 'Current'];

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, account }) => {
  const [selectedSystem, setSelectedSystem] = useState<PaymentSystem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    upiId: '',
    accountNumber: '',
    accountName: '',
    ifsc: '',
    phoneNumber: '',
    bankAccountNumber: '',
    registeredName: '',
    bankName: '',
    accountType: '',
    netbankingLogin: '',
    netbankingPassword: ''
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (account) {
      const system = paymentSystems.find(s => s.id === account.systemId);
      setSelectedSystem(system || null);
      setFormData({
        upiId: account.upiId || '',
        accountNumber: account.accountNumber || '',
        accountName: account.accountName || '',
        ifsc: account.ifsc || '',
        phoneNumber: account.phoneNumber || '',
        bankAccountNumber: account.bankAccountNumber || '',
        registeredName: account.registeredName || '',
        bankName: account.bankName || '',
        accountType: account.accountType || '',
        netbankingLogin: account.netbankingLogin || '',
        netbankingPassword: account.netbankingPassword || ''
      });
    } else {
      setSelectedSystem(null);
      setFormData({
        upiId: '', accountNumber: '', accountName: '', ifsc: '', phoneNumber: '',
        bankAccountNumber: '', registeredName: '', bankName: '', accountType: '',
        netbankingLogin: '', netbankingPassword: ''
      });
    }
  }, [account, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsBankDropdownOpen(false);
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedSystem) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        systemId: selectedSystem.id,
        systemName: selectedSystem.name
      };
      
      if (account?.id) {
        await api.user.put(`/accounts/${account.id}`, payload);
      } else {
        await api.user.post('/accounts', payload);
      }
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    if (!selectedSystem) return null;

    if (selectedSystem.id === 'iob' || selectedSystem.id === 'uco') {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Input placeholder="UPI ID" name="upiId" value={formData.upiId} onChange={handleInputChange} />
          <Input placeholder="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} />
          <Input placeholder="Account Name" name="accountName" value={formData.accountName} onChange={handleInputChange} />
          <Input placeholder="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleInputChange} />
        </div>
      );
    }

    if (selectedSystem.id === 'upi') {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Input placeholder="Linked Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
          <Input placeholder="Bank Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleInputChange} />
          <Input placeholder="Registered Name in App" name="registeredName" value={formData.registeredName} onChange={handleInputChange} />
          
          <div className="relative">
            <div 
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
              className="w-full bg-[#f8fafc] rounded-xl px-4 py-4 flex items-center justify-between cursor-pointer group hover:bg-gray-100 transition-all border border-transparent"
            >
              <span className={formData.bankName ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                {formData.bankName || 'Select Bank Name'}
              </span>
              <ChevronDown size={18} className="text-gray-300" />
            </div>
            {isBankDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[120] max-h-48 overflow-y-auto">
                {bankNames.map(name => (
                  <button 
                    key={name}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700"
                    onClick={() => { setFormData(p => ({...p, bankName: name})); setIsBankDropdownOpen(false); }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input placeholder="UPI ID" name="upiId" value={formData.upiId} onChange={handleInputChange} />
          
          <div className="relative">
            <div 
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full bg-[#f8fafc] rounded-xl px-4 py-4 flex items-center justify-between cursor-pointer group hover:bg-gray-100 transition-all border border-transparent"
            >
              <span className={formData.accountType ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                {formData.accountType || 'Type of Bank Account'}
              </span>
              <ChevronDown size={18} className="text-gray-300" />
            </div>
            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[120]">
                {bankAccountTypes.map(type => (
                  <button 
                    key={type}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700"
                    onClick={() => { setFormData(p => ({...p, accountType: type})); setIsTypeDropdownOpen(false); }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Netbanking Login</label>
            <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl px-4 py-4 flex items-center justify-between">
              <input 
                name="netbankingLogin"
                value={formData.netbankingLogin}
                onChange={handleInputChange}
                className="w-full bg-transparent outline-none text-sm text-gray-700" 
                placeholder="Enter netbanking username"
              />
              <button onClick={() => setFormData(p => ({...p, netbankingLogin: ''}))}>
                <X size={16} className="text-blue-300 hover:text-blue-500" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">Netbanking Password</label>
            <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl px-4 py-4 flex items-center justify-between">
              <input 
                type={showPassword ? "text" : "password"}
                name="netbankingPassword"
                value={formData.netbankingPassword}
                onChange={handleInputChange}
                className="w-full bg-transparent outline-none text-sm text-gray-700 tracking-wider" 
                placeholder="Enter netbanking password"
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} className="text-blue-300" /> : <Eye size={18} className="text-blue-300" />}
              </button>
            </div>
          </div>

          <Input placeholder="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleInputChange} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1e293b]">
            {account ? 'Edit Account' : 'Add Account'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => !account && setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full bg-[#f8fafc] border-[1.5px] rounded-xl px-4 py-4 flex items-center justify-between cursor-pointer transition-all ${
                isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-100 hover:border-gray-200'
              } ${account ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                {selectedSystem ? (
                  <>
                    <img src={selectedSystem.logo} className="w-6 h-6 object-contain" alt="" />
                    <span className="text-gray-700 font-medium capitalize">{selectedSystem.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400 font-medium">Payment system type</span>
                )}
              </div>
              {!account && (isDropdownOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />)}
            </div>

            {isDropdownOpen && !account && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[110] animate-in slide-in-from-top-2 duration-200">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>
                {paymentSystems.map((system) => (
                  <button
                    key={system.id}
                    onClick={() => {
                      setSelectedSystem(system);
                      setIsDropdownOpen(false);
                      // Clear form when system changes in "Add" mode
                      setFormData({
                        upiId: '', accountNumber: '', accountName: '', ifsc: '', phoneNumber: '',
                        bankAccountNumber: '', registeredName: '', bankName: '', accountType: '',
                        netbankingLogin: '', netbankingPassword: ''
                      });
                    }}
                    className="w-full flex items-center space-x-4 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-50 p-1">
                      <img src={system.logo} className="w-full h-full object-contain" alt={system.name} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{system.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {renderFields()}

          <button 
            onClick={handleSave}
            disabled={!selectedSystem || loading}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 flex-shrink-0 ${
              selectedSystem 
              ? 'bg-[#3b82f6] text-white hover:bg-blue-600 shadow-lg shadow-blue-100' 
              : 'bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (account ? 'Update Account' : 'Save Account')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Input: React.FC<{ placeholder: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ placeholder, name, value, onChange }) => (
  <div className="bg-[#f8fafc] rounded-xl px-4 py-4 flex items-center border border-transparent hover:border-gray-100 transition-all focus-within:bg-white focus-within:border-blue-100">
    <input 
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-transparent outline-none text-sm text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal" 
      placeholder={placeholder} 
    />
  </div>
);

export default AddAccountModal;
