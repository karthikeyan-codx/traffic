import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';
import { api } from '../services/api';
import type { Violation, ViolationFilterParams, VehicleHistoryResponse } from '../types';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { ViolationTable } from '../components/ViolationTable';
import { TableRowSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

export const ViolationsList: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [violationTypes, setViolationTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<ViolationFilterParams>({
    search: '',
    status: 'ALL',
    violation_type: 'ALL',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 1,
  });

  // Dialog & Modal states
  const [markPaidTarget, setMarkPaidTarget] = useState<Violation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Violation | null>(null);
  const [editTarget, setEditTarget] = useState<Violation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    vehicle_number: '',
    violation_type: '',
    location: '',
    violation_date: '',
    fine_amount: 0,
    notes: '',
  });

  // Vehicle History Lookup State
  const [historyVehicleNumber, setHistoryVehicleNumber] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { success, error: toastError } = useToast();

  // Load violation types once
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.getViolationTypes();
        setViolationTypes(res.types);
      } catch {
        // Fallback
      }
    };
    fetchTypes();
  }, []);

  // Fetch violations
  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getViolations(filters);
      setViolations(res.violations);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve violation records.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  const handleFilterChange = (key: keyof ViolationFilterParams, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 on filter modification
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      violation_type: 'ALL',
      date_from: '',
      date_to: '',
      page: 1,
      per_page: 10,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Confirm Mark as Paid
  const handleConfirmMarkPaid = async () => {
    if (!markPaidTarget) return;
    try {
      setActionLoading(true);
      await api.updatePaymentStatus(markPaidTarget.id, 'PAID');
      success(`Challan ${markPaidTarget.challan_id} marked as PAID.`);
      setMarkPaidTarget(null);
      fetchViolations();
    } catch (err: any) {
      toastError(err.message || 'Failed to update payment status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await api.deleteViolation(deleteTarget.id);
      success(`Challan ${deleteTarget.challan_id} deleted successfully.`);
      setDeleteTarget(null);
      fetchViolations();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete violation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (v: Violation) => {
    setEditTarget(v);
    setEditForm({
      vehicle_number: v.vehicle_number,
      violation_type: v.violation_type,
      location: v.location,
      violation_date: v.violation_date ? v.violation_date.substring(0, 16) : '',
      fine_amount: v.fine_amount,
      notes: v.notes || '',
    });
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setActionLoading(true);
      await api.updateViolation(editTarget.id, editForm);
      success('Violation record updated successfully.');
      setEditTarget(null);
      fetchViolations();
    } catch (err: any) {
      toastError(err.message || 'Validation error while saving changes.');
    } finally {
      setActionLoading(false);
    }
  };

  // Search Vehicle History
  const handleSearchVehicleHistory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!historyVehicleNumber.trim()) return;
    try {
      setHistoryLoading(true);
      setIsHistoryModalOpen(true);
      const res = await api.getVehicleHistory(historyVehicleNumber.trim());
      setVehicleHistory(res);
    } catch (err: any) {
      toastError(err.message || 'Could not find history for this vehicle.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-200/80">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Traffic Violation History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Search, filter, update statuses, and generate digital challan receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Vehicle History Lookup Trigger */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <History className="w-4 h-4 text-blue-600" />
            <span>Vehicle History</span>
          </button>

          <Link
            to="/violations/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Violation</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={filters.search || ''}
          onChange={(val) => handleFilterChange('search', val)}
          placeholder="Search by Vehicle Number, Challan ID, or Location..."
          className="flex-1"
        />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        violationTypes={violationTypes}
      />

      {/* Main Content Area */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-4">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={fetchViolations} />
          </div>
        ) : violations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Violations Found"
              description="No traffic violation records matched your search query or filter criteria."
              actionText="Clear Filters"
              onAction={handleResetFilters}
            />
          </div>
        ) : (
          <>
            <ViolationTable
              violations={violations}
              onMarkPaid={(v) => setMarkPaidTarget(v)}
              onDelete={(v) => setDeleteTarget(v)}
              onEdit={(v) => handleOpenEdit(v)}
            />

            {/* Pagination Strip */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="text-xs text-slate-500 font-medium">
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {Math.min((pagination.page - 1) * pagination.per_page + 1, pagination.total)}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(pagination.page * pagination.per_page, pagination.total)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{pagination.total}</span> violations
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                  Page {pagination.page} of {pagination.total_pages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal: Mark As Paid */}
      <ConfirmDialog
        isOpen={!!markPaidTarget}
        onClose={() => setMarkPaidTarget(null)}
        onConfirm={handleConfirmMarkPaid}
        title="Confirm Payment Settlement"
        message={`Are you sure you want to mark Challan ${markPaidTarget?.challan_id} for Vehicle ${markPaidTarget?.vehicle_number} as PAID? This will record an official payment transaction.`}
        confirmText="Confirm Paid"
        variant="success"
        isLoading={actionLoading}
      />

      {/* Confirmation Modal: Delete Record */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Traffic Violation Record"
        message={`Are you sure you want to permanently delete Challan ${deleteTarget?.challan_id} (Vehicle: ${deleteTarget?.vehicle_number})? This action cannot be undone.`}
        confirmText="Delete Record"
        variant="danger"
        isLoading={actionLoading}
      />

      {/* Edit Violation Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit Violation: ${editTarget?.challan_id}`}
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
              Location / Junction
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
              Officer Notes / Observations
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
              onClick={() => setEditTarget(null)}
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

      {/* Vehicle History Lookup Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setVehicleHistory(null);
        }}
        title="Vehicle Violation History Lookup"
        maxWidth="lg"
      >
        <form onSubmit={handleSearchVehicleHistory} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={historyVehicleNumber}
              onChange={(e) => setHistoryVehicleNumber(e.target.value.toUpperCase())}
              placeholder="Enter Registration No. (e.g. DL-01-AB-1234)"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={historyLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {historyLoading ? (
          <div className="space-y-3 py-4">
            <div className="animate-shimmer h-12 rounded-xl" />
            <div className="animate-shimmer h-24 rounded-xl" />
          </div>
        ) : vehicleHistory ? (
          <div className="space-y-4">
            {/* Vehicle Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Total Violations
                </span>
                <span className="text-base font-extrabold text-slate-800">
                  {vehicleHistory.summary.total_violations}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">
                  Paid Settled
                </span>
                <span className="text-base font-extrabold text-emerald-700">
                  {vehicleHistory.summary.paid_violations}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-rose-600 uppercase font-bold block">
                  Pending Unpaid
                </span>
                <span className="text-base font-extrabold text-rose-700">
                  {vehicleHistory.summary.unpaid_violations}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Outstanding Dues
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{vehicleHistory.summary.pending_fines}
                </span>
              </div>
            </div>

            {/* Violations List */}
            {vehicleHistory.violations.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500 font-medium">
                No past traffic violation records found for this vehicle.
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {vehicleHistory.violations.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">
                          {item.challan_id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.payment_status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.payment_status}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 mt-1">{item.violation_type}</p>
                      <p className="text-[11px] text-slate-500">{item.location}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-sm block">
                        ₹{item.fine_amount}
                      </span>
                      <Link
                        to={`/challans/${item.challan_id}`}
                        onClick={() => setIsHistoryModalOpen(false)}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        View Challan →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-4 text-xs text-slate-500 font-medium">
            Enter a vehicle plate number to inspect all registered offences and unsettled dues.
          </p>
        )}
      </Modal>
    </div>
  );
};
