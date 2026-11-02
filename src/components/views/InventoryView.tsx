import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, formatDateIndo, getTodayDateString } from '../../utils/formatters';
import {
  Package,
  ArrowRightLeft,
  Printer,
  Ban,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { Transaction } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { CancelModal } from '../common/CancelModal';
import { NominalInput } from '../common/NominalInput';

export const InventoryView: React.FC = () => {
  const {
    products,
    transactions,
    createFinishedGoodsTransaction,
    cancelTransaction,
    getAccountBalance,
    getInventoryReport
  } = useFinancial();

  // Form State for Input Barang Jadi (FINISHED_GOODS)
  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState<number>(500);
  const [rawMaterialHpp, setRawMaterialHpp] = useState<number>(
    products[0]?.defaultRawMaterialHpp || 0
  );
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);
  const [selectedTxForCancel, setSelectedTxForCancel] = useState<Transaction | null>(null);

  const rawBalance = getAccountBalance('A03');
  const fgBalance = getAccountBalance('A04');
  const inventoryReport = getInventoryReport();

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const selectedProd = products.find(p => p.id === id);
    if (selectedProd) {
      setRawMaterialHpp(selectedProd.defaultRawMaterialHpp);
    }
  };

  const totalConversionAmount = qty * rawMaterialHpp;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!productId) {
      setFormError('Pilih produk barang jadi terlebih dahulu');
      return;
    }

    if (qty <= 0) {
      setFormError('Jumlah Qty konversi harus lebih dari 0');
      return;
    }

    if (rawMaterialHpp <= 0) {
      setFormError('HPP Bahan Baku per unit harus lebih dari 0');
      return;
    }



    const res = createFinishedGoodsTransaction({
      transactionDate,
      productId,
      qty,
      rawMaterialHpp,
      description
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal memproses input barang jadi');
      return;
    }

    setFormSuccess(
      `Konversi Barang Jadi berhasil! Nilai ${formatRupiah(totalConversionAmount)} dipindahkan dari Bahan Baku (A03) ke Barang Jadi (A04).`
    );
    setDescription('');
  };

  const fgTransactions = transactions.filter(t => t.transactionType === 'FINISHED_GOODS');

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              MODUL 3: MANAJEMEN PERSEDIAAN BERBASIS NOMINAL
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Aliran Saldo Nilai Bahan Baku & Barang Jadi
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              REODONE mengelola persediaan murni berdasarkan nominal rupiah. Tidak terdapat kartu stok
              fisik atau rumus resep BOM. Qty hanya berfungsi sebagai pengali nilai nominal saat konversi dan penjualan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-2 border border-slate-800 rounded-md text-right">
              <span className="text-[10px] text-slate-400 block">Bahan Baku (A03):</span>
              <span className="text-sm font-bold font-mono text-blue-400">
                {formatRupiah(rawBalance)}
              </span>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 border border-slate-800 rounded-md text-right">
              <span className="text-[10px] text-slate-400 block">Barang Jadi (A04):</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {formatRupiah(fgBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Structure: Balance Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Bahan Baku Flow */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-100">
                Persediaan Bahan Baku (A03)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">
              {formatRupiah(rawBalance)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Saldo Awal:</span>
              <span className="font-mono text-slate-200">
                {formatRupiah(inventoryReport.rawMaterials.opening)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-emerald-400 font-medium">+ Pembelian Bahan Baku:</span>
              <span className="font-mono text-emerald-400">
                {formatRupiah(inventoryReport.rawMaterials.purchases)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-amber-400 font-medium">- Konversi ke Barang Jadi:</span>
              <span className="font-mono text-amber-400">
                -{formatRupiah(inventoryReport.rawMaterials.usedInFinishedGoods)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Penyesuaian Opname:</span>
              <span className="font-mono text-slate-200">
                {inventoryReport.rawMaterials.opnameAdjustment >= 0 ? '+' : ''}
                {formatRupiah(inventoryReport.rawMaterials.opnameAdjustment)}
              </span>
            </div>
            <div className="flex justify-between pt-2 font-bold text-slate-100">
              <span>Saldo Akhir Bahan Baku:</span>
              <span className="font-mono text-blue-400">
                {formatRupiah(inventoryReport.rawMaterials.ending)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Barang Jadi Flow */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded">
                <Package className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-100">
                Persediaan Barang Jadi (A04)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {formatRupiah(fgBalance)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Saldo Awal:</span>
              <span className="font-mono text-slate-200">
                {formatRupiah(inventoryReport.finishedGoods.opening)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-cyan-400 font-medium">+ Input Barang Jadi (Konversi):</span>
              <span className="font-mono text-cyan-400">
                {formatRupiah(inventoryReport.finishedGoods.produced)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-purple-400 font-medium">+ Biaya Tenaga Kerja Langsung:</span>
              <span className="font-mono text-purple-400">
                {formatRupiah(inventoryReport.finishedGoods.directLabor)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-amber-400 font-medium">- Pengurangan HPP Penjualan:</span>
              <span className="font-mono text-amber-400">
                -{formatRupiah(inventoryReport.finishedGoods.soldHpp)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Penyesuaian Opname:</span>
              <span className="font-mono text-slate-200">
                {inventoryReport.finishedGoods.opnameAdjustment >= 0 ? '+' : ''}
                {formatRupiah(inventoryReport.finishedGoods.opnameAdjustment)}
              </span>
            </div>
            <div className="flex justify-between pt-2 font-bold text-slate-100">
              <span>Saldo Akhir Barang Jadi:</span>
              <span className="font-mono text-cyan-400">
                {formatRupiah(inventoryReport.finishedGoods.ending)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Input Barang Jadi */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Form Konversi: Input Barang Jadi (Section 4.3 C)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mengonversi nilai nominal bahan baku menjadi barang jadi: Total = Qty × HPP Bahan Baku
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/20">
            <Info className="w-3.5 h-3.5" />
            <span>Biaya tenaga kerja langsung dicatat terpisah via Transaksi Pengeluaran</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tanggal Selesai Produksi <span className="text-amber-400">*</span>
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
                Pilih Master Produk <span className="text-amber-400">*</span>
              </label>
              <select
                value={productId}
                onChange={e => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Jumlah Qty <span className="text-amber-400">*</span>
              </label>
              <NominalInput
                formatThousands={false}
                min={1}
                value={qty}
                onChange={val => setQty(val)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                HPP Bahan Baku Snapshot (Rp) <span className="text-amber-400">*</span>
              </label>
              <NominalInput
                min={0}
                value={rawMaterialHpp}
                onChange={val => setRawMaterialHpp(val)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Keterangan / Nomor Batch Produksi
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contoh: Penyelesaian cetak batch kemasan 500 pcs untuk pesanan November..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Conversion Calculation Summary */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 block">Total Nilai Konversi Nominal:</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {formatRupiah(totalConversionAmount)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ({qty.toLocaleString()} pcs × {formatRupiah(rawMaterialHpp)})
              </span>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs transition-colors self-end sm:self-auto"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Posting Konversi Barang Jadi
            </button>
          </div>
        </form>
      </div>

      {/* Finished Goods Conversion History */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Riwayat Input Barang Jadi (Konversi)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mutasi: Persediaan Barang Jadi (+) & Persediaan Bahan Baku (-)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {fgTransactions.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3">No. Transaksi</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Produk</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">HPP Bahan Baku</th>
                <th className="py-2.5 px-3 text-right">Total Konversi</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {fgTransactions.map(tx => {
                const isCancelled = tx.status === 'CANCELLED';
                const item = tx.items?.[0];
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
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {item?.productNameSnapshot || tx.description}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-200 whitespace-nowrap">
                      {item?.qty.toLocaleString() || '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                      {item ? formatRupiah(item.rawMaterialHppSnapshot) : '-'}
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
                          title="Cetak Bukti Konversi"
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
