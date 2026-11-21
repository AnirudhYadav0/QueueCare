import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn, Sparkles, User, Stethoscope, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      setLoading(true);
      const user = await login(demoEmail, demoPassword);
      toast.success(`Logged in as ${user.name} (${user.role.toUpperCase()})`);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      toast.error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Queue<span className="text-brand-600">Care</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Your Account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Access your patient queue, doctor workstation, or admin portal
          </p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="bg-white rounded-2xl p-4 border border-brand-200 shadow-sm bg-gradient-to-b from-brand-50/40 to-white">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>1-Click Demo Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('patient.john@queuecare.com', 'patient123')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-center group"
            >
              <User className="w-4 h-4 text-brand-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Patient</span>
              <span className="text-[10px] text-slate-400">John Doe</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('doctor.sarah@queuecare.com', 'doctor123')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-center group"
            >
              <Stethoscope className="w-4 h-4 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Doctor</span>
              <span className="text-[10px] text-slate-400">Dr. Sarah</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin@queuecare.com', 'admin123')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-center group"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Admin</span>
              <span className="text-[10px] text-slate-400">System</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              placeholder="you@queuecare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-brand-600 hover:text-brand-800">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2 shadow-md shadow-brand-500/20"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            Don’t have a patient account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
