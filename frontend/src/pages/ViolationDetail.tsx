import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import type { Violation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { QRCodeCard } from '../components/QRCodeCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { ErrorState } from '../components/ErrorState';
import { ChallanSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

export const ViolationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [violation, setViolation] = useState<Violation | null>(null);
  const [violationTypes, setViolationTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog & Modal States
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    vehicle_number: '',
    violation_type: '',
    location: '',
    violation_date: '',
    fine_amount: 0,
    notes: '',
  });

  const fetchViolation = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getViolationById(id);
      setViolation(res.violation);
      setEditForm({
        vehicle_number: res.violation.vehicle_number,
        violation_type: res.violation.violation_type,
        location: res.violation.location,
        violation_date: res.violation.violation_date ? res.violation.violation_date.substring(0, 16) : '',
        fine_amount: res.violation.fine_amount,
        notes: res.violation.notes || '',
      });
    } catch (err: any) {
      setError(err.message || 'Violation record could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolation();
    api.getViolationTypes().then((res) => setViolationTypes(res.types)).catch(() => {});
  }, [id]);

  const handleMarkPaid = async () => {
    if (!violation) return;
    try {
      setActionLoading(true);
      const res = await api.updatePaymentStatus(violation.id, 'PAID');
      setViolation(res.violation);
      success('Payment status updated to PAID.');
      setIsMarkPaidOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Failed to update payment status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!violation) return;
    try {
      setActionLoading(true);
      await api.deleteViolation(violation.id);
      success('Violation record deleted successfully.');
      navigate('/violations');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete record.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!violation) return;
    try {
      setActionLoading(true);
      const res = await api.updateViolation(violation.id, editForm);
      setViolation(res.violation);
      success('Violation details saved successfully.');
      setIsEditOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Validation error while updating.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        <ChallanSkeleton />
      </div>
    );
  }

  if (error || !violation) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <ErrorState
          title="Record Not Found"
          message={error || 'No violation record exists for this identifier.'}
          onRetry={fetchViolation}
        />
        <div className="text-center mt-4">
          <Link to="/violations" className="text-xs font-semibold text-blue-600 hover:underline">
            ← Return to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/violations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Violations List</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/challans/${violation.challan_id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Digital Challan</span>
          </Link>

          {violation.payment_status === 'UNPAID' && (
            <button
              onClick={() => setIsMarkPaidOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
          )}

          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
          >
            <Edit3 className="w-4 h-4 text-amber-600" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Violation Details Card */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Challan Number
              </span>
              <h1 className="text-xl font-mono font-extrabold text-blue-700">
                {violation.challan_id}
              </h1>
            </div>
            <StatusBadge status={violation.payment_status} size="lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            {/* Vehicle Number */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Vehicle Registration
              </span>
              <span className="inline-block px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 font-mono text-sm font-extrabold text-slate-900">
                {violation.vehicle_number}
              </span>
            </div>

            {/* Violation Classification */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Violation Classification
              </span>
              <p className="font-bold text-slate-900 text-base">{violation.violation_type}</p>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Incident Location
              </span>
              <p className="text-slate-700 font-medium">{violation.location}</p>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Infraction Date & Time
              </span>
              <p className="text-slate-800 font-medium">{formatDate(violation.violation_date)}</p>
            </div>
          </div>

          {/* Fine Assessment Box */}
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block">
                Assessed Penalty Fine
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory fine levied according to Motor Vehicles Code
              </p>
            </div>
            <span className="text-3xl font-black text-blue-700">
              {formatCurrency(violation.fine_amount)}
            </span>
          </div>

          {/* Payment & Audit Info */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-500 uppercase block mb-1">
                Enforcing Officer
              </span>
              <p className="font-mono">{violation.officer_badge || 'Automated Camera Patrol'}</p>
            </div>

            {violation.paid_at && (
              <div>
                <span className="font-bold text-emerald-600 uppercase block mb-1">
                  Settlement Details
                </span>
                <p>Paid On: {formatDate(violation.paid_at)}</p>
                <p className="font-mono text-slate-500">Ref: {violation.payment_reference}</p>
              </div>
            )}
          </div>

          {violation.notes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                Officer Notes / Logged Remarks
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{violation.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column: QR Code Card & Quick Actions */}
        <div className="space-y-6">
          <QRCodeCard
            challanId={violation.challan_id}
            qrCodeUrl={violation.qr_code}
            publicUrl={violation.public_url}
          />

          <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Direct Quick Links
            </span>
            <Link
              to={`/challans/${violation.challan_id}`}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>View Printable Challan Notice</span>
              <Printer className="w-4 h-4 text-slate-400" />
            </Link>
            <a
              href={`/public/challan/${violation.challan_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 transition-colors"
            >
              <span>Test Public Citizen QR Page</span>
              <ExternalLink className="w-4 h-4 text-blue-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog: Mark as Paid */}
      <ConfirmDialog
        isOpen={isMarkPaidOpen}
        onClose={() => setIsMarkPaidOpen(false)}
        onConfirm={handleMarkPaid}
        title="Confirm Payment Settlement"
        message={`Are you sure you want to mark Challan ${violation.challan_id} as PAID?`}
        confirmText="Confirm Paid"
        variant="success"
        isLoading={actionLoading}
      />

      {/* Confirmation Dialog: Delete */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Traffic Violation"
        message={`Are you sure you want to permanently delete Challan ${violation.challan_id}?`}
        confirmText="Delete Record"
        variant="danger"
        isLoading={actionLoading}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Violation: ${violation.challan_id}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vehicle Registration Number
              </label>
              <input
                type="text"
                value={editForm.vehicle_number}
                onChange={(e) =>
                  setEditForm({ ...editForm, vehicle_number: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Violation Type
              </label>
              <select
                value={editForm.violation_type}
                onChange={(e) => setEditForm({ ...editForm, violation_type: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                required
              >
                {violationTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Location / Intersection
            </label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={editForm.violation_date}
                onChange={(e) => setEditForm({ ...editForm, violation_date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fine Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                max="500000"
                value={editForm.fine_amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, fine_amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Officer Observations / Evidence Remarks
            </label>
            <textarea
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
