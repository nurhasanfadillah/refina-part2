import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, formatDateIndo, getTodayDateString } from '../../utils/formatters';
import {
  ArrowUpRight,
  Printer,
  Ban,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Package,
  Users,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { CancelModal } from '../common/CancelModal';
import { NominalInput } from '../common/NominalInput';

export const ExpensesView: React.FC = () => {
  const {
    categories,
    transactions,
    createExpenseTransaction,
    cancelTransaction,
    getAccountBalance
  } = useFinancial();

  const [expenseType, setExpenseType] = useState<
    'EXPENSE' | 'ASSET_EQUIPMENT' | 'RAW_PURCHASE' | 'DIRECT_LABOR' | 'OTHER_ASSET_ADD'
  >('EXPENSE');

  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);
  const [selectedTxForCancel, setSelectedTxForCancel] = useState<Transaction | null>(null);

  const currentCash = getAccountBalance('A01');

  // Filter categories based on expense type
  const isAssetType = expenseType !== 'EXPENSE';
  const filteredCategories = categories.filter(c =>
    isAssetType ? c.type === 'ASSET' : c.type === 'EXPENSE'
  );

  const getSubtypeInfo = () => {
    switch (expenseType) {
      case 'EXPENSE':
        return {
          title: 'A. Pengeluaran Beban Operasional',
          desc: 'Biaya operasional harian yang mengurangi laba perusahaan secara langsung.',
          mutations: 'Beban Operasional (B01) Bertambah · Kas (A01) Berkurang',
          badgeColor: 'text-amber-400 bg-amber-400/10'
        };
      case 'ASSET_EQUIPMENT':
        return {
          title: 'B. Pembelian Aset Peralatan',
          desc: 'Investasi mesin atau peralatan kerja. Tidak mengurangi laba operasional saat ini.',
          mutations: 'Aset Peralatan (A05) Bertambah · Kas (A01) Berkurang',
          badgeColor: 'text-blue-400 bg-blue-400/10'
        };
      case 'RAW_PURCHASE':
        return {
          title: 'C. Pembelian Bahan Baku',
          desc: 'Pengadaan bahan baku produksi menggunakan sistem nominal rupiah tanpa kartu stok fisik.',
          mutations: 'Persediaan Bahan Baku (A03) Bertambah · Kas (A01) Berkurang',
          badgeColor: 'text-emerald-400 bg-emerald-400/10'
        };
      case 'DIRECT_LABOR':
        return {
          title: 'D. Biaya Tenaga Kerja Langsung',
          desc: 'Upah borongan langsung produksi yang menambah nilai persediaan barang jadi.',
          mutations: 'Persediaan Barang Jadi (A04) Bertambah · Kas (A01) Berkurang',
          badgeColor: 'text-purple-400 bg-purple-400/10'
        };
      case 'OTHER_ASSET_ADD':
        return {
          title: 'E. Pembelian Aset Lainnya',
          desc: 'Penambahan aset di luar peralatan dan persediaan (misal: perizinan, deposit kantor).',
          mutations: 'Aset Lainnya (A06) Bertambah · Kas (A01) Berkurang',
          badgeColor: 'text-cyan-400 bg-cyan-400/10'
        };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!amount || amount <= 0) {
      setFormError('Nominal transaksi harus lebih besar dari 0');
      return;
    }

    if (!description.trim()) {
      setFormError('Keterangan pengeluaran wajib diisi');
      return;
    }



    const res = createExpenseTransaction({
      transactionType: expenseType,
      transactionDate,
      categoryId,
      description,
      amount
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal menyimpan transaksi pengeluaran');
      return;
    }

    setFormSuccess('Transaksi pengeluaran berhasil diposting dan saldo kas diperbarui.');
    setDescription('');
    setAmount(0);
  };

  const expenseTransactions = transactions.filter(t =>
    ['EXPENSE', 'ASSET_EQUIPMENT', 'RAW_PURCHASE', 'DIRECT_LABOR', 'OTHER_ASSET_ADD'].includes(
      t.transactionType
    )
  );

  const currentInfo = getSubtypeInfo();

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              MODUL 2: TRANSAKSI PENGELUARAN (5 JENIS)
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Pencatatan Aliran Kas Keluar Perusahaan
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Pencatatan beban operasional, pembelian peralatan, belanja bahan baku nominal,
              biaya upah langsung penambah barang jadi, dan aset lainnya secara terisolasi.
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 border border-slate-800 rounded-md text-right">
            <span className="text-[11px] text-slate-400 block">Saldo Kas Operasional (A01):</span>
            <span
              className={`text-sm font-bold font-mono ${
                currentCash >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatRupiah(currentCash)}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Subtype Tab Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
          <button
            onClick={() => setExpenseType('EXPENSE')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors text-left flex items-center gap-2 ${
              expenseType === 'EXPENSE'
                ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1. Beban Ops</span>
          </button>

          <button
            onClick={() => setExpenseType('ASSET_EQUIPMENT')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors text-left flex items-center gap-2 ${
              expenseType === 'ASSET_EQUIPMENT'
                ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">2. Peralatan</span>
          </button>

          <button
            onClick={() => setExpenseType('RAW_PURCHASE')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors text-left flex items-center gap-2 ${
              expenseType === 'RAW_PURCHASE'
                ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. Bahan Baku</span>
          </button>

          <button
            onClick={() => setExpenseType('DIRECT_LABOR')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors text-left flex items-center gap-2 ${
              expenseType === 'DIRECT_LABOR'
                ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">4. Tenaga Kerja</span>
          </button>

          <button
            onClick={() => setExpenseType('OTHER_ASSET_ADD')}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-colors text-left flex items-center gap-2 col-span-2 md:col-span-1 ${
              expenseType === 'OTHER_ASSET_ADD'
                ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">5. Aset Lainnya</span>
          </button>
        </div>
      </div>

      {/* Input Form with Subtype Information Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              {currentInfo.title}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{currentInfo.desc}</p>
          <div className="mt-2 text-[11px] font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 inline-block">
            Mutasi Otomatis: {currentInfo.mutations}
          </div>
        </div>

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
                Tanggal Pengeluaran <span className="text-amber-400">*</span>
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
                Kategori Transaksi
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
              >
                <option value="">-- Pilih Kategori --</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nominal Kas Keluar (Rp) <span className="text-amber-400">*</span>
              </label>
              <NominalInput
                min={1}
                value={amount}
                onChange={val => setAmount(val)}
                placeholder="Contoh: 1.500.000"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Keterangan Rinci Pengeluaran <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: Pembayaran listrik workshop PLN / Upah sablon 500 pcs / Pengadaan pisau cetak..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Posting Pengeluaran Kas
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Riwayat Transaksi Pengeluaran
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh pengeluaran mengurangi kas dan memperbarui akun tujuan
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {expenseTransactions.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3">No. Bukti</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Jenis Transaksi</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3 text-right">Nominal Kas Keluar</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenseTransactions.map(tx => {
                const isCancelled = tx.status === 'CANCELLED';
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
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      {tx.transactionType}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {tx.categoryNameSnapshot || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                      {tx.description}
                      {isCancelled && tx.cancellationReason && (
                        <span className="block text-[11px] text-red-400 italic">
                          Dibatalkan: {tx.cancellationReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-100 whitespace-nowrap">
                      {formatRupiah(tx.totalAmount)}
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
                          title="Cetak Bukti Kas Keluar (BKK)"
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
