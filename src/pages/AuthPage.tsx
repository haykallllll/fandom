import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Github, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
              role: 'user'
            }
          }
        });
        if (authError) throw authError;
        alert('Check your email for verification!');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 p-8 md:p-16">
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold mx-auto mb-6 shadow-xl rotate-3">W</div>
          <h1 className="text-4xl font-sans font-extrabold text-slate-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join the Collective'}
          </h1>
          <p className="text-slate-400 mt-3 text-sm font-medium">
            {isLogin ? 'Access your contribution dashboard.' : 'Start documenting the multiverse today.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 font-medium"
                  placeholder="e.g. Chronicler99"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Identifier</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 font-medium"
                placeholder="identity@wiki.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Access Key</label>
            </div>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-900 font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-4 text-center font-bold bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-6 text-sm uppercase tracking-widest"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Identity')}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className="bg-white px-4 text-slate-300 font-bold">Secure Auth</span></div>
        </div>

        <p className="text-center text-sm text-slate-400">
          {isLogin ? "Don't have an identity yet?" : 'Already a contributor?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-extrabold ml-1 hover:underline underline-offset-4"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
