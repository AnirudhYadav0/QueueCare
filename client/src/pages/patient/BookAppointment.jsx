import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  HeartPulse,
  Activity,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  QrCode,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { departmentService } from '../../services/departmentService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const BookAppointment = () => {
  const navigate = useNavigate();

  // State
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('Routine Checkup');
  const [symptoms, setSymptoms] = useState('');

  // Confirmation result
  const [bookingResult, setBookingResult] = useState(null);

  // Load initial departments & doctors
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [deptRes, docRes] = await Promise.all([
          departmentService.getDepartments(),
          doctorService.getDoctors({ availableOnly: 'false' }),
        ]);

        const depts = deptRes.data?.departments || [];
        const docs = docRes.data?.doctors || [];

        setDepartments(depts);
        setDoctors(docs);

        if (depts.length > 0) {
          setSelectedDept(depts[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load clinic departments and doctors');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Filter doctors by selected department
  const filteredDoctors = doctors.filter((doc) => {
    if (!selectedDept) return true;
    const docDeptId = doc.department?._id || doc.department;
    return docDeptId === selectedDept;
  });

  // When filtered doctors change, preselect first available doctor
  useEffect(() => {
    if (filteredDoctors.length > 0 && (!selectedDoctor || !filteredDoctors.some(d => d._id === selectedDoctor._id))) {
      setSelectedDoctor(filteredDoctors[0]);
    } else if (filteredDoctors.length === 0) {
      setSelectedDoctor(null);
    }
  }, [selectedDept, doctors]);

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor?._id || !selectedDate) {
        setSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const res = await appointmentService.getAvailableSlots(
          selectedDoctor._id,
          selectedDate
        );
        const fetchedSlots = res.data?.slots || [];
        setSlots(fetchedSlots);

        // Auto-select first available slot
        const firstAvail = fetchedSlots.find((s) => s.isAvailable);
        setSelectedSlot(firstAvail ? firstAvail.slot : '');
      } catch (err) {
        console.warn('Failed to load slots:', err.message);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor?._id, selectedDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select an appointment date');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please select an available time slot');
      return;
    }

    try {
      setSubmitting(true);
      const res = await appointmentService.createAppointment({
        doctorId: selectedDoctor._id,
        departmentId: selectedDept,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reason,
        symptoms,
      });

      setBookingResult(res.data?.appointment);
      toast.success('Appointment booked successfully! QR Check-In pass generated.');
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading appointment schedule options..." />;
  }

  // If appointment booked, show rich Confirmation with QR Code & PIN
  if (bookingResult) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card padding="p-8" className="border-2 border-emerald-500 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Booking Confirmed
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            Your Appointment is Scheduled!
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            We have generated your digital pass with instant QR check-in credentials.
          </p>

          {/* Pass Card with QR Code */}
          <div id="printable-pass" className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Consultation Details
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Dr. {bookingResult.doctor?.user?.name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {bookingResult.doctor?.department?.name} • Room {bookingResult.doctor?.roomNumber}
                </p>
                <div className="mt-3 text-xs space-y-1 text-slate-700">
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(bookingResult.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p>
                    <strong>Time Slot:</strong> {bookingResult.timeSlot}
                  </p>
                  <p>
                    <strong>Reason:</strong> {bookingResult.reason}
                  </p>
                </div>
              </div>

              {/* QR Code graphic */}
              <div className="text-center shrink-0">
                {bookingResult.qrCodeData ? (
                  <img
                    src={bookingResult.qrCodeData}
                    alt="Check-in QR Code"
                    className="w-32 h-32 rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    QR Ready
                  </div>
                )}
                <div className="mt-2 text-xs font-mono font-bold text-slate-700">
                  PIN: {bookingResult.checkInPin}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Appointment ID: <code className="text-slate-700">{bookingResult._id}</code></span>
              <span>Status: <strong className="text-brand-600 uppercase">Scheduled</strong></span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/patient/appointments')}
            >
              View My Appointments <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => window.print()}
            >
              Print Pass
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => {
                setBookingResult(null);
                setReason('Routine Checkup');
                setSymptoms('');
              }}
            >
              Book Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book an Appointment</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select your specialty, doctor, date, and preferred time slot for seamless care.
        </p>
      </div>

      <form onSubmit={handleBookingSubmit} className="space-y-6">
        {/* Step 1: Department Selection */}
        <Card padding="p-6">
          <label className="block text-sm font-bold text-slate-900 mb-3">
            1. Select Clinical Specialty
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {departments.map((dept) => {
              const isSelected = selectedDept === dept._id;
              return (
                <button
                  type="button"
                  key={dept._id}
                  onClick={() => setSelectedDept(dept._id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 text-brand-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-teal-600 font-bold">
                      {dept.code}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                  </div>
                  <div className="text-sm">{dept.name}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Step 2: Doctor Selection */}
        <Card padding="p-6">
          <label className="block text-sm font-bold text-slate-900 mb-3">
            2. Choose Physician
          </label>
          {filteredDoctors.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No doctors currently registered under this specialty.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctor?._id === doc._id;
                return (
                  <div
                    key={doc._id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={
                        doc.user?.avatar ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={doc.user?.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          Dr. {doc.user?.name}
                        </h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{doc.specialization}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                        <span>Room {doc.roomNumber}</span>
                        <span>•</span>
                        <span>Fee: ${doc.consultationFee}</span>
                        <span>•</span>
                        <span>~{doc.avgConsultationMinutes}m avg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Step 3 & 4: Date and Slot Selection */}
        <Card padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                3. Appointment Date
              </label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Select today for instant walk-in queueing, or choose an upcoming date.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                4. Select Available Time Slot
              </label>

              {loadingSlots ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Checking real-time doctor availability...
                </div>
              ) : slots.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No slots available for this doctor on selected date. Please choose another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(({ slot, isAvailable }) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                          !isAvailable
                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Step 5: Clinical Notes & Reason */}
        <Card padding="p-6">
          <label className="block text-sm font-bold text-slate-900 mb-3">
            5. Reason for Visit & Symptoms
          </label>
          <div className="space-y-4">
            <Input
              label="Primary Reason"
              placeholder="e.g. Annual cardiology checkup, Persistent knee pain, Fever"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Symptoms or Prior Medical Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention any symptoms, duration, current medications..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/patient')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={!selectedSlot || !selectedDoctor}
            className="shadow-md shadow-brand-500/20"
          >
            Confirm & Generate Pass <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
