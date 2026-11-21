import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building,
  User,
  DollarSign,
  Clock,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { departmentService } from '../../services/departmentService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: 'doctor123',
    phone: '',
    departmentId: '',
    specialization: '',
    qualification: 'MD, MBBS',
    roomNumber: '101',
    consultationFee: 60,
    avgConsultationMinutes: 15,
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    departmentId: '',
    specialization: '',
    roomNumber: '',
    consultationFee: 60,
    avgConsultationMinutes: 15,
    isAvailable: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, deptRes] = await Promise.all([
        adminService.getAllDoctors(),
        departmentService.getDepartments(),
      ]);

      setDoctors(docRes.data?.doctors || []);
      const depts = deptRes.data?.departments || [];
      setDepartments(depts);

      if (depts.length > 0 && !addForm.departmentId) {
        setAddForm((prev) => ({ ...prev, departmentId: depts[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.departmentId || !addForm.roomNumber) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setSavingAdd(true);
      await adminService.createDoctor(addForm);
      toast.success('Doctor account created successfully');
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        password: 'doctor123',
        phone: '',
        departmentId: departments[0]?._id || '',
        specialization: '',
        qualification: 'MD, MBBS',
        roomNumber: '101',
        consultationFee: 60,
        avgConsultationMinutes: 15,
      });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create doctor');
    } finally {
      setSavingAdd(false);
    }
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setEditForm({
      name: doc.user?.name || '',
      phone: doc.user?.phone || '',
      departmentId: doc.department?._id || '',
      specialization: doc.specialization || '',
      roomNumber: doc.roomNumber || '',
      consultationFee: doc.consultationFee || 60,
      avgConsultationMinutes: doc.avgConsultationMinutes || 15,
      isAvailable: doc.isAvailable ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    try {
      setSavingEdit(true);
      await adminService.updateDoctor(editingDoctor._id, editForm);
      toast.success('Doctor updated successfully');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update doctor');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await adminService.deleteDoctor(id);
      toast.success('Doctor deactivated');
      fetchData();
    } catch (err) {
      toast.error('Failed to deactivate doctor');
    }
  };

  if (loading) {
    return <Loader message="Loading doctor directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Register new attending physicians, assign departments, and configure room allocations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add New Doctor
        </Button>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Fee</th>
                <th className="py-3 px-4">Avg Duration</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {doctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          doc.user?.avatar ||
                          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100'
                        }
                        alt={doc.user?.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Dr. {doc.user?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{doc.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                      {doc.department?.name || 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-brand-700">
                    Room {doc.roomNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    ${doc.consultationFee}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    ~{doc.avgConsultationMinutes} min
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      status={doc.isAvailable ? 'active' : 'closed'}
                      text={doc.isAvailable ? 'Available' : 'Break'}
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit Doctor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc._id, doc.user?.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Deactivate Doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Doctor"
        subtitle="Create physician profile and system access credentials"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
          <Input
            label="Doctor Full Name"
            required
            placeholder="e.g. Dr. Arthur Conan"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="doctor@queuecare.com"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            />
            <Input
              label="Initial Password"
              type="password"
              required
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              required
              options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
              value={addForm.departmentId}
              onChange={(e) => setAddForm({ ...addForm, departmentId: e.target.value })}
            />

            <Input
              label="Specialization"
              required
              placeholder="e.g. Interventional Cardiology"
              value={addForm.specialization}
              onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Room Number"
              required
              placeholder="Room 101"
              value={addForm.roomNumber}
              onChange={(e) => setAddForm({ ...addForm, roomNumber: e.target.value })}
            />
            <Input
              label="Consultation Fee ($)"
              type="number"
              value={addForm.consultationFee}
              onChange={(e) => setAddForm({ ...addForm, consultationFee: Number(e.target.value) })}
            />
            <Input
              label="Avg Duration (min)"
              type="number"
              value={addForm.avgConsultationMinutes}
              onChange={(e) => setAddForm({ ...addForm, avgConsultationMinutes: Number(e.target.value) })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingAdd}>
              Save & Register Doctor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Doctor: Dr. ${editingDoctor.user?.name}`}
          subtitle="Update room allocation, fee, or clinical pace"
        >
          <form onSubmit={handleUpdateDoctor} className="space-y-4 text-xs">
            <Input
              label="Doctor Name"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department"
                required
                options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
                value={editForm.departmentId}
                onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
              />

              <Input
                label="Specialization"
                required
                value={editForm.specialization}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Room Number"
                required
                value={editForm.roomNumber}
                onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
              />

              <Input
                label="Consultation Fee ($)"
                type="number"
                value={editForm.consultationFee}
                onChange={(e) => setEditForm({ ...editForm, consultationFee: Number(e.target.value) })}
              />

              <Input
                label="Avg Duration (min)"
                type="number"
                value={editForm.avgConsultationMinutes}
                onChange={(e) => setEditForm({ ...editForm, avgConsultationMinutes: Number(e.target.value) })}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DoctorManagement;
