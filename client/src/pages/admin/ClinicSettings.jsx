import React, { useState, useEffect } from 'react';
import { Settings, Building, Clock, Phone, Mail, MapPin, Save } from 'lucide-react';
import { clinicService } from '../../services/clinicService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const ClinicSettings = () => {
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    openTime: '08:00',
    closeTime: '20:00',
    slotDurationMinutes: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await clinicService.getClinicSettings();
        const c = res.data?.clinic;
        if (c) {
          setForm({
            name: c.name || '',
            tagline: c.tagline || '',
            address: c.address || '',
            city: c.city || '',
            phone: c.phone || '',
            email: c.email || '',
            openTime: c.operatingHours?.open || '08:00',
            closeTime: c.operatingHours?.close || '20:00',
            slotDurationMinutes: c.slotDurationMinutes || 15,
          });
        }
      } catch (err) {
        toast.error('Failed to load clinic settings');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await clinicService.updateClinicSettings({
        name: form.name,
        tagline: form.tagline,
        address: form.address,
        city: form.city,
        phone: form.phone,
        email: form.email,
        slotDurationMinutes: Number(form.slotDurationMinutes),
        operatingHours: {
          open: form.openTime,
          close: form.closeTime,
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
      });
      toast.success('Clinic settings updated successfully');
    } catch (err) {
      toast.error('Failed to update clinic settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading clinic configurations..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure clinic branding, primary contact channels, and operating schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Clinic Identity & Location</h3>
          <div className="space-y-4">
            <Input
              label="Clinic Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              label="Brand Tagline"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Physical Address"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <Input
                label="City / Metro Region"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <Input
                label="Official Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Clinic Operating Hours & Slot Cadence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Doors Open Time"
              type="time"
              required
              value={form.openTime}
              onChange={(e) => setForm({ ...form, openTime: e.target.value })}
            />

            <Input
              label="Doors Close Time"
              type="time"
              required
              value={form.closeTime}
              onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
            />

            <Input
              label="Standard Slot (Minutes)"
              type="number"
              min={10}
              max={60}
              required
              value={form.slotDurationMinutes}
              onChange={(e) => setForm({ ...form, slotDurationMinutes: e.target.value })}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> Save Clinic Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClinicSettings;
