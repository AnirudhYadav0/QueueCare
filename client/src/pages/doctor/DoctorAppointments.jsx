import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Filter,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getMyAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = appointments.filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  if (loading) {
    return <Loader message="Loading appointment schedule..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your upcoming, in-progress, and past clinical consultations.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'scheduled', 'waiting', 'in_consultation', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Appointments Found"
          description="There are no consultations matching the selected status filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card key={app._id} padding="p-5" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <img
                  src={
                    app.patient?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      app.patient?.name || 'Patient'
                    )}&background=0ea5e9&color=fff&size=100`
                  }
                  alt={app.patient?.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{app.patient?.name}</h3>
                    <Badge status={app.status} />
                    {app.tokenNumber && (
                      <span className="text-xs font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                        Token: {app.tokenNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.patient?.phone || 'No phone'} • {app.patient?.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {new Date(app.appointmentDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-800">{app.timeSlot}</span>
                    <span>•</span>
                    <span className="text-slate-500">Reason: {app.reason}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedApp(app)}
              >
                <Eye className="w-3.5 h-3.5" /> View Clinical Record
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Clinical Details: ${selectedApp.patient?.name}`}
          subtitle={`Appointment on ${new Date(selectedApp.appointmentDate).toLocaleDateString()} at ${selectedApp.timeSlot}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 font-semibold uppercase">Token Number</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedApp.tokenNumber || 'Not yet checked in'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase">Status</span>
                <p className="mt-0.5"><Badge status={selectedApp.status} /></p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Reason for Visit</span>
              <p className="text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                {selectedApp.reason || 'General Consultation'}
              </p>
            </div>

            {selectedApp.symptoms && (
              <div>
                <span className="text-slate-500 font-bold block mb-1">Reported Symptoms</span>
                <p className="text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  {selectedApp.symptoms}
                </p>
              </div>
            )}

            {selectedApp.notes && (
              <div>
                <span className="text-slate-500 font-bold block mb-1">Doctor Consultation Notes</span>
                <p className="text-slate-800 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  {selectedApp.notes}
                </p>
              </div>
            )}

            {selectedApp.prescription && (
              <div>
                <span className="text-slate-500 font-bold block mb-1">Prescribed Medication</span>
                <p className="text-slate-800 p-2.5 bg-teal-50 rounded-xl border border-teal-100 font-mono">
                  {selectedApp.prescription}
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-end border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorAppointments;
