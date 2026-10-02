import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import type { ViolationFilterParams } from '../types';

interface FilterPanelProps {
  filters: ViolationFilterParams;
  onFilterChange: (key: keyof ViolationFilterParams, value: string) => void;
  onReset: () => void;
  violationTypes: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  violationTypes,
}) => {
  const hasActiveFilters = Boolean(
    filters.status ||
    filters.violation_type ||
    filters.date_from ||
    filters.date_to ||
    filters.vehicle_number ||
    filters.challan_id
  );

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 border border-slate-200/80 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filter Violations
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Payment Status
          </label>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNPAID">Unpaid Only</option>
            <option value="PAID">Paid Only</option>
          </select>
        </div>

        {/* Violation Type Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Violation Type
          </label>
          <select
            value={filters.violation_type || 'ALL'}
            onChange={(e) => onFilterChange('violation_type', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          >
            <option value="ALL">All Violation Types</option>
            {violationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Date From
          </label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Date To
          </label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
      </div>
    </div>
  );
};
