import React, { useState, useEffect } from 'react';
import { CalendarCheck, Search, Filter, Eye, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllAppointments();
      setAppointments(res.data?.appointments || []);
    } catch (err) {
      toast.error('Failed to load clinic appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filtered = appointments.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    const q = search.toLowerCase();
    const patName = app.patient?.name?.toLowerCase() || '';
    const docName = app.doctor?.user?.name?.toLowerCase() || '';
    const token = app.tokenNumber?.toLowerCase() || '';
    return patName.includes(q) || docName.includes(q) || token.includes(q);
  });

  if (loading) {
    return <Loader message="Loading clinic appointment master log..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Appointment Master Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global clinic appointments, scheduled slots, active tokens, and completion logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search patient, doctor, token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="waiting">Waiting (In Queue)</option>
            <option value="in_consultation">In Consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{app.patient?.name || 'Patient'}</div>
                    <div className="text-[11px] text-slate-500">{app.patient?.phone || 'No phone'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">
                      Dr. {app.doctor?.user?.name || 'Doctor'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {app.doctor?.department?.name || 'Department'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">
                      {new Date(app.appointmentDate).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400 block text-[11px]">{app.timeSlot}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-brand-700">
                    {app.tokenNumber || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={app.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Appointment Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Appointment: ${selectedApp.patient?.name}`}
          subtitle={`Dr. ${selectedApp.doctor?.user?.name} • ${new Date(selectedApp.appointmentDate).toLocaleDateString()} ${selectedApp.timeSlot}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 uppercase font-semibold">Token Number</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">
                  {selectedApp.tokenNumber || 'None'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Current Status</span>
                <p className="mt-0.5"><Badge status={selectedApp.status} /></p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Reason & Symptoms</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-800">
                {selectedApp.reason} {selectedApp.symptoms ? `(${selectedApp.symptoms})` : ''}
              </p>
            </div>

            {selectedApp.notes && (
              <div>
                <span className="text-slate-500 font-bold block mb-1">Consultation Notes</span>
                <p className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-slate-800">
                  {selectedApp.notes}
                </p>
              </div>
            )}

            {selectedApp.prescription && (
              <div>
                <span className="text-slate-500 font-bold block mb-1">Prescription</span>
                <p className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-slate-800 font-mono">
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

export default AppointmentManagement;
