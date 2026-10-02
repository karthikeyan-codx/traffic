import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  PlusCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import type { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { ViolationTable } from '../components/ViolationTable';
import { StatCardSkeleton, TableRowSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorState message={error} onRetry={fetchStats} />
      </div>
    );
  }

  // Calculate percentage of paid vs unpaid
  const total = stats?.total_violations || 0;
  const paid = stats?.paid_violations || 0;
  const unpaid = stats?.unpaid_violations || 0;
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const unpaidPercent = total > 0 ? Math.round((unpaid / total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Traffic Enforcement Overview
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              Live SQLite Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time analytics and enforcement activity recorded across all urban zones.
          </p>
        </div>

        <Link
          to="/violations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Violation</span>
        </Link>
      </div>

      {/* Primary KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Violations"
              value={stats?.total_violations ?? 0}
              subtitle="All registered notices"
              icon={ShieldAlert}
              colorTheme="blue"
            />
            <StatCard
              title="Today's Violations"
              value={stats?.today_violations ?? 0}
              subtitle="Recorded since midnight"
              icon={Calendar}
              colorTheme="amber"
              badge={{ text: 'Today', type: 'neutral' }}
            />
            <StatCard
              title="Paid Violations"
              value={stats?.paid_violations ?? 0}
              subtitle={`${paidPercent}% settlement rate`}
              icon={CheckCircle2}
              colorTheme="green"
              badge={{ text: `${paidPercent}%`, type: 'positive' }}
            />
            <StatCard
              title="Unpaid Violations"
              value={stats?.unpaid_violations ?? 0}
              subtitle={`${unpaidPercent}% pending clearance`}
              icon={Clock}
              colorTheme="red"
              badge={{ text: 'Action Req.', type: 'danger' }}
            />
          </>
        )}
      </div>

      {/* Secondary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-emerald-200/80 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Total Fines Collected
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? '...' : formatCurrency(stats?.total_fine_collected ?? 0)}
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-medium">
            Revenue settled into government account
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-rose-200/80 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Total Pending Fines
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {loading ? '...' : formatCurrency(stats?.total_fine_pending ?? 0)}
          </div>
          <p className="text-xs text-rose-700 mt-1 font-medium">
            Outstanding dues awaiting citizen settlement
          </p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Violation Type Distribution (Real database values) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Violation Classification Breakdown
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Distribution by violation offense type from SQLite database
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              {stats?.type_distribution.length || 0} Categories
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-shimmer h-8 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats?.type_distribution.map((item) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.type}</span>
                      <span className="font-mono text-slate-600">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7-Day Activity Trend & Status Donut Indicator */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                7-Day Enforcement Trend
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Daily violation logs recorded
            </p>

            {loading ? (
              <div className="animate-shimmer h-36 rounded-xl" />
            ) : (
              <div className="space-y-2">
                {stats?.trend_7_days.map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600 font-medium">{day.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(day.count * 15, day.count > 0 ? 10 : 0))}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 w-5 text-right">
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Payment Status Ratio */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Settlement Ratio
            </span>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
              <div
                style={{ width: `${paidPercent}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Paid: ${paidPercent}%`}
              />
              <div
                style={{ width: `${unpaidPercent}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Unpaid: ${unpaidPercent}%`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-1.5">
              <span className="text-emerald-700 font-bold">Paid: {paidPercent}%</span>
              <span className="text-rose-700 font-bold">Unpaid: {unpaidPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Violations Table */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recent Violations Logged
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Latest notices issued by automated enforcement cameras and patrolling officers
            </p>
          </div>
          <Link
            to="/violations"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-4">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </tbody>
            </table>
          </div>
        ) : stats?.recent_violations && stats.recent_violations.length > 0 ? (
          <ViolationTable violations={stats.recent_violations} />
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            No recent traffic violations recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
