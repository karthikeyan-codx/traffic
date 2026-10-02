import React, { useState } from 'react';
import { QrCode, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface QRCodeCardProps {
  challanId: string;
  qrCodeUrl?: string;
  publicUrl?: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  challanId,
  qrCodeUrl,
  publicUrl,
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  // Fallback to origin + route if publicUrl is not explicitly passed
  const targetUrl = publicUrl || `${window.location.origin}/public/challan/${challanId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      success('Public status URL copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `challan-qr-${challanId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success('QR Code image downloaded.');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-700">
        <QrCode className="w-4 h-4 text-blue-600" />
        <span>Challan QR Verification</span>
      </div>

      <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm mb-4">
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt={`Challan QR Code for ${challanId}`}
            className="w-44 h-44 object-contain rounded-lg"
          />
        ) : (
          <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-lg">
            Generating QR...
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 max-w-xs mb-4">
        Point phone camera at this QR code to view live payment verification and receipt details without login.
      </p>

      <div className="w-full space-y-2">
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Link Copied' : 'Copy Verification Link'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadQR}
            disabled={!qrCodeUrl}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>

          <a
            href={`/public/challan/${challanId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Portal
          </a>
        </div>
      </div>
    </div>
  );
};
