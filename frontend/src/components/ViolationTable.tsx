import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Printer, CheckCircle, Trash2, Edit3, Calendar, MapPin } from 'lucide-react';
import type { Violation } from '../types';
import { StatusBadge } from './StatusBadge';

interface ViolationTableProps {
  violations: Violation[];
  onMarkPaid?: (violation: Violation) => void;
  onDelete?: (violation: Violation) => void;
  onEdit?: (violation: Violation) => void;
}

export const ViolationTable: React.FC<ViolationTableProps> = ({
  violations,
  onMarkPaid,
  onDelete,
  onEdit,
}) => {
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Challan ID</th>
              <th className="py-3.5 px-4">Vehicle Number</th>
              <th className="py-3.5 px-4">Violation Type</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Fine Amount</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {violations.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-blue-50/30 transition-colors group"
              >
                {/* Challan ID */}
                <td className="py-3.5 px-4 font-mono font-semibold text-xs text-blue-600">
                  <Link to={`/challans/${v.challan_id}`} className="hover:underline">
                    {v.challan_id}
                  </Link>
                </td>

                {/* Vehicle Plate Style */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 font-mono text-xs font-bold text-slate-800 tracking-wider shadow-2xs">
                    {v.vehicle_number}
                  </span>
                </td>

                {/* Violation Type */}
                <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                  {v.violation_type}
                </td>

                {/* Location */}
                <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[180px] truncate" title={v.location}>
                  {v.location}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                  {formatDate(v.violation_date)}
                </td>

                {/* Fine */}
                <td className="py-3.5 px-4 text-xs font-bold text-slate-900 text-right whitespace-nowrap">
                  {formatCurrency(v.fine_amount)}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <StatusBadge status={v.payment_status} size="sm" />
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/challans/${v.challan_id}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View Challan Receipt"
                      aria-label="View Challan"
                    >
                      <Printer className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/violations/${v.id}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {v.payment_status === 'UNPAID' && onMarkPaid && (
                      <button
                        onClick={() => onMarkPaid(v)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Mark as Paid"
                        aria-label="Mark as Paid"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    {onEdit && (
                      <button
                        onClick={() => onEdit(v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Violation"
                        aria-label="Edit Violation"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(v)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Record"
                        aria-label="Delete Violation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {violations.map((v) => (
          <div
            key={v.id}
            className="p-4 rounded-xl border border-slate-200 bg-white/90 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600">
                {v.challan_id}
              </span>
              <StatusBadge status={v.payment_status} size="sm" />
            </div>

            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-xs font-bold text-slate-800">
                {v.vehicle_number}
              </span>
              <span className="text-sm font-bold text-slate-900">
                {formatCurrency(v.fine_amount)}
              </span>
            </div>

            <div className="text-xs font-medium text-slate-800">
              {v.violation_type}
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{v.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formatDate(v.violation_date)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <Link
                to={`/challans/${v.challan_id}`}
                className="flex-1 py-1.5 px-2 text-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Challan
              </Link>
              <Link
                to={`/violations/${v.id}`}
                className="flex-1 py-1.5 px-2 text-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold"
              >
                Details
              </Link>
              {v.payment_status === 'UNPAID' && onMarkPaid && (
                <button
                  onClick={() => onMarkPaid(v)}
                  className="py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                >
                  Pay
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
