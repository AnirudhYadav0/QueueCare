import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, Mail, Lock, Phone, Calendar, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Prefer not to say',
    dateOfBirth: '',
    bloodGroup: 'Unknown',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register(form);
      toast.success('Registration successful! Welcome to QueueCare.');
      navigate('/patient');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              Queue<span className="text-brand-600">Care</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Patient Account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Join QueueCare to book appointments and track live queue wait times
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              icon={User}
              placeholder="e.g. Alice Cooper"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                icon={Mail}
                placeholder="alice@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <Input
                label="Phone Number"
                type="tel"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <Input
              label="Password (min. 6 characters)"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Gender"
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                  { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />

              <Select
                label="Blood Group"
                options={[
                  { value: 'Unknown', label: 'Unknown' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              />
            </div>

            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              By creating an account, you agree to QueueCare's healthcare privacy practices and terms of service.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2 shadow-md shadow-brand-500/20"
            >
              Complete Registration <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-800">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
