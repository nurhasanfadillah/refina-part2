import React, { useState } from 'react';
import { Transaction } from '../../types';
import { AlertTriangle, X, Undo2 } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface CancelModalProps {
  transaction: Transaction | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  transaction,
  onConfirm,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan pembatalan wajib diisi sesuai standar kepatuhan audit');
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Konfirmasi Pembatalan Transaksi
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {transaction.transactionNo} · {formatRupiah(transaction.totalAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-md text-xs text-slate-300 mb-4 leading-relaxed">
          <p className="font-medium text-slate-200 mb-1">Prinsip Sistem (Bab 8.2):</p>
          Transaksi yang sudah diposting <span className="text-red-400 font-semibold">tidak dapat dihapus permanen</span>.
          Sistem akan membuat mutasi pembalik otomatis untuk mengembalikan saldo akun ke posisi sebelum transaksi dibuat, dan mencatat riwayat pembatalan.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Alasan Pembatalan <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              placeholder="Contoh: Salah input jumlah barang / Retur penjualan disepakati / Koreksi nominal..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-md shadow-xs transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Proses Pembalik Saldo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
