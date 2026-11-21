import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User, Stethoscope, Mail, Phone, Award, Building, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const DoctorProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const docProfile = user?.doctorProfile || {};

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile(form);
      toast.success('Doctor credentials updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update credentials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Physician Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your medical department assignment and personal contact details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Physician Credentials</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                icon={User}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <Input
                label="Clinic Email Address"
                disabled
                icon={Mail}
                value={user?.email || ''}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                icon={Phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <Input
                label="Avatar URL (Image link)"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
        </Card>

        {/* Assigned Clinical Department details */}
        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Department & Clinic Affiliation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase">Assigned Specialty</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {docProfile.department?.name || 'Cardiology'}
              </p>
              <p className="text-slate-500 mt-0.5">Prefix Code: {docProfile.department?.tokenPrefix || 'CARD'}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase">Consultation Room</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                Room {docProfile.roomNumber || '101'}
              </p>
              <p className="text-slate-500 mt-0.5">Standard Fee: ${docProfile.consultationFee || 75}</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;
