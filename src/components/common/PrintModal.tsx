import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Transaction } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';
import { Printer, X, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface PrintModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ transaction, onClose }) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (transaction) {
      document.body.classList.add('printing-modal');
    }
    return () => {
      document.body.classList.remove('printing-modal');
    };
  }, [transaction]);

  if (!transaction) return null;

  const handlePrint = async () => {
    if (!sheetRef.current || isProcessing) return;
    setIsProcessing(true);
    setIsSuccess(false);

    try {
      try {
        window.focus();
        window.print();
      } catch (e) {
        console.warn('Native window.print() restricted:', e);
      }

      const sheetEl = sheetRef.current;
      const canvas = await html2canvas(sheetEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfPageWidth = 210;
      const pdfPageHeight = 297;
      const imgHeight = (canvas.height * pdfPageWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfPageWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfPageWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfPageHeight;
      }

      pdf.save(`REDONE_${transaction.transactionNo}_${transaction.transactionDate}.pdf`);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Failed generating voucher PDF:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getVoucherTitle = () => {
    switch (transaction.transactionType) {
      case 'SALE':
        return 'NOTA PENJUALAN RESMI (FAKTUR)';
      case 'EXPENSE':
        return 'BUKTI PENGELUARAN KAS OPERASIONAL (BKK)';
      case 'ASSET_EQUIPMENT':
        return 'BUKTI PEMBELIAN ASET PERALATAN (BKK-EQP)';
      case 'RAW_PURCHASE':
        return 'BUKTI PEMBELIAN BAHAN BAKU (BKK-RAW)';
      case 'DIRECT_LABOR':
        return 'BUKTI BIAYA TENAGA KERJA LANGSUNG (BKK-LAB)';
      case 'OTHER_ASSET_ADD':
        return 'BUKTI PEMBELIAN ASET LAINNYA (BKK-AST)';
      case 'CUSTOMER_PAYMENT':
        return 'BUKTI PENERIMAAN KAS PIUTANG (BKM)';
      case 'OTHER_RECEIVABLE_PAYMENT':
        return 'BUKTI PENERIMAAN KAS PIUTANG LAINNYA (BKM-ORP)';
      case 'OTHER_RECEIVABLE_ADD':
        return 'BUKTI PENCATATAN PIUTANG LAINNYA (BKP)';
      case 'FINISHED_GOODS':
        return 'BUKTI KONVERSI BARANG JADI (BKBJ)';
      case 'OPNAME':
        return 'BERITA ACARA OPNAME & PENYESUAIAN FISIK (BA-OPN)';
      case 'OPENING_BALANCE':
        return 'BUKTI PENCATATAN SALDO AWAL MODAL (BKM-SALDO)';
      default:
        return 'BUKTI TRANSAKSI KEUANGAN RESMI';
    }
  };

  const isCancelled = transaction.status === 'CANCELLED';

  const modalContent = (
    <div className="print-modal-portal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="print-modal-dialog relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950 no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-semibold text-slate-100 text-sm tracking-wide block">
                Pratinjau Cetak / Unduh Dokumen PDF
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {transaction.transactionNo} · {getVoucherTitle()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-400 text-slate-950'
                  : isProcessing
                  ? 'bg-slate-700 text-slate-300 cursor-wait'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  <span>Memproses PDF...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>PDF Disimpan!</span>
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
              disabled={isProcessing}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper View */}
        <div ref={sheetRef} className="print-sheet p-8 sm:p-10 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible">
          {/* Watermark for Cancelled Transactions */}
          {isCancelled && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-center">
              <span className="text-red-700 font-bold uppercase tracking-widest text-sm">
                [ DOKUMEN TELAH DIBATALKAN / VOID ]
              </span>
              {transaction.cancellationReason && (
                <p className="text-xs text-red-600 mt-0.5">
                  Alasan: {transaction.cancellationReason}
                </p>
              )}
            </div>
          )}

          {/* Official Company Branding & Voucher Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                  PT. REDONE BERKAH MANDIRI UTAMA
                </h1>
                <p className="text-xs text-slate-700 font-bold tracking-wider uppercase mt-0.5">
                  REDONE FINANCE · SISTEM MANAJEMEN KEUANGAN OPERASIONAL
                </p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-md leading-relaxed">
                  Kawasan Bisnis Niaga No. 88, Jakarta Selatan · Telp: (021) 789-0123 · Email: finance@redone.co.id
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-black tracking-wider text-slate-950 uppercase bg-slate-100 px-2.5 py-1 rounded border border-slate-300 inline-block">
                  {getVoucherTitle()}
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 mt-1.5">
                  NO: {transaction.transactionNo}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Tanggal: {formatDateIndo(transaction.transactionDate)}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  STATUS: {transaction.status}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-4 border border-slate-300 rounded-md">
            <div>
              <span className="text-slate-500 font-medium block">Pihak Terkait / Customer:</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {transaction.customerNameSnapshot || '-'}
              </span>
              {transaction.categoryNameSnapshot && (
                <div className="mt-2.5">
                  <span className="text-slate-500 font-medium block">Kategori Transaksi:</span>
                  <span className="font-semibold text-slate-800">
                    {transaction.categoryNameSnapshot}
                  </span>
                </div>
              )}
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Keterangan / Uraian:</span>
              <span className="font-medium text-slate-900 text-xs mt-0.5 block leading-relaxed">
                {transaction.description}
              </span>
              <div className="mt-2.5">
                <span className="text-slate-500 font-medium block">Petugas Pelaksana:</span>
                <span className="font-semibold text-slate-800">
                  {transaction.createdBy}
                </span>
              </div>
            </div>
          </div>

          {/* Table for Transactions with Items (Sale / Finished Goods) */}
          {transaction.items && transaction.items.length > 0 && (
            <div className="mb-6">
              <table className="w-full text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                    <th className="py-2.5 px-3 text-left font-bold w-12 text-center">No</th>
                    <th className="py-2.5 px-3 text-left font-bold">Produk / Uraian</th>
                    <th className="py-2.5 px-3 text-right font-bold w-20">Qty</th>
                    <th className="py-2.5 px-3 text-right font-bold w-32">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right font-bold w-36">Total Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {transaction.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">
                          {item.productNameSnapshot}
                        </span>
                        {item.sellingHppSnapshot > 0 && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            HPP Standar: {formatRupiah(item.sellingHppSnapshot)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {item.qty.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatRupiah(item.sellingPriceSnapshot || item.rawMaterialHppSnapshot)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                        {formatRupiah(item.totalSelling || item.totalRawMaterial)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Breakdown for Single Non-Item Transactions (Expenses, Payments) */}
          {(!transaction.items || transaction.items.length === 0) && !transaction.opnameDetail && (
            <div className="mb-6 border border-slate-300 rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                    <th className="py-2 px-3 text-left font-bold">Pos Aliran Transaksi</th>
                    <th className="py-2 px-3 text-left font-bold">Keterangan Akuntansi</th>
                    <th className="py-2 px-3 text-right font-bold">Nominal Bersih</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {transaction.categoryNameSnapshot || transaction.transactionType}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-950 text-sm">
                      {formatRupiah(transaction.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Opname Detail Section */}
          {transaction.opnameDetail && (
            <div className="mb-6 border border-slate-300 rounded-md p-4 bg-slate-50">
              <div className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex justify-between items-center">
                <span>Rincian Rekonsiliasi Audit Fisik</span>
                <span className="font-mono text-slate-600 font-normal">
                  Objek: {transaction.opnameDetail.accountId}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Saldo Tercatat Sistem:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                    {formatRupiah(transaction.opnameDetail.systemAmount)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Nilai Aktual Fisik:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                    {formatRupiah(transaction.opnameDetail.actualAmount)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Selisih Penyesuaian:</span>
                  <span
                    className={`font-mono font-bold text-sm mt-0.5 block ${
                      transaction.opnameDetail.differenceAmount < 0
                        ? 'text-red-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {transaction.opnameDetail.differenceAmount >= 0 ? '+' : ''}
                    {formatRupiah(transaction.opnameDetail.differenceAmount)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 space-y-1">
                <div>
                  <span className="font-bold text-slate-900">Catatan Temuan Fisik: </span>
                  {transaction.opnameDetail.reason}
                </div>
                {transaction.opnameDetail.targetDestination && (
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <span className="font-bold text-slate-900">Alokasi Penyeimbang: </span>
                    {transaction.opnameDetail.targetDestination === 'HPP'
                      ? 'HPP Penjualan (R02) — Diakui di Laba Rugi'
                      : transaction.opnameDetail.targetDestination === 'ASET_LAINNYA'
                      ? 'Aset Lainnya (A06) — Ditampung di Neraca Aset'
                      : transaction.opnameDetail.targetDestination === 'BEBAN'
                      ? 'Beban Penyesuaian (B02) — Diakui di Laba Rugi'
                      : transaction.opnameDetail.targetDestination === 'LANGSUNG'
                      ? 'Penyesuaian Langsung pada Saldo Aset'
                      : transaction.opnameDetail.targetDestination}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total Nominal Summary Card */}
          <div className="flex justify-end mb-8">
            <div className="w-72 border-t-2 border-b-2 border-slate-950 py-2.5 text-right bg-slate-50/50 px-3">
              <div className="flex justify-between items-center text-xs text-slate-700 font-semibold mb-1">
                <span>TOTAL NILAI NOMINAL:</span>
                <span className="font-mono font-black text-slate-950 text-lg">
                  {formatRupiah(transaction.totalAmount)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                *Tercatat resmi dalam buku aliran nominal REDONE FINANCE
              </p>
            </div>
          </div>

          {/* Formal Authorization & Signatures (3 Columns) */}
          <div className="print-avoid-break grid grid-cols-3 gap-6 text-center text-xs pt-4 border-t border-dashed border-slate-300">
            <div>
              <p className="text-slate-500 font-medium mb-16">Dibuat Oleh (Operator),</p>
              <p className="font-bold text-slate-900 border-t border-slate-900 pt-1.5 inline-block min-w-[140px]">
                {transaction.createdBy}
              </p>
              <span className="block text-[10px] text-slate-500 mt-0.5">Staf Keuangan / Kasir</span>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-16">Diperiksa / Disetujui,</p>
              <p className="font-bold text-slate-900 border-t border-slate-900 pt-1.5 inline-block min-w-[140px]">
                Manajer Keuangan
              </p>
              <span className="block text-[10px] text-slate-500 mt-0.5">PT. Redone Berkah Mandiri Utama</span>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-16">Penerima / Pihak Kedua,</p>
              <p className="font-bold text-slate-900 border-t border-slate-900 pt-1.5 inline-block min-w-[140px]">
                ( ..................................... )
              </p>
              <span className="block text-[10px] text-slate-500 mt-0.5">Nama Terang & Tanda Tangan</span>
            </div>
          </div>

          {/* Printable Footnote */}
          <div className="mt-8 pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between items-center">
            <span>Dicetak secara elektronik melalui REDONE FINANCE</span>
            <span>Halaman 1 dari 1</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
