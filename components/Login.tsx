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

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin ? { email, password } : { name, email, password };
      
      const data = await api.user.post(endpoint, body);
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo className="h-16" />
          <h1 className="mt-8 text-4xl font-bold text-[#1e293b]">{isLogin ? 'Welcome back!' : 'Create account'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          {error && <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
            )}
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : <span>{isLogin ? 'Sign In' : 'Create Account'}</span>}
          </button>

          <div className="pt-4 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline">
              {isLogin ? "Sign up for free" : "Sign in here"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// CRITICAL: This must be here!
export default Login;