import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CalendarCheck,
  QrCode,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ListOrdered,
  DollarSign,
  Building,
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        setLoading(true);
        const res = await appointmentService.getAppointmentById(id);
        setAppointment(res.data?.appointment || null);
      } catch (err) {
        toast.error('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  const handleCheckIn = async () => {
    try {
      const res = await appointmentService.checkIn(id);
      toast.success(res.message || 'Check-in confirmed! Token assigned.');
      const updated = await appointmentService.getAppointmentById(id);
      setAppointment(updated.data?.appointment);
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  if (loading) {
    return <Loader message="Loading appointment record..." />;
  }

  if (!appointment) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-base font-bold text-slate-800">Appointment Not Found</h3>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/patient/appointments')}>
          Back to Appointments
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase">
            REF #{appointment._id}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Appointment Summary
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge status={appointment.status} size="md" />
          {appointment.tokenNumber && (
            <span className="text-xs font-black bg-teal-100 text-teal-800 px-3 py-1 rounded-full border border-teal-200">
              Token: {appointment.tokenNumber}
            </span>
          )}
        </div>
      </div>

      {/* Main Pass and Doctor Information */}
      <Card padding="p-6 sm:p-8" id="printable-pass" className="border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-100 gap-6">
          <div className="flex items-start gap-4">
            <img
              src={
                appointment.doctor?.user?.avatar ||
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
              }
              alt={appointment.doctor?.user?.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Dr. {appointment.doctor?.user?.name}
              </h3>
              <p className="text-xs text-slate-500">
                {appointment.doctor?.specialization}
              </p>
              <div className="mt-2 text-xs font-medium text-slate-600 flex flex-wrap gap-2">
                <span className="bg-slate-100 px-2 py-0.5 rounded-lg">
                  Dept: {appointment.department?.name}
                </span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-lg">
                  Room: {appointment.doctor?.roomNumber}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Check-in PIN */}
          <div className="text-center shrink-0">
            {appointment.qrCodeData ? (
              <img
                src={appointment.qrCodeData}
                alt="QR Pass"
                className="w-32 h-32 rounded-2xl border border-slate-200 p-1.5 bg-white shadow-sm"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                QR Pass
              </div>
            )}
            <div className="mt-2 text-xs font-mono font-bold text-slate-800">
              PIN: {appointment.checkInPin}
            </div>
          </div>
        </div>

        {/* Schedule & Clinical Details */}
        <div className="py-6 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold">Appointment Date & Slot</span>
            <p className="mt-1 font-bold text-slate-900 text-sm">
              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-slate-600 font-semibold mt-0.5">{appointment.timeSlot}</p>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-semibold">Reason for Consultation</span>
            <p className="mt-1 font-semibold text-slate-900">{appointment.reason}</p>
            {appointment.symptoms && (
              <p className="text-slate-500 mt-1 italic">Symptoms: {appointment.symptoms}</p>
            )}
          </div>
        </div>

        {/* Prescription and Doctor Notes if Completed */}
        {appointment.status === 'completed' && (
          <div className="pt-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" /> Clinical Notes & Prescription
            </h4>
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-slate-800 space-y-2">
              <p>
                <strong>Consultation Notes:</strong> {appointment.notes || 'Routine consultation concluded.'}
              </p>
              {appointment.prescription && (
                <p>
                  <strong>Prescribed Medications:</strong> {appointment.prescription}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5" /> Print Summary
          </Button>

          <div className="flex items-center gap-2">
            {appointment.status === 'scheduled' && (
              <Button variant="primary" size="sm" onClick={handleCheckIn}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Check In Now
              </Button>
            )}
            {['waiting', 'calling', 'in_consultation'].includes(appointment.status) && (
              <Link to={`/queue/${appointment.doctor?._id || appointment.doctor}`}>
                <Button variant="teal" size="sm">
                  <ListOrdered className="w-3.5 h-3.5" /> View Live Queue
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AppointmentDetails;
