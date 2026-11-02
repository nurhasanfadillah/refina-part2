import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import {
  Printer,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'SINGLE' | 'ALL';
  activeReportTab: 'PNL' | 'ASSETS' | 'CASH_FLOW' | 'RECEIVABLES' | 'INVENTORY';
  periodLabel: string;
  pnl: {
    revenue: number;
    hpp: number;
    grossProfit: number;
    operationalExpenses: number;
    adjustmentExpenses: number;
    totalExpenses: number;
    netProfit: number;
  };
  assets: {
    cash: number;
    receivables: number;
    rawMaterials: number;
    finishedGoods: number;
    equipment: number;
    otherAssets: number;
    totalAssets: number;
  };
  cashMovements: Array<{
    date: string;
    transactionNo: string;
    description: string;
    cashIn: number;
    cashOut: number;
    runningBalance: number;
  }>;
  arReports: Array<{
    customerId: string;
    customerName: string;
    customerPhone: string;
    additions: number;
    reductions: number;
    endingBalance: number;
  }>;
  inventory: {
    rawMaterials: {
      opening: number;
      purchases: number;
      usedInFinishedGoods: number;
      opnameAdjustment: number;
      ending: number;
    };
    finishedGoods: {
      opening: number;
      produced: number;
      directLabor: number;
      soldHpp: number;
      opnameAdjustment: number;
      ending: number;
    };
  };
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  mode,
  activeReportTab,
  periodLabel,
  pnl,
  assets,
  cashMovements,
  arReports,
  inventory
}) => {
  const printSheetRef = useRef<HTMLDivElement>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('printing-modal');
    }
    return () => {
      document.body.classList.remove('printing-modal');
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessingPdf) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isProcessingPdf]);

  if (!isOpen) return null;

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

  const handlePrintOrSavePDF = async () => {
    if (!printSheetRef.current || isProcessingPdf) return;

    setIsProcessingPdf(true);
    setPdfSuccess(false);

    try {
      // 1. Attempt native browser print dialog in case environment supports it
      try {
        window.focus();
        window.print();
      } catch (printErr) {
        console.warn('Native window.print() not available in current frame context:', printErr);
      }

      // 2. Generate and download a high-definition official A4 PDF document
      const sheetEl = printSheetRef.current;
      const canvas = await html2canvas(sheetEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1080
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfPageWidth = 210; // A4 width in mm
      const pdfPageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add page(s)
      pdf.addImage(imgData, 'JPEG', 0, position, pdfPageWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfPageWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfPageHeight;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename =
        mode === 'ALL'
          ? `REDONE_FINANCE_Kompilasi_Laporan_Lengkap_${timestamp}.pdf`
          : `REDONE_FINANCE_${getReportTitle(activeReportTab).replace(/\s+/g, '_')}_${timestamp}.pdf`;

      pdf.save(filename);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Formal Header with Company Letterhead
  const renderLetterhead = (title: string, code: string) => (
    <div className="mb-6 border-b-2 border-slate-900 pb-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
            PT. REDONE BERKAH MANDIRI UTAMA
          </h1>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-0.5">
            REDONE FINANCE · SISTEM MANAJEMEN KEUANGAN OPERASIONAL
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">
            Kawasan Bisnis Niaga No. 88, Jakarta Selatan · Telp: (021) 789-0123 · Email: finance@redone.co.id
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-mono font-bold text-slate-950 bg-slate-100 px-3 py-1 rounded border border-slate-300 inline-block uppercase">
            {code} · {title}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Periode: <strong className="text-slate-900">{periodLabel}</strong>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Dicetak: {formatDateIndo(new Date().toISOString().split('T')[0])}
          </div>
        </div>
      </div>
    </div>
  );

  // 3-Column Authorization Block
  const renderSignatures = () => (
    <div className="grid grid-cols-3 gap-6 text-center text-xs pt-6 mt-8 border-t border-dashed border-slate-400 print-avoid-break">
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

  // Section 9.1: PnL
  const renderPnl = () => (
    <div className="space-y-4 text-slate-900">
      <div className="text-xs font-semibold text-slate-600 border-b border-slate-200 pb-1">
        Ringkasan Kinerja Aliran Nominal Operasional (Bab 9.1)
      </div>
      <div className="max-w-2xl divide-y divide-slate-300 text-xs border border-slate-300 p-4 rounded-md bg-white">
        <div className="py-2.5 flex justify-between font-semibold text-slate-900">
          <span>Pendapatan Penjualan (R01):</span>
          <span className="font-mono text-emerald-700 text-sm font-bold">
            {formatRupiah(pnl.revenue)}
          </span>
        </div>
        <div className="py-2.5 flex justify-between text-slate-800">
          <span className="pl-4">HPP Penjualan (R02):</span>
          <span className="font-mono text-red-700 font-semibold">
            -{formatRupiah(pnl.hpp)}
          </span>
        </div>
        <div className="py-3 flex justify-between font-bold text-slate-950 bg-slate-100 px-3 rounded border border-slate-300">
          <span>Laba Kotor Perusahaan:</span>
          <span className="font-mono text-emerald-700 text-base">
            {formatRupiah(pnl.grossProfit)}
          </span>
        </div>

        <div className="py-2.5 flex justify-between font-semibold text-slate-900 pt-4">
          <span>Beban-Beban Operasional:</span>
          <span></span>
        </div>
        <div className="py-2 flex justify-between text-slate-800 pl-4">
          <span>Beban Operasional Umum (B01):</span>
          <span className="font-mono text-slate-900">
            {formatRupiah(pnl.operationalExpenses)}
          </span>
        </div>
        <div className="py-2 flex justify-between text-slate-800 pl-4">
          <span>Beban Penyesuaian (B02):</span>
          <span className="font-mono text-slate-900">
            {formatRupiah(pnl.adjustmentExpenses)}
          </span>
        </div>
        <div className="py-2.5 flex justify-between text-slate-800 font-medium">
          <span>Total Pengeluaran Beban:</span>
          <span className="font-mono text-red-700 font-bold">
            -{formatRupiah(pnl.totalExpenses)}
          </span>
        </div>

        <div className="py-4 flex justify-between font-bold text-slate-950 bg-slate-50 border-2 border-slate-900 p-4 rounded-md">
          <span className="text-sm">Laba Bersih Sederhana:</span>
          <span
            className={`font-mono text-lg font-black ${
              pnl.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {formatRupiah(pnl.netProfit)}
          </span>
        </div>
      </div>
    </div>
  );

  // Section 9.2: Assets
  const renderAssets = () => (
    <div className="space-y-4 text-slate-900">
      <div className="text-xs font-semibold text-slate-600 border-b border-slate-200 pb-1">
        Daftar Saldo Riil Akun Aset Perusahaan (Bab 9.2)
      </div>
      <table className="w-full text-xs border border-slate-300">
        <thead>
          <tr className="border-b border-slate-300 text-slate-800 text-left bg-slate-100">
            <th className="py-2 px-3 border border-slate-300 w-24">Kode Akun</th>
            <th className="py-2 px-3 border border-slate-300">Nama Akun Aset</th>
            <th className="py-2 px-3 border border-slate-300 w-36">Kelompok</th>
            <th className="py-2 px-3 border border-slate-300 text-right w-44">Saldo Nominal Terkini</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2.5 px-3 border border-slate-300 font-mono font-bold text-slate-900">A01</td>
            <td className="py-2.5 px-3 border border-slate-300 font-medium text-slate-900">Kas Operasional</td>
            <td className="py-2.5 px-3 border border-slate-300 text-slate-600">Aset Lancar</td>
            <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
              {formatRupiah(assets.cash)}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 border border-slate-300 font-mono font-bold text-slate-900">A02</td>
            <td className="py-2.5 px-3 border border-slate-300 font-medium text-slate-900">Piutang Usaha Pelanggan</td>
            <td className="py-2.5 px-3 border border-slate-300 text-slate-600">Aset Lancar</td>
            <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
              {formatRupiah(assets.receivables)}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 border border-slate-300 font-mono font-bold text-slate-900">A03</td>
            <td className="py-2.5 px-3 border border-slate-300 font-medium text-slate-900">Persediaan Bahan Baku</td>
            <td className="py-2.5 px-3 border border-slate-300 text-slate-600">Aset Persediaan</td>
            <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
              {formatRupiah(assets.rawMaterials)}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 border border-slate-300 font-mono font-bold text-slate-900">A04</td>
            <td className="py-2.5 px-3 border border-slate-300 font-medium text-slate-900">Persediaan Barang Jadi</td>
            <td className="py-2.5 px-3 border border-slate-300 text-slate-600">Aset Persediaan</td>
            <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
              {formatRupiah(assets.finishedGoods)}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 border border-slate-300 font-mono font-bold text-slate-900">A05</td>
            <td className="py-2.5 px-3 border border-slate-300 font-medium text-slate-900">Aset Peralatan & Mesin</td>
            <td className="py-2.5 px-3 border border-slate-300 text-slate-600">Aset Tetap</td>
            <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
              {formatRupiah(assets.equipment)}
            </td>
          </tr>
          <tr>
            <td className="py-2.5 px-3 border border-slate-300 font-mono font-bold text-slate-900">A06</td>
            <td className="py-2.5 px-3 border border-slate-300 font-medium text-slate-900">Aset Lainnya (Penampung Opname)</td>
            <td className="py-2.5 px-3 border border-slate-300 text-slate-600">Aset Lainnya</td>
            <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
              {formatRupiah(assets.otherAssets)}
            </td>
          </tr>
          <tr className="bg-slate-100 font-bold text-slate-950 border-t-2 border-slate-900">
            <td colSpan={3} className="py-3 px-3 border border-slate-300 text-sm">
              TOTAL NILAI SELURUH ASET PERUSAHAAN
            </td>
            <td className="py-3 px-3 border border-slate-300 text-right font-mono text-sm font-black text-slate-950">
              {formatRupiah(assets.totalAssets)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Section 9.3: Cash Flow
  const renderCashFlow = () => (
    <div className="space-y-4 text-slate-900">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 border-b border-slate-200 pb-1">
        <span>Buku Mutasi Kas Berjalan (Bab 9.3)</span>
        <span className="font-mono text-slate-900">
          Saldo Kas Saat Ini: <strong>{formatRupiah(assets.cash)}</strong>
        </span>
      </div>
      <table className="w-full text-xs border border-slate-300">
        <thead>
          <tr className="border-b border-slate-300 text-slate-800 text-left bg-slate-100">
            <th className="py-2 px-2.5 border border-slate-300 w-24">Tanggal</th>
            <th className="py-2 px-2.5 border border-slate-300 w-32">No. Transaksi</th>
            <th className="py-2 px-2.5 border border-slate-300">Keterangan</th>
            <th className="py-2 px-2.5 border border-slate-300 text-right w-28">Kas Masuk</th>
            <th className="py-2 px-2.5 border border-slate-300 text-right w-28">Kas Keluar</th>
            <th className="py-2 px-2.5 border border-slate-300 text-right w-32">Saldo Berjalan</th>
          </tr>
        </thead>
        <tbody>
          {cashMovements.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-slate-500 border border-slate-300">
                Tidak ada riwayat mutasi kas pada periode ini
              </td>
            </tr>
          ) : (
            cashMovements.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-2 px-2.5 border border-slate-300 text-slate-700 whitespace-nowrap">
                  {formatDateIndo(row.date)}
                </td>
                <td className="py-2 px-2.5 border border-slate-300 font-mono text-slate-900 font-semibold whitespace-nowrap">
                  {row.transactionNo}
                </td>
                <td className="py-2 px-2.5 border border-slate-300 text-slate-800">{row.description}</td>
                <td className="py-2 px-2.5 border border-slate-300 text-right font-mono text-emerald-700 whitespace-nowrap">
                  {row.cashIn > 0 ? formatRupiah(row.cashIn) : '-'}
                </td>
                <td className="py-2 px-2.5 border border-slate-300 text-right font-mono text-red-700 whitespace-nowrap">
                  {row.cashOut > 0 ? formatRupiah(row.cashOut) : '-'}
                </td>
                <td className="py-2 px-2.5 border border-slate-300 text-right font-mono font-bold text-slate-950 whitespace-nowrap">
                  {formatRupiah(row.runningBalance)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Section 9.4: Receivables
  const renderReceivables = () => (
    <div className="space-y-4 text-slate-900">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 border-b border-slate-200 pb-1">
        <span>Rekapitulasi Piutang Pelanggan (Bab 9.4)</span>
        <span className="font-mono text-slate-900">
          Total Piutang Beredar: <strong>{formatRupiah(assets.receivables)}</strong>
        </span>
      </div>
      <table className="w-full text-xs border border-slate-300">
        <thead>
          <tr className="border-b border-slate-300 text-slate-800 text-left bg-slate-100">
            <th className="py-2 px-2.5 border border-slate-300 w-24">Kode</th>
            <th className="py-2 px-2.5 border border-slate-300">Nama Customer</th>
            <th className="py-2 px-2.5 border border-slate-300 w-32">Nomor Telepon</th>
            <th className="py-2 px-2.5 border border-slate-300 text-right w-32">Penambahan (+)</th>
            <th className="py-2 px-2.5 border border-slate-300 text-right w-32">Pembayaran (-)</th>
            <th className="py-2 px-2.5 border border-slate-300 text-right w-36">Sisa Saldo Piutang</th>
          </tr>
        </thead>
        <tbody>
          {arReports.map(c => (
            <tr key={c.customerId}>
              <td className="py-2.5 px-2.5 border border-slate-300 font-mono text-slate-600">{c.customerId}</td>
              <td className="py-2.5 px-2.5 border border-slate-300 font-semibold text-slate-900">{c.customerName}</td>
              <td className="py-2.5 px-2.5 border border-slate-300 text-slate-600">{c.customerPhone || '-'}</td>
              <td className="py-2.5 px-2.5 border border-slate-300 text-right font-mono text-slate-800">
                {formatRupiah(c.additions)}
              </td>
              <td className="py-2.5 px-2.5 border border-slate-300 text-right font-mono text-emerald-700">
                {formatRupiah(c.reductions)}
              </td>
              <td className="py-2.5 px-2.5 border border-slate-300 text-right font-mono font-bold text-slate-950">
                {formatRupiah(c.endingBalance)}
              </td>
            </tr>
          ))}
          <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-950">
            <td colSpan={3} className="py-3 px-2.5 border border-slate-300">
              TOTAL SELURUH PIUTANG BEREDAR
            </td>
            <td className="py-3 px-2.5 border border-slate-300 text-right font-mono text-slate-900">
              {formatRupiah(arReports.reduce((acc, c) => acc + c.additions, 0))}
            </td>
            <td className="py-3 px-2.5 border border-slate-300 text-right font-mono text-emerald-800">
              {formatRupiah(arReports.reduce((acc, c) => acc + c.reductions, 0))}
            </td>
            <td className="py-3 px-2.5 border border-slate-300 text-right font-mono text-slate-950 font-black">
              {formatRupiah(assets.receivables)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Section 9.5: Inventory
  const renderInventory = () => (
    <div className="space-y-4 text-slate-900">
      <div className="text-xs font-semibold text-slate-600 border-b border-slate-200 pb-1">
        Rekonsiliasi Persediaan Nominal (Bab 9.5)
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Bahan Baku Breakdown */}
        <div className="border border-slate-300 rounded-md p-4 bg-white print-avoid-break">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 pb-2 border-b border-slate-300">
            Persediaan Bahan Baku (A03)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Saldo Awal Modal:</span>
              <span className="font-mono text-slate-900">{formatRupiah(inventory.rawMaterials.opening)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-emerald-700 font-medium">+ Pembelian Bahan Baku:</span>
              <span className="font-mono text-emerald-700 font-bold">
                {formatRupiah(inventory.rawMaterials.purchases)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-red-700 font-medium">- Konversi ke Barang Jadi:</span>
              <span className="font-mono text-red-700 font-bold">
                -{formatRupiah(inventory.rawMaterials.usedInFinishedGoods)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Penyesuaian Opname Fisik:</span>
              <span className="font-mono text-slate-900 font-semibold">
                {inventory.rawMaterials.opnameAdjustment >= 0 ? '+' : ''}
                {formatRupiah(inventory.rawMaterials.opnameAdjustment)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-slate-900 font-bold text-slate-950">
              <span>Saldo Akhir Bahan Baku:</span>
              <span className="font-mono text-slate-950 text-sm font-black">
                {formatRupiah(inventory.rawMaterials.ending)}
              </span>
            </div>
          </div>
        </div>

        {/* Barang Jadi Breakdown */}
        <div className="border border-slate-300 rounded-md p-4 bg-white print-avoid-break">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 pb-2 border-b border-slate-300">
            Persediaan Barang Jadi (A04)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Saldo Awal Modal:</span>
              <span className="font-mono text-slate-900">{formatRupiah(inventory.finishedGoods.opening)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-emerald-700 font-medium">+ Input Barang Jadi (Konversi):</span>
              <span className="font-mono text-emerald-700 font-bold">
                {formatRupiah(inventory.finishedGoods.produced)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-emerald-700 font-medium">+ Biaya Tenaga Kerja Langsung:</span>
              <span className="font-mono text-emerald-700 font-bold">
                {formatRupiah(inventory.finishedGoods.directLabor)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-red-700 font-medium">- HPP Penjualan (Terjual):</span>
              <span className="font-mono text-red-700 font-bold">
                -{formatRupiah(inventory.finishedGoods.soldHpp)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Penyesuaian Opname Fisik:</span>
              <span className="font-mono text-slate-900 font-semibold">
                {inventory.finishedGoods.opnameAdjustment >= 0 ? '+' : ''}
                {formatRupiah(inventory.finishedGoods.opnameAdjustment)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-slate-900 font-bold text-slate-950">
              <span>Saldo Akhir Barang Jadi:</span>
              <span className="font-mono text-slate-950 text-sm font-black">
                {formatRupiah(inventory.finishedGoods.ending)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const modalContent = (
    <div className="print-modal-portal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs">
      <div className="print-modal-dialog relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header Action Bar (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 no-print gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm tracking-wide">
                  Pratinjau Dokumen Cetak Laporan Keuangan
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {mode === 'ALL' ? 'Kompilasi Lengkap' : 'Laporan Tunggal'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                {mode === 'ALL'
                  ? 'Kompilasi 5 Laporan Finansial Resmi PT. Redone Berkah Mandiri Utama'
                  : getReportTitle(activeReportTab)} · {periodLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrintOrSavePDF}
              disabled={isProcessingPdf}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all shadow-xs cursor-pointer ${
                pdfSuccess
                  ? 'bg-emerald-400 text-slate-950'
                  : isProcessingPdf
                  ? 'bg-slate-700 text-slate-300 cursor-wait'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95'
              }`}
              title="Cetak via browser atau simpan berkas PDF resmi ke perangkat Anda"
            >
              {isProcessingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  <span>Memproses PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>PDF Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessingPdf}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors cursor-pointer ml-1"
              title="Tutup Pratinjau (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Area */}
        <div
          ref={printSheetRef}
          className="print-sheet p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible"
        >
          {mode === 'SINGLE' ? (
            /* Single Active Report View */
            <div>
              {renderLetterhead(
                getReportTitle(activeReportTab),
                activeReportTab === 'PNL'
                  ? 'MODUL 9.1'
                  : activeReportTab === 'ASSETS'
                  ? 'MODUL 9.2'
                  : activeReportTab === 'CASH_FLOW'
                  ? 'MODUL 9.3'
                  : activeReportTab === 'RECEIVABLES'
                  ? 'MODUL 9.4'
                  : 'MODUL 9.5'
              )}

              {activeReportTab === 'PNL' && renderPnl()}
              {activeReportTab === 'ASSETS' && renderAssets()}
              {activeReportTab === 'CASH_FLOW' && renderCashFlow()}
              {activeReportTab === 'RECEIVABLES' && renderReceivables()}
              {activeReportTab === 'INVENTORY' && renderInventory()}

              {renderSignatures()}

              <div className="mt-8 pt-3 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center print-avoid-break">
                <span>Dokumen Resmi REDONE FINANCE · Standar Aliran Nominal Terpadu</span>
                <span className="font-mono">Halaman 1 dari 1</span>
              </div>
            </div>
          ) : (
            /* Complete Compilation View (All 5 Reports) */
            <div className="space-y-12">
              {/* Cover Executive Header */}
              <div className="border-b-4 border-slate-950 pb-6 mb-8 text-center print-avoid-break">
                <div className="inline-block px-3 py-1 bg-slate-950 text-white font-mono text-[11px] font-bold tracking-widest rounded mb-3">
                  BUNDEL LAPORAN KEUANGAN LENGKAP
                </div>
                <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  PT. REDONE BERKAH MANDIRI UTAMA
                </h1>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                  KOMPILASI 5 MODUL KEUANGAN OPERASIONAL & PERSEDIAAN
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Periode Pelaporan: <strong>{periodLabel}</strong> · Dicetak Pada: {formatDateIndo(new Date().toISOString().split('T')[0])}
                </p>
              </div>

              {/* Section 1: PnL */}
              <div className="print-avoid-break">
                {renderLetterhead('LAPORAN LABA RUGI OPERASIONAL', 'MODUL 9.1')}
                {renderPnl()}
                {renderSignatures()}
              </div>

              {/* Section 2: Assets */}
              <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
                {renderLetterhead('LAPORAN SALDO SELURUH ASET', 'MODUL 9.2')}
                {renderAssets()}
                {renderSignatures()}
              </div>

              {/* Section 3: Cash Flow */}
              <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
                {renderLetterhead('BUKU MUTASI KAS BERJALAN', 'MODUL 9.3')}
                {renderCashFlow()}
                {renderSignatures()}
              </div>

              {/* Section 4: Receivables */}
              <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
                {renderLetterhead('LAPORAN REKAPITULASI PIUTANG PELANGGAN', 'MODUL 9.4')}
                {renderReceivables()}
                {renderSignatures()}
              </div>

              {/* Section 5: Inventory */}
              <div className="print-avoid-break pt-8 border-t-2 border-slate-300">
                {renderLetterhead('LAPORAN REKONSILIASI PERSEDIAAN NOMINAL', 'MODUL 9.5')}
                {renderInventory()}
                {renderSignatures()}
              </div>

              {/* Final Footer */}
              <div className="pt-6 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center print-avoid-break">
                <span>Dokumen Resmi REDONE FINANCE · Kompilasi Eksekutif Lengkap</span>
                <span className="font-mono">Akhir Dokumen Kompilasi</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
