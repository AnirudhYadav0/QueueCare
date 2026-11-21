import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { User, Phone, Mail, Heart, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const PatientProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const profile = user?.patientProfile || {};

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: profile?.gender || 'Prefer not to say',
    bloodGroup: profile?.bloodGroup || 'Unknown',
    address: profile?.address || '',
    emergencyContactName: profile?.emergencyContact?.name || '',
    emergencyContactPhone: profile?.emergencyContact?.phone || '',
    emergencyContactRelation: profile?.emergencyContact?.relation || '',
    allergies: profile?.allergies?.join(', ') || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile({
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: form.address,
        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relation: form.emergencyContactRelation,
        },
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()) : [],
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Profile & Medical Info</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your contact details, emergency contacts, and vital medical records.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Personal Information</h3>
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
                label="Email Address"
                disabled
                icon={Mail}
                value={user?.email || ''}
                helperText="Email cannot be changed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Phone Number"
                type="tel"
                icon={Phone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

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

            <Input
              label="Home Address"
              placeholder="123 Wellness Blvd, City, State"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Name"
              placeholder="e.g. John Cooper"
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
            />
            <Input
              label="Contact Phone"
              placeholder="+1 (555) 019-9999"
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
            />
            <Input
              label="Relationship"
              placeholder="e.g. Spouse / Sibling"
              value={form.emergencyContactRelation}
              onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })}
            />
          </div>
        </Card>

        {/* Medical History & Allergies */}
        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Known Allergies & Notes</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Allergies (comma-separated)
            </label>
            <Input
              placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              helperText="Alerts attending physicians during your consultations"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
