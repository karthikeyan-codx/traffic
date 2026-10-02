import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await login(username, password);
      success('Authenticated successfully. Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ambient-pattern">
      <div className="w-full max-w-md">
        {/* Department Badge Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Smart Traffic Violation Logger
          </h1>
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mt-1">
            Official Law Enforcement & E-Challan Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 bg-white/90">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Officer Authentication</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials to access the traffic logging dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Officer Username / Badge ID
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. officer"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Access Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In to Enforcement Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('officer', 'traffic123')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors text-xs text-slate-700"
              >
                <div className="font-semibold text-blue-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Officer
                </div>
                <div className="text-[10px] text-slate-500 font-mono">officer / traffic123</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('admin', 'admin123')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors text-xs text-slate-700"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Admin
                </div>
                <div className="text-[10px] text-slate-500 font-mono">admin / admin123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Public Portal Reference */}
        <div className="text-center mt-6">
          <a
            href="/public/challan/CH-20260925-A101"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors underline underline-offset-4"
          >
            Are you a citizen looking to verify or pay an E-Challan? Click here
          </a>
        </div>
      </div>
    </div>
  );
};
