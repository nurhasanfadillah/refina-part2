import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, getTodayDateString } from '../../utils/formatters';
import {
  Trash2,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  Database
} from 'lucide-react';
import { NominalInput } from './NominalInput';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose }) => {
  const {
    clearTransactionsOnly,
    clearEverything,
    resetToDemoData,
    createOpeningBalanceTransaction
  } = useFinancial();

  const [clearMode, setClearMode] = useState<'TRANSACTIONS_ONLY' | 'EVERYTHING'>('TRANSACTIONS_ONLY');
  const [step, setStep] = useState<'CONFIRM' | 'SETUP_OPENING' | 'DONE'>('CONFIRM');

  // Opening Balance Form
  const [openingDate, setOpeningDate] = useState(getTodayDateString());
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [openingRaw, setOpeningRaw] = useState<number>(0);
  const [openingFG, setOpeningFG] = useState<number>(0);
  const [openingEqp, setOpeningEqp] = useState<number>(0);
  const [openingOther, setOpeningOther] = useState<number>(0);
  const [openingDesc, setOpeningDesc] = useState('');

  if (!isOpen) return null;

  const handleExecuteClear = () => {
    if (clearMode === 'TRANSACTIONS_ONLY') {
      clearTransactionsOnly();
    } else {
      clearEverything();
    }
    setStep('SETUP_OPENING');
  };

  const handleSaveOpeningBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const total = openingCash + openingRaw + openingFG + openingEqp + openingOther;
    if (total > 0) {
      createOpeningBalanceTransaction({
        transactionDate: openingDate,
        cash: openingCash,
        rawMaterials: openingRaw,
        finishedGoods: openingFG,
        equipment: openingEqp,
        otherAssets: openingOther,
        description: openingDesc || 'Pencatatan Saldo Awal Modal Usaha'
      });
    }
    setStep('DONE');
  };

  const handleSkipOpening = () => {
    setStep('DONE');
  };

  const handleFinish = () => {
    setStep('CONFIRM');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-md border border-red-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Fitur Kosongkan Data REODONE
              </h3>
              <p className="text-xs text-slate-400">
                Kelola pembersihan transaksi dan persiapan pembukuan baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CONFIRMATION & SELECTION */}
        {step === 'CONFIRM' && (
          <div className="space-y-4">
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-md text-xs text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block text-red-200">
                  Perhatian Tindakan Bersifat Permanen:
                </span>
                Data transaksi yang dikosongkan akan dihapus dari penyimpanan lokal browser. Anda dapat memilih mempertahankan master produk/customer atau menghapus seluruhnya.
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Pilih Cakupan Pembersihan:
              </label>

              {/* Option A: Transactions Only */}
              <div
                onClick={() => setClearMode('TRANSACTIONS_ONLY')}
                className={`p-3.5 rounded-md border cursor-pointer transition-all ${
                  clearMode === 'TRANSACTIONS_ONLY'
                    ? 'bg-amber-400/10 border-amber-400 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold">
                      Kosongkan Transaksi Saja (Direkomendasikan)
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                    Aman
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  Seluruh transaksi, jurnal mutasi, dan saldo akun kembali ke Rp 0. Data master
                  (Produk, Customer, dan Kategori) tetap tersimpan untuk digunakan kembali.
                </p>
              </div>

              {/* Option B: Everything */}
              <div
                onClick={() => setClearMode('EVERYTHING')}
                className={`p-3.5 rounded-md border cursor-pointer transition-all ${
                  clearMode === 'EVERYTHING'
                    ? 'bg-red-500/10 border-red-500 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-semibold">
                      Kosongkan Total (Reset Bersih Total)
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                    Penuh
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  Menghapus semua transaksi, saldo kas/piutang, produk, customer, dan kategori.
                  Aplikasi kembali seperti baru diinstal tanpa data apapun.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  resetToDemoData();
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                Batalkan & Muat Demo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleExecuteClear}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md shadow-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan Data Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: OPTIONAL SETUP OPENING BALANCE */}
        {step === 'SETUP_OPENING' && (
          <form onSubmit={handleSaveOpeningBalance} className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Data lama berhasil dikosongkan! Seluruh saldo kini berada di posisi Rp 0.</span>
            </div>

            <div className="text-xs text-slate-300">
              <span className="font-semibold block text-slate-100 mb-1">
                Atur Saldo Awal Pembukuan Baru (Opsional):
              </span>
              Masukkan modal atau saldo awal akun yang sudah dimiliki saat memulai buku baru:
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tanggal Mulai Pembukuan</label>
                <input
                  type="date"
                  value={openingDate}
                  onChange={e => setOpeningDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Kas Operasional Awal (A01)</label>
                <NominalInput
                  min={0}
                  value={openingCash}
                  onChange={val => setOpeningCash(val)}
                  placeholder="Rp 0"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Bahan Baku Awal (A03)</label>
                <NominalInput
                  min={0}
                  value={openingRaw}
                  onChange={val => setOpeningRaw(val)}
                  placeholder="Rp 0"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Barang Jadi Awal (A04)</label>
                <NominalInput
                  min={0}
                  value={openingFG}
                  onChange={val => setOpeningFG(val)}
                  placeholder="Rp 0"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Aset Peralatan (A05)</label>
                <NominalInput
                  min={0}
                  value={openingEqp}
                  onChange={val => setOpeningEqp(val)}
                  placeholder="Rp 0"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Aset Lainnya (A06)</label>
                <NominalInput
                  min={0}
                  value={openingOther}
                  onChange={val => setOpeningOther(val)}
                  placeholder="Rp 0"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Catatan Setoran Awal</label>
              <input
                type="text"
                value={openingDesc}
                onChange={e => setOpeningDesc(e.target.value)}
                placeholder="Contoh: Modal Awal Pemilik Tahun Anggaran 2026..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSkipOpening}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Lewati (Mulai dari Saldo Nol)
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Simpan Saldo Awal & Mulai
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DONE */}
        {step === 'DONE' && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">
                Sistem Siap Digunakan!
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Data lama telah dibersihkan dan sistem REODONE siap mencatat transaksi operasional baru.
                Anda dapat memuat kembali data demo kapan saja melalui menu Opsi Data.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs transition-colors"
              >
                Buka Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
