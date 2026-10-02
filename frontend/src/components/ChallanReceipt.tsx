import React from 'react';
import { ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import type { Violation } from '../types';

interface ChallanReceiptProps {
  violation: Violation;
}

export const ChallanReceipt: React.FC<ChallanReceiptProps> = ({ violation }) => {
  const isPaid = violation.payment_status === 'PAID';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="challan-print-container bg-white rounded-2xl border-2 border-slate-300/80 shadow-lg overflow-hidden max-w-3xl mx-auto my-4 text-slate-800 relative">
      {/* Watermark for Payment Status */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
        <span className={`text-8xl sm:text-9xl font-black uppercase tracking-widest ${isPaid ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isPaid ? 'PAID' : 'UNPAID'}
        </span>
      </div>

      {/* Official Government Header Banner */}
      <div className="bg-slate-900 text-white px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-b-4 border-blue-600 gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-wide uppercase text-white">
              Government Traffic Enforcement Authority
            </h2>
            <p className="text-xs text-slate-300 font-medium tracking-wider uppercase">
              Motor Vehicles Department • Official Digital E-Challan
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Electronic Notice
          </div>
          <div className="font-mono text-sm font-bold text-blue-400 tracking-wider">
            {violation.challan_id}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Status Alert Bar */}
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
            isPaid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isPaid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Current Payment Status:
              </span>
              <span className="ml-2 font-black text-sm tracking-wide">
                {violation.payment_status}
              </span>
            </div>
          </div>

          {isPaid && violation.payment_reference && (
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-emerald-700 font-mono">
                Ref: {violation.payment_reference}
              </span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          {/* Column 1: Vehicle & Violation */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Vehicle Registration Number
              </span>
              <span className="inline-block px-3 py-1.5 rounded-lg bg-amber-50 border-2 border-amber-300 font-mono text-sm font-extrabold text-slate-900 tracking-wider shadow-2xs">
                {violation.vehicle_number}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Violation Classification
              </span>
              <p className="font-bold text-slate-900 text-base">
                {violation.violation_type}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Violation Location & Corridor
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {violation.location}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Date & Time of Infraction
              </span>
              <p className="text-slate-800 font-medium">
                {formatDate(violation.violation_date)}
              </p>
            </div>
          </div>

          {/* Column 2: Enforcement & Fine Details */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Total Fine Assessment
              </span>
              <p className="text-3xl font-extrabold text-blue-700 tracking-tight">
                {formatCurrency(violation.fine_amount)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Levied under the provisions of the Motor Vehicles Act.
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Enforcement Officer Badge
              </span>
              <p className="font-mono text-xs font-semibold text-slate-700">
                {violation.officer_badge || 'Automated Camera Patrol #8842'}
              </p>
            </div>

            {violation.notes && (
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Officer Remarks / Observation
                </span>
                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  {violation.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code and Official Stamp Section */}
        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* QR Code */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Instant QR Verification
            </span>
            {violation.qr_code ? (
              <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-xs">
                <img
                  src={violation.qr_code}
                  alt={`QR Code for Challan ${violation.challan_id}`}
                  className="w-32 h-32 object-contain"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                QR Code
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-1.5 max-w-[140px]">
              Scan to verify live status on the public portal.
            </p>
          </div>

          {/* Barcode & Notice Instructions */}
          <div className="sm:col-span-2 space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="font-bold text-blue-900 block text-xs">
                Official Compliance Instructions
              </span>
              <p className="text-[11px] leading-relaxed text-blue-800">
                1. This is a computer-generated digital legal notice issued pursuant to the traffic safety code.
              </p>
              <p className="text-[11px] leading-relaxed text-blue-800">
                2. Payments can be settled online by scanning the QR code or visiting the authorized traffic portal.
              </p>
              <p className="text-[11px] leading-relaxed text-blue-800">
                3. Failure to settle outstanding penalties within 30 days may lead to vehicle registration suspension.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>SYSTEM GENERATED RECEIPT</span>
              <span>NO SIGNATURE REQUIRED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
        Smart Traffic Violation Logger • Integrated Urban Mobility & Law Enforcement System
      </div>
    </div>
  );
};
