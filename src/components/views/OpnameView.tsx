import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, formatDateIndo, getTodayDateString } from '../../utils/formatters';
import {
  ClipboardCheck,
  Printer,
  Ban,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale
} from 'lucide-react';
import { AccountId, Transaction } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { CancelModal } from '../common/CancelModal';
import { NominalInput } from '../common/NominalInput';

export const OpnameView: React.FC = () => {
  const {
    accounts,
    customers,
    transactions,
    createOpnameTransaction,
    cancelTransaction,
    getAccountBalance
  } = useFinancial();

  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [targetAccountId, setTargetAccountId] = useState<AccountId>('A03');
  const [targetDestination, setTargetDestination] = useState<string>('HPP');
  const [actualAmount, setActualAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [customerId, setCustomerId] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);
  const [selectedTxForCancel, setSelectedTxForCancel] = useState<Transaction | null>(null);

  const systemAmount = getAccountBalance(targetAccountId, transactionDate);
  const difference = actualAmount - systemAmount;

  const opnameObjects: Array<{ id: AccountId; label: string; desc: string }> = [
    {
      id: 'A03',
      label: 'Persediaan Bahan Baku (A03)',
      desc: 'Penyeimbang diarahkan ke Persediaan Barang Jadi (A04)'
    },
    {
      id: 'A04',
      label: 'Persediaan Barang Jadi (A04)',
      desc: 'Opsi penyeimbang: HPP Penjualan (R02) atau Aset Lainnya (A06)'
    },
    {
      id: 'A05',
      label: 'Aset Peralatan & Mesin (A05)',
      desc: 'Penyeimbang diarahkan ke Beban Penyusutan (B01)'
    },
    {
      id: 'A06',
      label: 'Aset Lainnya (A06)',
      desc: 'Opsi: Beban Penyesuaian (B02) atau Penyesuaian Langsung pada Saldo A06'
    },
    {
      id: 'A01',
      label: 'Kas Operasional (A01)',
      desc: 'Penyeimbang fisik diarahkan ke Aset Lainnya (A06)'
    },
    {
      id: 'A02',
      label: 'Piutang Usaha (A02)',
      desc: 'Penyesuaian langsung pada saldo Piutang (per customer / umum)'
    }
  ];

  const handleAccountChange = (accId: AccountId) => {
    setTargetAccountId(accId);
    const newSystemBal = getAccountBalance(accId, transactionDate);
    setActualAmount(newSystemBal);
    if (accId === 'A04') {
      setTargetDestination('HPP');
    } else if (accId === 'A06') {
      setTargetDestination('BEBAN');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (difference === 0) {
      setFormError('Nilai aktual sama dengan saldo sistem (selisih nol, tidak memerlukan mutasi penyesuaian)');
      return;
    }

    if (!reason.trim()) {
      setFormError('Keterangan / Berita Acara hasil opname wajib diisi');
      return;
    }

    const res = createOpnameTransaction({
      transactionDate,
      accountId: targetAccountId,
      actualAmount,
      reason,
      targetDestination: (targetAccountId === 'A04' || targetAccountId === 'A06') ? targetDestination : undefined,
      customerId: targetAccountId === 'A02' ? customerId || undefined : undefined
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal memproses penyesuaian opname');
      return;
    }

    setFormSuccess(
      `Opname berhasil diposting! Selisih ${difference >= 0 ? '+' : ''}${formatRupiah(difference)} telah dialokasikan sesuai aturan alur bisnis.`
    );
    setReason('');
  };

  const opnameTransactions = transactions.filter(t => t.transactionType === 'OPNAME');

  const getOpnameDestinationBadge = (detail?: { accountId: AccountId; targetDestination?: string; customerId?: string }) => {
    if (!detail) return <span className="text-slate-500">-</span>;
    switch (detail.accountId) {
      case 'A03':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded">
            → A04 (Barang Jadi)
          </span>
        );
      case 'A04':
        return detail.targetDestination === 'ASET_LAINNYA' ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded">
            → A06 (Aset Lainnya)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded">
            → R02 (HPP Penjualan)
          </span>
        );
      case 'A05':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20 px-1.5 py-0.5 rounded">
            → B01 (Beban Penyusutan)
          </span>
        );
      case 'A06':
        return detail.targetDestination === 'LANGSUNG' ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
            Langsung di A06
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded">
            → B02 (Beban Penyesuaian)
          </span>
        );
      case 'A01':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
            → A06 (Aset Lainnya)
          </span>
        );
      case 'A02':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
            {detail.customerId ? 'Langsung (Customer)' : 'Langsung di A02'}
          </span>
        );
      default:
        return <span className="text-slate-500">-</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" />
              MODUL 5: OPNAME & REKONSILIASI FISIK ASET
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Pemeriksaan Fisik & Penyesuaian Berimbang
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Menyesuaikan saldo sistem dengan nilai aktual fisik (Selisih = Nilai Aktual − Saldo Sistem).
              Alur bisnis penyeimbang disesuaikan secara presisi: Bahan Baku diarahkan ke Barang Jadi,
              Barang Jadi memilih opsi HPP atau Aset Lainnya, Aset Lainnya memilih opsi Beban atau Langsung,
              dan Peralatan dialokasikan ke Beban Penyusutan.
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 border border-slate-800 rounded-md text-right">
            <span className="text-[11px] text-slate-400 block">Riwayat Dokumen Opname:</span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {opnameTransactions.length} Berita Acara
            </span>
          </div>
        </div>
      </div>

      {/* Opname Rules Reference Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <div className="flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed w-full">
            <span className="font-semibold text-slate-100 block mb-1">
              Aturan Alur Bisnis Opname Terkini:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2.5 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded-md border border-slate-800/80">
                <span className="font-semibold text-emerald-400 block mb-0.5">1. Bahan Baku (A03):</span>
                <span className="text-slate-400 leading-tight block">
                  Diarahkan ke <strong className="text-slate-200">Persediaan Barang Jadi (A04)</strong>
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-slate-800/80">
                <span className="font-semibold text-amber-400 block mb-0.5">2. Barang Jadi (A04):</span>
                <span className="text-slate-400 leading-tight block">
                  Pilihan: Diarahkan ke <strong className="text-slate-200">HPP Penjualan (R02)</strong> atau <strong className="text-slate-200">Aset Lainnya (A06)</strong>
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-slate-800/80">
                <span className="font-semibold text-sky-400 block mb-0.5">3. Peralatan (A05):</span>
                <span className="text-slate-400 leading-tight block">
                  Diarahkan ke Beban Operasional sebagai <strong className="text-slate-200">Beban Penyusutan (B01)</strong>
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-slate-800/80">
                <span className="font-semibold text-purple-400 block mb-0.5">4. Aset Lainnya (A06):</span>
                <span className="text-slate-400 leading-tight block">
                  Pilihan: Diarahkan ke <strong className="text-slate-200">Beban Penyesuaian (B02)</strong> atau <strong className="text-slate-200">Penyesuaian Langsung</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Input Opname */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-800">
          Formulir Pemeriksaan & Penyesuaian Opname
        </h2>

        {formError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tanggal Opname <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={e => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Objek Akun yang Diperiksa <span className="text-amber-400">*</span>
              </label>
              <select
                value={targetAccountId}
                onChange={e => handleAccountChange(e.target.value as AccountId)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
                required
              >
                {opnameObjects.map(obj => (
                  <option key={obj.id} value={obj.id}>
                    {obj.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Balancing Mechanism / Routing Selector */}
            {targetAccountId === 'A03' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mekanisme Penyeimbang
                </label>
                <div className="px-3 py-2 text-xs bg-slate-950 border border-emerald-900/60 rounded-md text-emerald-300 flex items-center justify-between">
                  <span>Persediaan Barang Jadi (A04)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                    A04
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selisih bahan baku langsung diserap ke persediaan barang jadi.
                </p>
              </div>
            )}

            {targetAccountId === 'A04' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilihan Alur Penyeimbang <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetDestination('HPP')}
                    className={`px-2.5 py-1.5 text-xs rounded-md border text-left transition-all ${
                      targetDestination === 'HPP'
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">HPP Penjualan</div>
                    <div className="text-[9px] text-slate-400">Akun R02 (Laba Rugi)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetDestination('ASET_LAINNYA')}
                    className={`px-2.5 py-1.5 text-xs rounded-md border text-left transition-all ${
                      targetDestination === 'ASET_LAINNYA'
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">Aset Lainnya</div>
                    <div className="text-[9px] text-slate-400">Akun A06 (Neraca)</div>
                  </button>
                </div>
              </div>
            )}

            {targetAccountId === 'A05' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mekanisme Penyeimbang
                </label>
                <div className="px-3 py-2 text-xs bg-slate-950 border border-sky-900/60 rounded-md text-sky-300 flex items-center justify-between">
                  <span>Beban Penyusutan Peralatan (B01)</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                    B01
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Penyesuaian nilai peralatan diakui sebagai beban penyusutan di Laba Rugi.
                </p>
              </div>
            )}

            {targetAccountId === 'A06' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilihan Alur Penyesuaian <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetDestination('BEBAN')}
                    className={`px-2.5 py-1.5 text-xs rounded-md border text-left transition-all ${
                      targetDestination === 'BEBAN'
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">Beban Penyesuaian</div>
                    <div className="text-[9px] text-slate-400">Akun B02 (Laba Rugi)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetDestination('LANGSUNG')}
                    className={`px-2.5 py-1.5 text-xs rounded-md border text-left transition-all ${
                      targetDestination === 'LANGSUNG'
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">Penyesuaian Langsung</div>
                    <div className="text-[9px] text-slate-400">Saldo A06 (Tanpa Penyeimbang)</div>
                  </button>
                </div>
              </div>
            )}

            {targetAccountId === 'A01' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mekanisme Penyeimbang
                </label>
                <div className="px-3 py-2 text-xs bg-slate-950/70 border border-slate-800 rounded-md text-slate-300 flex items-center justify-between">
                  <span>Aset Lainnya (A06)</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    A06
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selisih kas ditampung sementara pada akun Aset Lainnya.
                </p>
              </div>
            )}

            {targetAccountId === 'A02' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Terkait (Opsional)
                </label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="">-- Semua Customer / Piutang Umum --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Penyesuaian langsung pada buku piutang tanpa mutasi akun lain.
                </p>
              </div>
            )}
          </div>

          {/* System vs Actual Calculations Card */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block">Saldo Tercatat di Sistem:</span>
              <span className="text-base font-bold font-mono text-slate-200">
                {formatRupiah(systemAmount)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Akumulasi mutasi s/d tanggal {transactionDate}
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Nilai Fisik Aktual (Input Pengguna) <span className="text-amber-400">*</span>:
              </label>
              <NominalInput
                value={actualAmount}
                onChange={val => setActualAmount(val)}
                placeholder="0"
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Selisih Penyesuaian (Aktual - Sistem):</span>
              <span
                className={`text-base font-bold font-mono ${
                  difference > 0
                    ? 'text-emerald-400'
                    : difference < 0
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {difference >= 0 ? '+' : ''}
                {formatRupiah(difference)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {difference > 0
                  ? 'Saldo akan bertambah'
                  : difference < 0
                  ? 'Saldo akan berkurang'
                  : 'Tidak ada perubahan'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Alasan Penyesuaian / Temuan Audit Fisik <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Contoh: Selisih berat kertas menyusut karena kelembaban / Kerusakan fisik kemasan saat pemindahan..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={difference === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-md shadow-xs transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              Posting Penyesuaian Opname
            </button>
          </div>
        </form>
      </div>

      {/* Opname Transactions History */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Riwayat Berita Acara Opname & Penyesuaian
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh audit fisik terdokumentasi lengkap dengan alasan penyesuaian
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {opnameTransactions.length} Berita Acara
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3">No. Berita Acara</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Objek Akun</th>
                <th className="py-2.5 px-3">Aliran Penyeimbang</th>
                <th className="py-2.5 px-3 text-right">Saldo Sistem</th>
                <th className="py-2.5 px-3 text-right">Nilai Aktual</th>
                <th className="py-2.5 px-3 text-right">Selisih</th>
                <th className="py-2.5 px-3">Alasan Temuan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {opnameTransactions.map(tx => {
                const isCancelled = tx.status === 'CANCELLED';
                const detail = tx.opnameDetail;
                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCancelled ? 'opacity-60 bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-medium text-amber-400 whitespace-nowrap">
                      {tx.transactionNo}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {formatDateIndo(tx.transactionDate)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {detail?.accountId || '-'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getOpnameDestinationBadge(detail)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                      {detail ? formatRupiah(detail.systemAmount) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200 whitespace-nowrap">
                      {detail ? formatRupiah(detail.actualAmount) : '-'}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-semibold whitespace-nowrap ${
                        (detail?.differenceAmount ?? 0) < 0
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {detail && detail.differenceAmount >= 0 ? '+' : ''}
                      {detail ? formatRupiah(detail.differenceAmount) : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                      {detail?.reason || tx.description}
                      {isCancelled && tx.cancellationReason && (
                        <span className="block text-[11px] text-red-400 italic">
                          Dibatalkan: {tx.cancellationReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold ${
                          tx.status === 'POSTED'
                            ? 'text-emerald-400'
                            : tx.status === 'CANCELLED'
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTxForPrint(tx)}
                          title="Cetak Berita Acara Opname"
                          className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {!isCancelled && (
                          <button
                            onClick={() => setSelectedTxForCancel(tx)}
                            title="Batalkan Transaksi (Pembalik Saldo)"
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PrintModal
        transaction={selectedTxForPrint}
        onClose={() => setSelectedTxForPrint(null)}
      />

      <CancelModal
        transaction={selectedTxForCancel}
        onConfirm={reason => {
          if (selectedTxForCancel) {
            cancelTransaction(selectedTxForCancel.id, reason);
            setSelectedTxForCancel(null);
          }
        }}
        onClose={() => setSelectedTxForCancel(null)}
      />
    </div>
  );
};
