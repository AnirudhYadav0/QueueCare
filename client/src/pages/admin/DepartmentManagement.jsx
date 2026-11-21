import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, HeartPulse, Stethoscope, Baby, Activity } from 'lucide-react';
import { departmentService } from '../../services/departmentService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    tokenPrefix: '',
    description: '',
    icon: 'HeartPulse',
  });
  const [savingAdd, setSavingAdd] = useState(false);

  // Edit modal
  const [editingDept, setEditingDept] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDepartments();
      setDepartments(res.data?.departments || []);
    } catch (err) {
      toast.error('Failed to load clinic departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error('Name and Code are required');
      return;
    }

    try {
      setSavingAdd(true);
      await departmentService.createDepartment(form);
      toast.success('Department created successfully');
      setIsAddModalOpen(false);
      setForm({ name: '', code: '', tokenPrefix: '', description: '', icon: 'HeartPulse' });
      fetchDepartments();
    } catch (err) {
      toast.error(err.message || 'Failed to create department');
    } finally {
      setSavingAdd(false);
    }
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      tokenPrefix: dept.tokenPrefix || dept.code.slice(0, 2),
      description: dept.description || '',
      icon: dept.icon || 'HeartPulse',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      setSavingEdit(true);
      await departmentService.updateDepartment(editingDept._id, form);
      toast.success('Department updated successfully');
      setIsEditModalOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.message || 'Failed to update department');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate department ${name}?`)) return;
    try {
      await departmentService.deleteDepartment(id);
      toast.success('Department deactivated');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to deactivate department');
    }
  };

  if (loading) {
    return <Loader message="Loading departments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Department Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Clinical specialties, departmental routing codes, and token prefix identifiers.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept._id} padding="p-6" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                  Prefix: {dept.tokenPrefix || dept.code}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
              <div className="text-xs text-brand-600 font-mono font-bold mt-0.5">
                CODE: {dept.code}
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {dept.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Badge status={dept.isActive ? 'active' : 'closed'} text={dept.isActive ? 'Active' : 'Inactive'} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(dept)}
                  className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                  title="Edit Department"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(dept._id, dept.name)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Deactivate Department"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Clinical Department"
        subtitle="Create department and assign token numbering prefix"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
          <Input
            label="Department Name"
            required
            placeholder="e.g. Dermatology"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department Code"
              required
              placeholder="e.g. DERM"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
            <Input
              label="Token Prefix (1-4 letters)"
              placeholder="e.g. DERM or D"
              value={form.tokenPrefix}
              onChange={(e) => setForm({ ...form, tokenPrefix: e.target.value.toUpperCase() })}
              helperText="Printed on patient tokens (e.g. D-01)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Clinical scope, diagnostic procedures..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingAdd}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      {editingDept && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Department: ${editingDept.name}`}
          subtitle="Update code or token prefix"
        >
          <form onSubmit={handleUpdateDepartment} className="space-y-4 text-xs">
            <Input
              label="Department Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department Code"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
              <Input
                label="Token Prefix"
                value={form.tokenPrefix}
                onChange={(e) => setForm({ ...form, tokenPrefix: e.target.value.toUpperCase() })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingEdit}>
                Update Department
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DepartmentManagement;
