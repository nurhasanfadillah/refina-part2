import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, formatDateIndo, getPeriodDateRange } from '../../utils/formatters';
import {
  Wallet,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Printer,
  Ban,
  Clock,
  Building2,
  FileText,
  Calendar
} from 'lucide-react';
import { Transaction } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { CancelModal } from '../common/CancelModal';

export const DashboardView: React.FC = () => {
  const {
    getProfitAndLossReport,
    getAssetBalanceReport,
    transactions,
    dateFilter,
    setActiveView,
    cancelTransaction
  } = useFinancial();

  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);
  const [selectedTxForCancel, setSelectedTxForCancel] = useState<Transaction | null>(null);

  const pnl = getProfitAndLossReport();
  const assets = getAssetBalanceReport();

  const recentTransactions = transactions.slice(0, 7);

  const handleConfirmCancel = (reason: string) => {
    if (selectedTxForCancel) {
      cancelTransaction(selectedTxForCancel.id, reason);
      setSelectedTxForCancel(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Company Header & Mission Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              PT. REDONE BERKAH MANDIRI UTAMA
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Pusat Kendali Aliran Nominal & Keuangan Operasional
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Sistem pencatatan single-entry berbasis nominal rupiah. Seluruh transaksi penjualan,
              pengeluaran, konversi persediaan, dan pembayaran termutasi otomatis secara atomik.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Periode Aktif:</span>
                <span className="font-semibold text-amber-400 font-mono">
                  {getPeriodDateRange(dateFilter).label}
                </span>
              </div>
              <button
                onClick={() => setActiveView('reports')}
                className="text-xs text-slate-400 hover:text-amber-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Ubah Periode di Laporan →
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setActiveView('sales')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              Input Penjualan
            </button>
            <button
              onClick={() => setActiveView('expenses')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Input Pengeluaran
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Grid (60-30-10, Tabular Numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Kas (A01) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Saldo Kas (A01)</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-2">
            {formatRupiah(assets.cash)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Kas operasional aktif</div>
        </div>

        {/* Piutang Usaha (A02) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Total Piutang (A02)</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-2">
            {formatRupiah(assets.receivables)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Tertagih dari customer</div>
        </div>

        {/* Nilai Persediaan (A03 + A04) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Persediaan (A03+A04)</span>
            <Package className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-bold font-mono text-blue-400 mt-2">
            {formatRupiah(assets.rawMaterials + assets.finishedGoods)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Bahan Baku & Barang Jadi</div>
        </div>

        {/* Aset Peralatan & Lainnya (A05 + A06) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Peralatan & Aset</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-2">
            {formatRupiah(assets.equipment + assets.otherAssets)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">A05 & A06 perusahaan</div>
        </div>

        {/* Laba Kotor (Pendapatan - HPP) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Laba Kotor</span>
            <span className="text-[10px] font-mono text-slate-400">R01-R02</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-2">
            {formatRupiah(pnl.grossProfit)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Margin penjualan</div>
        </div>

        {/* Laba Bersih Sederhana */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Laba Bersih</span>
            <span className="text-[10px] font-mono text-amber-400">NET</span>
          </div>
          <div
            className={`text-lg font-bold font-mono mt-2 ${
              pnl.netProfit >= 0 ? 'text-amber-400' : 'text-red-400'
            }`}
          >
            {formatRupiah(pnl.netProfit)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Setelah beban operasional</div>
        </div>
      </div>

      {/* Mid Section: Financial Flow Chart Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Nominal Stream Ledger Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Distribusi Nilai Nominal Akun Aset
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Nilai Seluruh Aset Perusahaan:{' '}
                <span className="font-mono font-bold text-slate-200">
                  {formatRupiah(assets.totalAssets)}
                </span>
              </p>
            </div>
            <button
              onClick={() => setActiveView('reports')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Lihat Laporan Lengkap
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nominal Breakdown Bars */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Kas Operasional (A01)</span>
                <span className="font-mono text-emerald-400">
                  {formatRupiah(assets.cash)} (
                  {assets.totalAssets > 0
                    ? ((assets.cash / assets.totalAssets) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{
                    width: `${assets.totalAssets > 0 ? (assets.cash / assets.totalAssets) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Piutang Usaha Pelanggan (A02)</span>
                <span className="font-mono text-amber-400">
                  {formatRupiah(assets.receivables)} (
                  {assets.totalAssets > 0
                    ? ((assets.receivables / assets.totalAssets) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{
                    width: `${assets.totalAssets > 0 ? (assets.receivables / assets.totalAssets) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Persediaan Bahan Baku (A03)</span>
                <span className="font-mono text-blue-400">
                  {formatRupiah(assets.rawMaterials)} (
                  {assets.totalAssets > 0
                    ? ((assets.rawMaterials / assets.totalAssets) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{
                    width: `${assets.totalAssets > 0 ? (assets.rawMaterials / assets.totalAssets) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Persediaan Barang Jadi (A04)</span>
                <span className="font-mono text-cyan-400">
                  {formatRupiah(assets.finishedGoods)} (
                  {assets.totalAssets > 0
                    ? ((assets.finishedGoods / assets.totalAssets) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{
                    width: `${assets.totalAssets > 0 ? (assets.finishedGoods / assets.totalAssets) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Peralatan & Aset Lainnya (A05 + A06)</span>
                <span className="font-mono text-indigo-400">
                  {formatRupiah(assets.equipment + assets.otherAssets)} (
                  {assets.totalAssets > 0
                    ? (((assets.equipment + assets.otherAssets) / assets.totalAssets) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{
                    width: `${
                      assets.totalAssets > 0
                        ? ((assets.equipment + assets.otherAssets) / assets.totalAssets) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Access Shortcuts to 5 Modul REODONE */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100 mb-1">
              Alur Transaksi Cepat
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Pilih modul transaksi sesuai aktivitas operasional hari ini:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => setActiveView('sales')}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-400/10 text-amber-400 rounded-md">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">1. Penjualan Produk</div>
                    <div className="text-[11px] text-slate-500">Otomatis masuk Piutang & potong HPP</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveView('expenses')}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-red-400/10 text-red-400 rounded-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">2. Pengeluaran & Biaya</div>
                    <div className="text-[11px] text-slate-500">Beban, Peralatan, Bahan, Tenaga Kerja</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveView('inventory')}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-400/10 text-blue-400 rounded-md">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">3. Input Barang Jadi</div>
                    <div className="text-[11px] text-slate-500">Konversi nominal Bahan ke Barang Jadi</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveView('finance')}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-400/10 text-emerald-400 rounded-md">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">4. Pembayaran Customer</div>
                    <div className="text-[11px] text-slate-500">Kas masuk pelunasan piutang</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveView('opname')}
                className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-400/10 text-purple-400 rounded-md">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">5. Opname & Penyesuaian</div>
                    <div className="text-[11px] text-slate-500">Rekonsiliasi saldo aktual vs sistem</div>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Operational Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Riwayat Transaksi Terbaru
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Snapshot nilai nominal dan mutasi otomatis tersimpan permanen
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} Total Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3 font-semibold">No. Transaksi</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                <th className="py-2.5 px-3 font-semibold">Jenis / Tipe</th>
                <th className="py-2.5 px-3 font-semibold">Keterangan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nominal</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-3">
                      <p className="text-sm font-semibold text-slate-200">
                        Belum Ada Transaksi Tercatat (Buku Kosong / Rp 0)
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Data transaksi telah dikosongkan. Anda dapat mulai mencatat transaksi penjualan, pengeluaran, atau memuat ulang dataset simulasi Indonesia kapan saja.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={() => setActiveView('sales')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
                        >
                          + Input Penjualan Pertama
                        </button>
                        <button
                          onClick={() => setActiveView('expenses')}
                          className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                        >
                          + Input Pengeluaran
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                recentTransactions.map(tx => {
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
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      <span className="text-slate-400 font-mono text-[11px] block">
                        {tx.transactionType}
                      </span>
                      {tx.customerNameSnapshot && (
                        <span className="text-slate-200 font-medium text-[11px]">
                          {tx.customerNameSnapshot}
                        </span>
                      )}
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
                          title="Cetak Bukti Transaksi"
                          className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {!isCancelled && (
                          <button
                            onClick={() => setSelectedTxForCancel(tx)}
                            title="Batalkan Transaksi (Mutasi Pembalik)"
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print and Cancel Modals */}
      <PrintModal
        transaction={selectedTxForPrint}
        onClose={() => setSelectedTxForPrint(null)}
      />

      <CancelModal
        transaction={selectedTxForCancel}
        onConfirm={handleConfirmCancel}
        onClose={() => setSelectedTxForCancel(null)}
      />
    </div>
  );
};
