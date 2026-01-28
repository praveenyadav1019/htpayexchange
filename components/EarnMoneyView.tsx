
import React, { useState } from 'react';
import EmptyState from './EmptyState';
import { Copy, Check, Loader2 } from 'lucide-react';

const EarnMoneyView: React.FC = () => {
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const referralLink = "https://paygtwy.com/Forms/form_partner?d=RjUrhJ80IHC...";

  const handleGenerateLink = async () => {
    setLoading(true);
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    setLinkGenerated(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      {/* Left Column: Link and Referrals */}
      <div className="lg:col-span-7 space-y-6">
        {/* Invitation Link Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Invitation link</h3>
          <p className="text-sm text-gray-400">To invite other participants, send them a link</p>
          
          <div className="pt-2">
            {!linkGenerated ? (
              <button 
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Generate link'}
              </button>
            ) : (
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between group">
                <p className="text-sm font-medium text-gray-700 truncate mr-4">
                  {referralLink}
                </p>
                <button 
                  onClick={handleCopy}
                  className="p-2.5 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* My Referrals Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-xl font-bold text-gray-900 mb-2">My Referrals</h3>
          <p className="text-sm text-gray-400">You do not have any active referrals</p>
          <div className="flex flex-col items-center justify-center h-full pt-12">
             <div className="w-48 h-48 opacity-50 grayscale">
                <EmptyState />
             </div>
          </div>
        </div>
      </div>

      {/* Right Column: Rules */}
      <div className="lg:col-span-5">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full space-y-8">
          <h3 className="text-xl font-bold text-gray-900">Referral system rules</h3>
          
          <div className="space-y-8">
            <RuleStep 
              step="1" 
              title="Step 1" 
              description="Generate your personal invitation link." 
            />
            <RuleStep 
              step="2" 
              title="Step 2" 
              description="Copy it or share it with others." 
            />
            <RuleStep 
              step="3" 
              title="Step 3" 
              description="Once someone registers using your link, they will appear in your &quot;My Referrals&quot; list." 
            />
            <RuleStep 
              step="4" 
              title="Step 4" 
              description="When the invited user reaches a turnover of $10,000*, you will receive 50$ in your Trust balance." 
            />
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-400 leading-relaxed italic">
              *The turnover amount is calculated in local currency, based on the exchange rate at the time of registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RuleStep: React.FC<{ step: string; title: string; description: string }> = ({ title, description }) => (
  <div className="space-y-2">
    <h4 className="text-2xl font-black text-[#1e293b]">{title}</h4>
    <p className="text-sm font-medium text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default EarnMoneyView;
