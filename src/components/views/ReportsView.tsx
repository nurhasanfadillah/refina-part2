import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, formatDateIndo, exportToCSV, getPeriodDateRange } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  FileCheck,
  Check
} from 'lucide-react';
import { DateFilter } from '../../types';
import { ReportPrintModal } from '../common/ReportPrintModal';

export const ReportsView: React.FC = () => {
  const {
    dateFilter,
    setDateFilter,
    getProfitAndLossReport,
    getAssetBalanceReport,
    getCashMovementsReport,
    getCustomerReceivableReport,
    getInventoryReport
  } = useFinancial();

  const [activeReportTab, setActiveReportTab] = useState<
    'PNL' | 'ASSETS' | 'CASH_FLOW' | 'RECEIVABLES' | 'INVENTORY'
  >('PNL');
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [isReportPrintModalOpen, setIsReportPrintModalOpen] = useState(false);
  const [reportPrintMode, setReportPrintMode] = useState<'SINGLE' | 'ALL'>('SINGLE');

  const [showCustomRangeInputs, setShowCustomRangeInputs] = useState(dateFilter.preset === 'custom');
  const [customStartDate, setCustomStartDate] = useState(dateFilter.startDate || '2026-10-01');
  const [customEndDate, setCustomEndDate] = useState(dateFilter.endDate || '2026-10-31');

  const pnl = getProfitAndLossReport();
  const assets = getAssetBalanceReport();
  const cashMovements = getCashMovementsReport();
  const arReports = getCustomerReceivableReport();
  const inventory = getInventoryReport();

  // Helper for human-readable filter period label
  const getFilterPeriodLabel = () => {
    return getPeriodDateRange(dateFilter).label;
  };

  const getReportTitle = (tab: typeof activeReportTab) => {
    switch (tab) {
      case 'PNL':
        return 'LAPORAN LABA RUGI OPERASIONAL';
      case 'ASSETS':
        return 'LAPORAN SALDO SELURUH ASET PERUSAHAAN';
      case 'CASH_FLOW':
        return 'BUKU MUTASI KAS BERJALAN (LEDGER)';
      case 'RECEIVABLES':
        return 'LAPORAN REKAPITULASI PIUTANG PELANGGAN';
      case 'INVENTORY':
        return 'LAPORAN REKONSILIASI PERSEDIAAN NOMINAL';
    }
  };

  // Handle Preset Changes
  const handlePresetChange = (preset: DateFilter['preset']) => {
    setDateFilter({
      preset,
      startDate: '',
      endDate: ''
    });
  };

  const handlePrintCurrent = () => {
    setReportPrintMode('SINGLE');
    setIsReportPrintModalOpen(true);
  };

  const handlePrintAll = () => {
    setReportPrintMode('ALL');
    setIsReportPrintModalOpen(true);
  };

  // CSV Export for each report tab
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (activeReportTab === 'PNL') {
      const headers = ['Komponen Laba Rugi', 'Nominal (Rupiah)', 'Keterangan'];
      const rows = [
        ['Pendapatan Penjualan', pnl.revenue, 'Akun R01'],
        ['HPP Penjualan', pnl.hpp, 'Akun R02'],
        ['Laba Kotor', pnl.grossProfit, 'Pendapatan - HPP'],
        ['Beban Operasional Umum', pnl.operationalExpenses, 'Akun B01'],
        ['Beban Penyesuaian', pnl.adjustmentExpenses, 'Akun B02'],
        ['Total Beban', pnl.totalExpenses, 'B01 + B02'],
        ['Laba Bersih Sederhana', pnl.netProfit, 'Laba Kotor - Total Beban']
      ];
      exportToCSV(`REDONE_FINANCE_Laba_Rugi_${timestamp}`, headers, rows);
    } else if (activeReportTab === 'ASSETS') {
      const headers = ['Kode Akun', 'Nama Akun Aset', 'Kelompok', 'Saldo Nominal (Rp)'];
      const rows = [
        ['A01', 'Kas Operasional', 'Aset Lancar', assets.cash],
        ['A02', 'Piutang Usaha Pelanggan', 'Aset Lancar', assets.receivables],
        ['A03', 'Persediaan Bahan Baku', 'Aset Persediaan', assets.rawMaterials],
        ['A04', 'Persediaan Barang Jadi', 'Aset Persediaan', assets.finishedGoods],
        ['A05', 'Aset Peralatan & Mesin', 'Aset Tetap', assets.equipment],
        ['A06', 'Aset Lainnya', 'Aset Lainnya', assets.otherAssets],
        ['TOTAL', 'Total Nilai Aset Perusahaan', 'Semua Kelompok Aset', assets.totalAssets]
      ];
      exportToCSV(`REDONE_FINANCE_Saldo_Aset_${timestamp}`, headers, rows);
    } else if (activeReportTab === 'CASH_FLOW') {
      const headers = ['Tanggal', 'No. Transaksi', 'Keterangan', 'Kas Masuk (Rp)', 'Kas Keluar (Rp)', 'Saldo Berjalan (Rp)'];
      const rows = cashMovements.map(m => [
        m.date,
        m.transactionNo,
        m.description,
        m.cashIn,
        m.cashOut,
        m.runningBalance
      ]);
      exportToCSV(`REDONE_FINANCE_Mutasi_Kas_${timestamp}`, headers, rows);
    } else if (activeReportTab === 'RECEIVABLES') {
      const headers = ['ID Customer', 'Nama Customer', 'Telepon', 'Penambahan Piutang', 'Pembayaran Masuk', 'Sisa Saldo Piutang'];
      const rows = arReports.map(c => [
        c.customerId,
        c.customerName,
        c.customerPhone,
        c.additions,
        c.reductions,
        c.endingBalance
      ]);
      exportToCSV(`REDONE_FINANCE_Laporan_Piutang_${timestamp}`, headers, rows);
    } else if (activeReportTab === 'INVENTORY') {
      const headers = ['Kelompok Persediaan', 'Komponen Aliran Nominal', 'Nilai Nominal (Rp)'];
      const rows = [
        ['Bahan Baku (A03)', 'Saldo Awal', inventory.rawMaterials.opening],
        ['Bahan Baku (A03)', 'Pembelian Bahan Baku', inventory.rawMaterials.purchases],
        ['Bahan Baku (A03)', 'Konversi ke Barang Jadi', -inventory.rawMaterials.usedInFinishedGoods],
        ['Bahan Baku (A03)', 'Penyesuaian Opname', inventory.rawMaterials.opnameAdjustment],
        ['Bahan Baku (A03)', 'Saldo Akhir Bahan Baku', inventory.rawMaterials.ending],
        ['Barang Jadi (A04)', 'Saldo Awal', inventory.finishedGoods.opening],
        ['Barang Jadi (A04)', 'Input Barang Jadi (Konversi)', inventory.finishedGoods.produced],
        ['Barang Jadi (A04)', 'Biaya Tenaga Kerja Langsung', inventory.finishedGoods.directLabor],
        ['Barang Jadi (A04)', 'HPP Penjualan Terjual', -inventory.finishedGoods.soldHpp],
        ['Barang Jadi (A04)', 'Penyesuaian Opname', inventory.finishedGoods.opnameAdjustment],
        ['Barang Jadi (A04)', 'Saldo Akhir Barang Jadi', inventory.finishedGoods.ending]
      ];
      exportToCSV(`REDONE_FINANCE_Laporan_Persediaan_${timestamp}`, headers, rows);
    }
  };

  // Reusable Print Letterhead
  const renderLetterhead = (title: string) => (
    <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
            PT. REDONE BERKAH MANDIRI UTAMA
          </h1>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-0.5">
            REDONE FINANCE · SISTEM MANAJEMEN KEUANGAN OPERASIONAL
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
            Kawasan Bisnis Niaga No. 88, Jakarta Selatan · Telp: (021) 789-0123 · Email: finance@redone.co.id
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-mono font-bold text-slate-950 bg-slate-100 px-3 py-1 rounded border border-slate-300 inline-block uppercase">
            {title}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Periode: <strong className="text-slate-900">{getFilterPeriodLabel()}</strong>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Dicetak: {formatDateIndo(new Date().toISOString().split('T')[0])}
          </div>
        </div>
      </div>
    </div>
  );

  // Reusable 3-Column Formal Authorization Block
  const renderSignatures = () => (
    <div className="hidden print:grid grid-cols-3 gap-6 text-center text-xs pt-6 mt-8 border-t border-dashed border-slate-400 print-avoid-break">
      <div>
        <p className="text-slate-600 font-medium mb-14">Dibuat Oleh,</p>
        <p className="font-bold text-slate-950 border-t border-slate-900 pt-1.5 inline-block min-w-[130px]">
          Staf Keuangan
        </p>
        <span className="block text-[10px] text-slate-500 mt-0.5">Pelaksana Pembukuan</span>
      </div>
      <div>
        <p className="text-slate-600 font-medium mb-14">Diperiksa Oleh,</p>
        <p className="font-bold text-slate-950 border-t border-slate-900 pt-1.5 inline-block min-w-[130px]">
          Supervisor Akuntansi
        </p>
        <span className="block text-[10px] text-slate-500 mt-0.5">Verifikator Saldo</span>
      </div>
      <div>
        <p className="text-slate-600 font-medium mb-14">Disetujui Oleh,</p>
        <p className="font-bold text-slate-950 border-t border-slate-900 pt-1.5 inline-block min-w-[130px]">
          Direktur Keuangan
        </p>
        <span className="block text-[10px] text-slate-500 mt-0.5">PT. Redone Berkah Mandiri Utama</span>
      </div>
    </div>
  );

  // Section 9.1 Content
  const renderPnlContent = () => (
    <div className="space-y-6 print:text-slate-950">
      <div className="border-b border-slate-800 pb-3 print:hidden">
        <h2 className="text-base font-bold text-slate-100">
          Laporan Laba Rugi Sederhana (Bab 9.1)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Formula: Laba Kotor = Pendapatan − HPP · Laba Bersih = Pendapatan − HPP − Beban
        </p>
      </div>

      <div className="max-w-2xl divide-y divide-slate-800 print:divide-slate-300 text-xs print:border print:border-slate-300 print:p-4 print:rounded-md">
        <div className="py-2.5 flex justify-between font-semibold text-slate-200 print:text-slate-900">
          <span>Pendapatan Penjualan (R01):</span>
          <span className="font-mono text-emerald-400 print:text-emerald-700 text-sm font-bold">
            {formatRupiah(pnl.revenue)}
          </span>
        </div>
        <div className="py-2.5 flex justify-between text-slate-300 print:text-slate-800">
          <span className="pl-4">HPP Penjualan (R02):</span>
          <span className="font-mono text-red-400 print:text-red-700 font-semibold">
            -{formatRupiah(pnl.hpp)}
          </span>
        </div>
        <div className="py-3 flex justify-between font-bold text-slate-100 bg-slate-950/60 px-3 rounded print:bg-slate-100 print:text-slate-950 print:border print:border-slate-300">
          <span>Laba Kotor Perusahaan:</span>
          <span className="font-mono text-emerald-400 print:text-emerald-700 text-base">
            {formatRupiah(pnl.grossProfit)}
          </span>
        </div>

        <div className="py-2.5 flex justify-between font-semibold text-slate-200 print:text-slate-900 pt-4">
          <span>Beban-Beban Operasional:</span>
          <span></span>
        </div>
        <div className="py-2 flex justify-between text-slate-300 print:text-slate-800 pl-4">
          <span>Beban Operasional Umum (B01):</span>
          <span className="font-mono text-slate-300 print:text-slate-900">
            {formatRupiah(pnl.operationalExpenses)}
          </span>
        </div>
        <div className="py-2 flex justify-between text-slate-300 print:text-slate-800 pl-4">
          <span>Beban Penyesuaian (B02):</span>
          <span className="font-mono text-slate-300 print:text-slate-900">
            {formatRupiah(pnl.adjustmentExpenses)}
          </span>
        </div>
        <div className="py-2.5 flex justify-between text-slate-300 print:text-slate-800 font-medium">
          <span>Total Pengeluaran Beban:</span>
          <span className="font-mono text-red-400 print:text-red-700 font-bold">
            -{formatRupiah(pnl.totalExpenses)}
          </span>
        </div>

        <div className="py-4 flex justify-between font-bold text-slate-100 bg-amber-400/10 border border-amber-400/30 p-4 rounded-md print:bg-slate-100 print:border-2 print:border-slate-900 print:text-slate-950">
          <span className="text-sm">Laba Bersih Sederhana:</span>
          <span
            className={`font-mono text-lg font-black ${
              pnl.netProfit >= 0 ? 'text-amber-400 print:text-emerald-700' : 'text-red-400 print:text-red-700'
            }`}
          >
            {formatRupiah(pnl.netProfit)}
          </span>
        </div>
      </div>
    </div>
  );

  // Section 9.2 Content
  const renderAssetsContent = () => (
    <div className="space-y-6 print:text-slate-950">
      <div className="border-b border-slate-800 pb-3 print:hidden">
        <h2 className="text-base font-bold text-slate-100">
          Laporan Saldo Seluruh Aset Perusahaan (Bab 9.2)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Struktur saldo riil akun Aset A01 s/d A06 berbasis mutasi berjalan
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs print:border print:border-slate-300">
          <thead>
            <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-800 text-left print:bg-slate-100">
              <th className="py-2.5 px-3">Kode Akun</th>
              <th className="py-2.5 px-3">Nama Akun Aset</th>
              <th className="py-2.5 px-3">Kelompok</th>
              <th className="py-2.5 px-3 text-right">Saldo Nominal Terkini</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 print:divide-slate-300">
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-3 font-mono text-emerald-400 print:text-slate-900 font-bold">A01</td>
              <td className="py-3 px-3 font-medium text-slate-100 print:text-slate-900">Kas Operasional</td>
              <td className="py-3 px-3 text-slate-400 print:text-slate-600">Aset Lancar</td>
              <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 print:text-slate-900">
                {formatRupiah(assets.cash)}
              </td>
            </tr>
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-3 font-mono text-amber-400 print:text-slate-900 font-bold">A02</td>
              <td className="py-3 px-3 font-medium text-slate-100 print:text-slate-900">Piutang Usaha Pelanggan</td>
              <td className="py-3 px-3 text-slate-400 print:text-slate-600">Aset Lancar</td>
              <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 print:text-slate-900">
                {formatRupiah(assets.receivables)}
              </td>
            </tr>
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-3 font-mono text-blue-400 print:text-slate-900 font-bold">A03</td>
              <td className="py-3 px-3 font-medium text-slate-100 print:text-slate-900">Persediaan Bahan Baku</td>
              <td className="py-3 px-3 text-slate-400 print:text-slate-600">Aset Persediaan</td>
              <td className="py-3 px-3 text-right font-mono font-bold text-blue-400 print:text-slate-900">
                {formatRupiah(assets.rawMaterials)}
              </td>
            </tr>
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-3 font-mono text-cyan-400 print:text-slate-900 font-bold">A04</td>
              <td className="py-3 px-3 font-medium text-slate-100 print:text-slate-900">Persediaan Barang Jadi</td>
              <td className="py-3 px-3 text-slate-400 print:text-slate-600">Aset Persediaan</td>
              <td className="py-3 px-3 text-right font-mono font-bold text-cyan-400 print:text-slate-900">
                {formatRupiah(assets.finishedGoods)}
              </td>
            </tr>
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-3 font-mono text-indigo-400 print:text-slate-900 font-bold">A05</td>
              <td className="py-3 px-3 font-medium text-slate-100 print:text-slate-900">Aset Peralatan & Mesin</td>
              <td className="py-3 px-3 text-slate-400 print:text-slate-600">Aset Tetap</td>
              <td className="py-3 px-3 text-right font-mono font-bold text-slate-200 print:text-slate-900">
                {formatRupiah(assets.equipment)}
              </td>
            </tr>
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-3 font-mono text-purple-400 print:text-slate-900 font-bold">A06</td>
              <td className="py-3 px-3 font-medium text-slate-100 print:text-slate-900">Aset Lainnya (Penampung Opname)</td>
              <td className="py-3 px-3 text-slate-400 print:text-slate-600">Aset Lainnya</td>
              <td className="py-3 px-3 text-right font-mono font-bold text-slate-200 print:text-slate-900">
                {formatRupiah(assets.otherAssets)}
              </td>
            </tr>
            <tr className="bg-slate-950 print:bg-slate-100 font-bold text-slate-100 print:text-slate-950 border-t-2 border-slate-700 print:border-slate-900">
              <td colSpan={3} className="py-3.5 px-3 text-sm">
                TOTAL NILAI SELURUH ASET PERUSAHAAN
              </td>
              <td className="py-3.5 px-3 text-right font-mono text-base text-amber-400 print:text-slate-950 font-black">
                {formatRupiah(assets.totalAssets)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Section 9.3 Content
  const renderCashFlowContent = () => (
    <div className="space-y-6 print:text-slate-950">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Laporan Mutasi Kas Berjalan (Bab 9.3)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buku kas detail dengan running balance per setiap transaksi masuk dan keluar
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Saldo Kas Saat Ini:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatRupiah(assets.cash)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs print:border print:border-slate-300">
          <thead>
            <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-800 text-left print:bg-slate-100">
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3">No. Transaksi</th>
              <th className="py-2.5 px-3">Keterangan</th>
              <th className="py-2.5 px-3 text-right">Kas Masuk</th>
              <th className="py-2.5 px-3 text-right">Kas Keluar</th>
              <th className="py-2.5 px-3 text-right">Saldo Berjalan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 print:divide-slate-300">
            {cashMovements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-500">
                  Tidak ada riwayat mutasi kas pada periode ini
                </td>
              </tr>
            ) : (
              cashMovements.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 print:text-slate-800">
                    {formatDateIndo(row.date)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-400 print:text-slate-900 font-semibold whitespace-nowrap">
                    {row.transactionNo}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 print:text-slate-800">{row.description}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400 print:text-emerald-700 whitespace-nowrap">
                    {row.cashIn > 0 ? formatRupiah(row.cashIn) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-400 print:text-red-700 whitespace-nowrap">
                    {row.cashOut > 0 ? formatRupiah(row.cashOut) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100 print:text-slate-950 whitespace-nowrap">
                    {formatRupiah(row.runningBalance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Section 9.4 Content
  const renderReceivablesContent = () => (
    <div className="space-y-6 print:text-slate-950">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Laporan Rekapitulasi Piutang Pelanggan (Bab 9.4)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buku pembantu piutang per customer: Penambahan vs Pengurangan
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Total Piutang Beredar:</span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            {formatRupiah(assets.receivables)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs print:border print:border-slate-300">
          <thead>
            <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-800 text-left print:bg-slate-100">
              <th className="py-2.5 px-3">Kode Customer</th>
              <th className="py-2.5 px-3">Nama Customer</th>
              <th className="py-2.5 px-3">Nomor Telepon</th>
              <th className="py-2.5 px-3 text-right">Penambahan Piutang</th>
              <th className="py-2.5 px-3 text-right">Pembayaran Masuk</th>
              <th className="py-2.5 px-3 text-right">Sisa Saldo Piutang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 print:divide-slate-300">
            {arReports.map(c => (
              <tr key={c.customerId} className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-mono text-slate-400 print:text-slate-700">{c.customerId}</td>
                <td className="py-3 px-3 font-semibold text-slate-200 print:text-slate-900">{c.customerName}</td>
                <td className="py-3 px-3 text-slate-400 print:text-slate-600">{c.customerPhone || '-'}</td>
                <td className="py-3 px-3 text-right font-mono text-amber-400 print:text-slate-800">
                  {formatRupiah(c.additions)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 print:text-slate-800">
                  {formatRupiah(c.reductions)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-100 print:text-slate-950">
                  <span className={c.endingBalance > 0 ? 'text-amber-400 print:text-slate-950' : 'text-slate-400'}>
                    {formatRupiah(c.endingBalance)}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-slate-950 print:bg-slate-100 font-bold border-t-2 border-slate-700 print:border-slate-900 text-slate-100 print:text-slate-950">
              <td colSpan={3} className="py-3 px-3">
                TOTAL SELURUH PIUTANG BEREDAR
              </td>
              <td className="py-3 px-3 text-right font-mono text-amber-400 print:text-slate-950">
                {formatRupiah(arReports.reduce((acc, c) => acc + c.additions, 0))}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-400 print:text-slate-950">
                {formatRupiah(arReports.reduce((acc, c) => acc + c.reductions, 0))}
              </td>
              <td className="py-3 px-3 text-right font-mono text-amber-400 print:text-slate-950 font-black">
                {formatRupiah(assets.receivables)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Section 9.5 Content
  const renderInventoryContent = () => (
    <div className="space-y-6 print:text-slate-950">
      <div className="border-b border-slate-800 pb-3 print:hidden">
        <h2 className="text-base font-bold text-slate-100">
          Laporan Persediaan Nominal (Bab 9.5)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Pengelolaan nilai nominal rupiah Bahan Baku (A03) dan Barang Jadi (A04)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bahan Baku Breakdown */}
        <div className="bg-slate-950 print:bg-white border border-slate-800 print:border-slate-300 rounded-md p-4 print-avoid-break">
          <h3 className="text-xs font-bold text-blue-400 print:text-slate-950 uppercase tracking-wide mb-3 pb-2 border-b border-slate-800 print:border-slate-300">
            Persediaan Bahan Baku (A03)
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400 print:text-slate-600">Saldo Awal Modal:</span>
              <span className="font-mono text-slate-200 print:text-slate-900">
                {formatRupiah(inventory.rawMaterials.opening)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-emerald-400 print:text-emerald-700 font-medium">+ Pembelian Bahan Baku:</span>
              <span className="font-mono text-emerald-400 print:text-emerald-700 font-bold">
                {formatRupiah(inventory.rawMaterials.purchases)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-amber-400 print:text-red-700 font-medium">- Konversi ke Barang Jadi:</span>
              <span className="font-mono text-amber-400 print:text-red-700 font-bold">
                -{formatRupiah(inventory.rawMaterials.usedInFinishedGoods)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 print:text-slate-600">Penyesuaian Opname Fisik:</span>
              <span className="font-mono text-slate-200 print:text-slate-900 font-semibold">
                {inventory.rawMaterials.opnameAdjustment >= 0 ? '+' : ''}
                {formatRupiah(inventory.rawMaterials.opnameAdjustment)}
              </span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-slate-800 print:border-slate-900 font-bold text-slate-100 print:text-slate-950">
              <span>Saldo Akhir Bahan Baku:</span>
              <span className="font-mono text-blue-400 print:text-slate-950 text-sm font-black">
                {formatRupiah(inventory.rawMaterials.ending)}
              </span>
            </div>
          </div>
        </div>

        {/* Barang Jadi Breakdown */}
        <div className="bg-slate-950 print:bg-white border border-slate-800 print:border-slate-300 rounded-md p-4 print-avoid-break">
          <h3 className="text-xs font-bold text-cyan-400 print:text-slate-950 uppercase tracking-wide mb-3 pb-2 border-b border-slate-800 print:border-slate-300">
            Persediaan Barang Jadi (A04)
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400 print:text-slate-600">Saldo Awal Modal:</span>
              <span className="font-mono text-slate-200 print:text-slate-900">
                {formatRupiah(inventory.finishedGoods.opening)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-cyan-400 print:text-emerald-700 font-medium">+ Input Barang Jadi (Konversi):</span>
              <span className="font-mono text-cyan-400 print:text-emerald-700 font-bold">
                {formatRupiah(inventory.finishedGoods.produced)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-purple-400 print:text-emerald-700 font-medium">+ Biaya Tenaga Kerja Langsung:</span>
              <span className="font-mono text-purple-400 print:text-emerald-700 font-bold">
                {formatRupiah(inventory.finishedGoods.directLabor)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-amber-400 print:text-red-700 font-medium">- HPP Penjualan (Terjual):</span>
              <span className="font-mono text-amber-400 print:text-red-700 font-bold">
                -{formatRupiah(inventory.finishedGoods.soldHpp)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 print:text-slate-600">Penyesuaian Opname Fisik:</span>
              <span className="font-mono text-slate-200 print:text-slate-900 font-semibold">
                {inventory.finishedGoods.opnameAdjustment >= 0 ? '+' : ''}
                {formatRupiah(inventory.finishedGoods.opnameAdjustment)}
              </span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-slate-800 print:border-slate-900 font-bold text-slate-100 print:text-slate-950">
              <span>Saldo Akhir Barang Jadi:</span>
              <span className="font-mono text-cyan-400 print:text-slate-950 text-sm font-black">
                {formatRupiah(inventory.finishedGoods.ending)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header (Hidden in Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              MODUL 6: LAPORAN KEUANGAN & AUDIT EKSEKUTIF
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Pusat Laporan & Ekspor Dokumen Resmi
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Seluruh laporan dihasilkan langsung dari mutasi transaksi bertanda atomik.
              Dukungan cetak dokumen berkop resmi PT. REDONE BERKAH MANDIRI UTAMA dan ekspor data CSV.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh CSV
            </button>
            <button
              onClick={handlePrintCurrent}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
              title="Cetak modul laporan yang sedang aktif"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Cetak Laporan Aktif
            </button>
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-xs cursor-pointer"
              title="Cetak seluruh 5 laporan dalam satu dokumen bundel lengkap"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Cetak Kompilasi Lengkap
            </button>
          </div>
        </div>
      </div>

      {/* Date Filter Bar (Hidden in Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200">
              Filter Periode Laporan:
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {getFilterPeriodLabel()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setShowCustomRangeInputs(false);
                handlePresetChange('all');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                dateFilter.preset === 'all'
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua Periode
            </button>
            <button
              onClick={() => {
                setShowCustomRangeInputs(false);
                handlePresetChange('this_month');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                dateFilter.preset === 'this_month'
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => {
                setShowCustomRangeInputs(false);
                handlePresetChange('last_month');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                dateFilter.preset === 'last_month'
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
              title="Filter transaksi bulan lalu (Oktober 2026 - Data Demo)"
            >
              Bulan Lalu (Okt 2026)
            </button>
            <button
              onClick={() => {
                setShowCustomRangeInputs(false);
                handlePresetChange('this_year');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                dateFilter.preset === 'this_year'
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tahun Ini (2026)
            </button>
            <button
              onClick={() => {
                setShowCustomRangeInputs(false);
                handlePresetChange('today');
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                dateFilter.preset === 'today'
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setShowCustomRangeInputs(!showCustomRangeInputs)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                dateFilter.preset === 'custom' || showCustomRangeInputs
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Rentang Kustom...
            </button>
          </div>
        </div>

        {/* Custom Date Range Inputs Box */}
        {showCustomRangeInputs && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs bg-slate-950/60 p-3 rounded-md">
            <span className="text-slate-400 font-medium">Pilih Rentang Tanggal:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Mulai:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sampai:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs font-mono focus:border-amber-400 outline-none"
              />
            </div>
            <button
              onClick={() => {
                setDateFilter({
                  preset: 'custom',
                  startDate: customStartDate,
                  endDate: customEndDate
                });
              }}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Terapkan Filter
            </button>
          </div>
        )}
      </div>

      {/* Report Type Tabs (Hidden in Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 no-print">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
          <button
            onClick={() => setActiveReportTab('PNL')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors text-center cursor-pointer ${
              activeReportTab === 'PNL'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            9.1 Laba Rugi
          </button>
          <button
            onClick={() => setActiveReportTab('ASSETS')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors text-center cursor-pointer ${
              activeReportTab === 'ASSETS'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            9.2 Saldo Aset
          </button>
          <button
            onClick={() => setActiveReportTab('CASH_FLOW')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors text-center cursor-pointer ${
              activeReportTab === 'CASH_FLOW'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            9.3 Mutasi Kas
          </button>
          <button
            onClick={() => setActiveReportTab('RECEIVABLES')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors text-center cursor-pointer ${
              activeReportTab === 'RECEIVABLES'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            9.4 Piutang Customer
          </button>
          <button
            onClick={() => setActiveReportTab('INVENTORY')}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors text-center col-span-2 md:col-span-1 cursor-pointer ${
              activeReportTab === 'INVENTORY'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            9.5 Persediaan
          </button>
        </div>
      </div>

      {/* Main Report Content Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 print:border-none print:bg-white print:p-0 print:m-0">
        {!isPrintingAll ? (
          /* Single Tab Print Mode */
          <div>
            {renderLetterhead(getReportTitle(activeReportTab))}
            {activeReportTab === 'PNL' && renderPnlContent()}
            {activeReportTab === 'ASSETS' && renderAssetsContent()}
            {activeReportTab === 'CASH_FLOW' && renderCashFlowContent()}
            {activeReportTab === 'RECEIVABLES' && renderReceivablesContent()}
            {activeReportTab === 'INVENTORY' && renderInventoryContent()}
            {renderSignatures()}
          </div>
        ) : (
          /* Complete Financial Package Print Mode (All 5 Reports) */
          <div className="space-y-12">
            {/* Section 1: PnL */}
            <div className="print-avoid-break">
              {renderLetterhead('LAPORAN LABA RUGI OPERASIONAL')}
              {renderPnlContent()}
              {renderSignatures()}
            </div>

            {/* Section 2: Assets */}
            <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
              {renderLetterhead('LAPORAN SALDO SELURUH ASET')}
              {renderAssetsContent()}
              {renderSignatures()}
            </div>

            {/* Section 3: Cash Flow */}
            <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
              {renderLetterhead('BUKU MUTASI KAS BERJALAN')}
              {renderCashFlowContent()}
              {renderSignatures()}
            </div>

            {/* Section 4: Receivables */}
            <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
              {renderLetterhead('LAPORAN REKAPITULASI PIUTANG PELANGGAN')}
              {renderReceivablesContent()}
              {renderSignatures()}
            </div>

            {/* Section 5: Inventory */}
            <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
              {renderLetterhead('LAPORAN REKONSILIASI PERSEDIAAN NOMINAL')}
              {renderInventoryContent()}
              {renderSignatures()}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Report Print & PDF Preview Modal */}
      <ReportPrintModal
        isOpen={isReportPrintModalOpen}
        onClose={() => setIsReportPrintModalOpen(false)}
        mode={reportPrintMode}
        activeReportTab={activeReportTab}
        periodLabel={getFilterPeriodLabel()}
        pnl={pnl}
        assets={assets}
        cashMovements={cashMovements}
        arReports={arReports}
        inventory={inventory}
      />
    </div>
  );
};
