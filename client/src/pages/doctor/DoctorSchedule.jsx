import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Clock, Building, DollarSign, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const DoctorSchedule = () => {
  const { user } = useAuth();
  const [profile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [avgMinutes, setAvgMinutes] = useState(15);
  const [roomNumber, setRoomNumber] = useState('101');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getMyTodayQueue();
        const doc = res.data?.doctor;
        if (doc) {
          setDoctorProfile(doc);
          setStartTime(doc.workingHours?.start || '09:00');
          setEndTime(doc.workingHours?.end || '17:00');
          setAvgMinutes(doc.avgConsultationMinutes || 15);
          setRoomNumber(doc.roomNumber || '101');
          setIsAvailable(doc.isAvailable ?? true);
        }
      } catch (err) {
        toast.error('Failed to load doctor settings');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await doctorService.updateSchedule({
        workingHours: {
          start: startTime,
          end: endTime,
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        },
        avgConsultationMinutes: Number(avgMinutes),
        roomNumber,
      });
      toast.success('Schedule & clinic workstation settings updated');
    } catch (err) {
      toast.error('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await doctorService.toggleAvailability();
      setIsAvailable(res.data?.doctor?.isAvailable);
      toast.success(
        res.data?.doctor?.isAvailable
          ? 'Marked as Available'
          : 'Marked on Break'
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Schedule & Workstation Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure consultation operating hours, room allocation, and estimated pace.
          </p>
        </div>

        <Button
          variant={isAvailable ? 'secondary' : 'teal'}
          size="sm"
          onClick={handleToggleAvailability}
        >
          {isAvailable ? 'Take Break (Unavailable)' : 'Resume Active Consultations'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Daily Working Hours</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shift Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />

            <Input
              label="Shift End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </Card>

        <Card padding="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Room & Queue Calculation Pace</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Consultation Room Number"
              placeholder="e.g. 101 - West Wing"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
            />

            <Input
              label="Avg. Consultation Duration (Minutes)"
              type="number"
              min={5}
              max={60}
              value={avgMinutes}
              onChange={(e) => setAvgMinutes(e.target.value)}
              helperText="Used to dynamically calculate estimated patient wait times"
              required
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> Save Schedule Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule;
