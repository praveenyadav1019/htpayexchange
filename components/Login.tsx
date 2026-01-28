
import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import Logo from './Logo';

interface LoginProps {
  onLoginSuccess: (data: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Safety check: if login takes longer than 10 seconds, something is wrong
    const timeout = setTimeout(() => {
      if (loading) {
        setError('Connection is taking longer than expected. Please try again.');
        setLoading(false);
      }
    }, 10000);

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const body = isLogin ? { email, password } : { name, email, password };
      
      console.log(`Attempting ${isLogin ? 'Login' : 'Signup'}...`);
      // Use api.user.post as defined in services/api.ts
      const data = await api.user.post(endpoint, body);
      
      clearTimeout(timeout);
      onLoginSuccess(data);
    } catch (err: any) {
      clearTimeout(timeout);
      setError(err.message || 'An unexpected error occurred');
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo className="h-16" />
          
          <h1 className="mt-8 text-4xl font-bold text-[#1e293b] tracking-tight">
            {isLogin ? 'Welcome back!' : 'Create account'}
          </h1>
          <p className="mt-2 text-gray-500 text-center font-medium">
            {isLogin ? "Securely access your HTPAY wallet" : "Start your journey with HTPAY"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          {error && (
            <div className="p-4 text-sm font-medium text-red-600 bg-red-50 rounded-xl border border-red-100 animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-600 active:scale-[0.98] disabled:opacity-70 transition-all shadow-lg shadow-blue-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Authenticating...</span>
              </div>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-500 font-medium">
              {isLogin ? "New to HTPAY? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                {isLogin ? 'Sign up for free' : 'Sign in here'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
