import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  CreditCard,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import type { PublicChallan } from '../types';
import { ChallanSkeleton } from '../components/Skeleton';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

export const PublicChallanView: React.FC = () => {
  const { challanId } = useParams<{ challanId: string }>();
  const { success, error: toastError } = useToast();

  const [challan, setChallan] = useState<PublicChallan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Citizen payment modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPaying, setIsPaying] = useState(false);

  const fetchPublicChallan = async () => {
    if (!challanId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPublicChallan(challanId);
      setChallan(res.challan);
    } catch (err: any) {
      setError(err.message || 'Unable to verify traffic violation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicChallan();
  }, [challanId]);

  const handleCitizenPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challan) return;
    try {
      setIsPaying(true);
      const res = await api.publicPayChallan(challan.challan_id, paymentMethod);
      success('Payment successful! Your challan is now settled.');
      setChallan({
        ...challan,
        payment_status: 'PAID',
        paid_at: res.paid_at,
        payment_reference: res.payment_reference,
      });
      setIsPayModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsPaying(false);
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

  return (
    <div className="min-h-screen bg-ambient-pattern flex flex-col justify-between">
      {/* Public Citizen Navigation Header */}
      <header className="glass-header px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
              Traffic Enforcement Portal
            </h1>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest">
              Public E-Challan Verification & Payment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Official Portal</span>
          </div>
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors hidden sm:inline"
          >
            Officer Login →
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <ChallanSkeleton />
        ) : error || !challan ? (
          <div className="glass-panel rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Invalid or Missing Challan
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {error || `No record was found for Challan ID '${challanId}'. Please verify the QR code or registration number.`}
            </p>
            <div className="pt-2">
              <button
                onClick={fetchPublicChallan}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Retry Lookup
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Verification Status Hero Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border-2 shadow-sm transition-all ${
                challan.payment_status === 'PAID'
                  ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border-emerald-300'
                  : 'bg-gradient-to-br from-rose-50/90 via-white to-rose-50/50 border-rose-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      challan.payment_status === 'PAID'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {challan.payment_status === 'PAID' ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <Clock className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Verification Status
                    </span>
                    <h2
                      className={`text-2xl font-black tracking-wide ${
                        challan.payment_status === 'PAID'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {challan.payment_status === 'PAID'
                        ? 'CHALLAN SETTLED / PAID'
                        : 'PAYMENT OUTSTANDING / UNPAID'}
                    </h2>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Fine Assessment
                  </span>
                  <span className="text-3xl font-black text-slate-900">
                    {formatCurrency(challan.fine_amount)}
                  </span>
                </div>
              </div>

              {/* Settlement Notice */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {challan.payment_status === 'PAID' ? (
                  <p className="text-emerald-800 font-medium">
                    ✓ Full payment has been received and verified by the treasury.
                    {challan.payment_reference && (
                      <span className="font-mono ml-1 font-bold">
                        (Txn: {challan.payment_reference})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-rose-800 font-medium">
                    ⚠️ This traffic fine requires prompt settlement to avoid statutory penalties.
                  </p>
                )}

                {challan.payment_status === 'UNPAID' && (
                  <button
                    onClick={() => setIsPayModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Challan Online</span>
                  </button>
                )}
              </div>
            </div>

            {/* Violation Details Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Violation Record Details
                </span>
                <span className="font-mono text-xs font-bold text-blue-600">
                  {challan.challan_id}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Vehicle Number
                  </span>
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 font-mono text-sm font-extrabold text-slate-900">
                    {challan.vehicle_number}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Violation Type
                  </span>
                  <p className="font-bold text-slate-900">{challan.violation_type}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Location of Occurrence
                  </span>
                  <p className="text-slate-700 font-medium">{challan.location}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Date & Time Recorded
                  </span>
                  <p className="text-slate-800 font-medium">{formatDate(challan.violation_date)}</p>
                </div>
              </div>

              {challan.notes && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-500 uppercase block mb-1">
                    Official Observation
                  </span>
                  <p className="text-slate-700">{challan.notes}</p>
                </div>
              )}

              {/* QR Verification Visual Confirmation */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                {challan.qr_code && (
                  <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0">
                    <img
                      src={challan.qr_code}
                      alt="Challan Verification QR"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                )}
                <div className="text-xs text-slate-500 space-y-1 text-center sm:text-left">
                  <span className="font-bold text-slate-800 block">
                    Cryptographically Verified QR Token
                  </span>
                  <p className="leading-relaxed">
                    This public status page confirms the authentic record filed with the Government Traffic Enforcement Authority.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Issuing Authority: {challan.issuing_authority}
                  </p>
                </div>
              </div>
            </div>

            {/* Print or Download receipt CTA */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Verification Copy</span>
              </button>

              <span className="font-mono text-[11px]">
                Auth ID: {challan.challan_id}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="glass-header border-t border-slate-200/80 px-4 py-4 text-center text-xs text-slate-500">
        © 2026 Smart Traffic Violation Logger • Official E-Challan Citizen Service
      </footer>

      {/* Citizen Settlement Simulation Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Online Challan Settlement"
        maxWidth="md"
      >
        {challan && (
          <form onSubmit={handleCitizenPayment} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block uppercase font-bold">
                  Vehicle {challan.vehicle_number}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {challan.violation_type}
                </span>
              </div>
              <span className="text-lg font-black text-blue-700">
                {formatCurrency(challan.fine_amount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'NetBanking', 'DebitCard'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === method
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Simulated Secure Government Payment Gateway. The payment status will immediately update to PAID in the local SQLite database.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPaying}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isPaying ? 'Processing Settlement...' : `Pay ${formatCurrency(challan.fine_amount)}`}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
