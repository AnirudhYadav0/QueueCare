import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Phone, Mail, Heart, Calendar } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAllPatients();
        setPatients(res.data?.patients || []);
      } catch (err) {
        toast.error('Failed to load patient directory');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    );
  });

  if (loading) {
    return <Loader message="Loading patient records..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered patients, contact details, emergency contacts, and vital medical records.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search patient name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((patient) => {
                const info = patient.patientInfo || {};
                return (
                  <tr key={patient._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            patient.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              patient.name
                            )}&background=0ea5e9&color=fff&size=80`
                          }
                          alt={patient.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{patient.name}</div>
                          <div className="text-[11px] text-slate-500">{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{patient.phone || '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                        {info.bloodGroup || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{info.gender || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {info.emergencyContact?.name ? (
                        <span>
                          {info.emergencyContact.name} ({info.emergencyContact.relation || 'Contact'})
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Patient Record: ${selectedPatient.name}`}
          subtitle={`Account registered on ${new Date(selectedPatient.createdAt).toLocaleDateString()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
              <div>
                <span className="text-slate-400 uppercase font-semibold">Contact Email</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPatient.email}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Phone Number</span>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPatient.phone || '—'}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Blood Group</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedPatient.patientInfo?.bloodGroup || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Gender</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedPatient.patientInfo?.gender || 'Not specified'}
                </p>
              </div>
            </div>

            {selectedPatient.patientInfo?.emergencyContact?.name && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-amber-700 uppercase font-bold text-[10px]">
                  Emergency Contact
                </span>
                <p className="font-bold text-slate-800 mt-1">
                  {selectedPatient.patientInfo.emergencyContact.name} ({selectedPatient.patientInfo.emergencyContact.relation})
                </p>
                <p className="text-slate-600 mt-0.5">{selectedPatient.patientInfo.emergencyContact.phone}</p>
              </div>
            )}

            <div className="pt-4 flex justify-end border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedPatient(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientManagement;
