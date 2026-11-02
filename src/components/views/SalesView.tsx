import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, formatDateIndo, getTodayDateString } from '../../utils/formatters';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  Ban,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { CancelModal } from '../common/CancelModal';
import { NominalInput } from '../common/NominalInput';

export const SalesView: React.FC = () => {
  const {
    products,
    customers,
    transactions,
    createSaleTransaction,
    cancelTransaction
  } = useFinancial();

  // Form State
  const [transactionDate, setTransactionDate] = useState(getTodayDateString());
  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<
    Array<{
      productId: string;
      qty: number;
      sellingPrice: number;
      sellingHpp: number;
    }>
  >([
    {
      productId: products[0]?.id || '',
      qty: 100,
      sellingPrice: products[0]?.defaultSellingPrice || 0,
      sellingHpp: products[0]?.defaultSellingHpp || 0
    }
  ]);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);
  const [selectedTxForCancel, setSelectedTxForCancel] = useState<Transaction | null>(null);

  // When a user selects a product for a row, update selling price and HPP defaults
  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: prodId,
        sellingPrice: prod.defaultSellingPrice,
        sellingHpp: prod.defaultSellingHpp
      };
      return updated;
    });
  };

  const handleItemFieldChange = (
    index: number,
    field: 'qty' | 'sellingPrice' | 'sellingHpp',
    val: number
  ) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: isNaN(val) ? 0 : val
      };
      return updated;
    });
  };

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems(prev => [
      ...prev,
      {
        productId: firstProd?.id || '',
        qty: 1,
        sellingPrice: firstProd?.defaultSellingPrice || 0,
        sellingHpp: firstProd?.defaultSellingHpp || 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations for current form
  const totalSelling = items.reduce((sum, item) => sum + item.qty * item.sellingPrice, 0);
  const totalHpp = items.reduce((sum, item) => sum + item.qty * item.sellingHpp, 0);
  const grossProfit = totalSelling - totalHpp;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!customerId) {
      setFormError('Pilih customer terlebih dahulu');
      return;
    }

    if (items.some(item => !item.productId || item.qty <= 0)) {
      setFormError('Pastikan seluruh baris produk memiliki jumlah Qty lebih dari 0');
      return;
    }

    const res = createSaleTransaction({
      transactionDate,
      customerId,
      items,
      description
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal menyimpan transaksi penjualan');
      return;
    }

    setFormSuccess(`Transaksi Penjualan berhasil diposting! Piutang dan HPP otomatis dicatat.`);
    // Reset form
    setDescription('');
    if (products[0]) {
      setItems([
        {
          productId: products[0].id,
          qty: 100,
          sellingPrice: products[0].defaultSellingPrice,
          sellingHpp: products[0].defaultSellingHpp
        }
      ]);
    }
  };

  // Filter Sales Transactions
  const salesTransactions = transactions
    .filter(t => t.transactionType === 'SALE')
    .filter(t => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.transactionNo.toLowerCase().includes(q) ||
        (t.customerNameSnapshot && t.customerNameSnapshot.toLowerCase().includes(q)) ||
        t.description.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              MODUL 1: PENJUALAN PRODUK
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Pencatatan Penjualan & Pengakuan Piutang Otomatis
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Setiap penjualan diakui sebagai <span className="text-amber-400">Piutang Pelanggan (A02)</span>,
              mengakui <span className="text-emerald-400">Pendapatan Penjualan (R01)</span>, dan memotong
              nilai <span className="text-blue-400">Persediaan Barang Jadi (A04)</span> sebesar total HPP snapshot.
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 border border-slate-800 rounded-md text-right">
            <span className="text-[11px] text-slate-400 block">Total Penjualan Tercatat:</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {formatRupiah(salesTransactions.reduce((acc, t) => acc + (t.status === 'POSTED' ? t.totalAmount : 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-800">
          Form Input Penjualan Baru
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
                Tanggal Penjualan <span className="text-amber-400">*</span>
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
                Customer Pelanggan <span className="text-amber-400">*</span>
              </label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
                required
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Keterangan / Catatan PO
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Contoh: Pesanan Box Cetak Batch 12..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="mt-4 border border-slate-800 rounded-md overflow-hidden">
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Daftar Produk yang Dijual
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                Tambah Baris
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-left">
                    <th className="py-2.5 px-3">Produk</th>
                    <th className="py-2.5 px-3 w-24 text-right">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Harga Jual (Rp)</th>
                    <th className="py-2.5 px-3 w-32 text-right">HPP Penjualan (Rp)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Subtotal Penjualan</th>
                    <th className="py-2.5 px-3 w-12 text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2.5">
                        <select
                          value={item.productId}
                          onChange={e => handleProductChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-hidden"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <NominalInput
                          formatThousands={false}
                          min={1}
                          value={item.qty}
                          onChange={val => handleItemFieldChange(idx, 'qty', val)}
                          className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-right font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </td>
                      <td className="p-2.5">
                        <NominalInput
                          min={0}
                          value={item.sellingPrice}
                          onChange={val => handleItemFieldChange(idx, 'sellingPrice', val)}
                          className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-right font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </td>
                      <td className="p-2.5">
                        <NominalInput
                          min={0}
                          value={item.sellingHpp}
                          onChange={val => handleItemFieldChange(idx, 'sellingHpp', val)}
                          className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-right font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold text-slate-100">
                        {formatRupiah(item.qty * item.sellingPrice)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Penjualan (Piutang A02):</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {formatRupiah(totalSelling)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total HPP (Potong Barang Jadi A04):</span>
                <span className="text-base font-bold font-mono text-blue-400">
                  {formatRupiah(totalHpp)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Estimasi Laba Kotor:</span>
                <span
                  className={`text-base font-bold font-mono ${
                    grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatRupiah(grossProfit)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Posting Penjualan & Tambah Piutang
            </button>
          </div>
        </form>
      </div>

      {/* Sales Transactions History */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Daftar Riwayat Transaksi Penjualan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Seluruh transaksi tercatat otomatis ke kartu piutang pelanggan
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari no nota, customer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3">No. Transaksi</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Customer Pelanggan</th>
                <th className="py-2.5 px-3">Rincian Item</th>
                <th className="py-2.5 px-3 text-right">Total Penjualan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {salesTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ada transaksi penjualan ditemukan
                  </td>
                </tr>
              ) : (
                salesTransactions.map(tx => {
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
                      <td className="py-3 px-3 font-medium text-slate-100 whitespace-nowrap">
                        {tx.customerNameSnapshot}
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs">
                        {tx.items?.map((item, i) => (
                          <div key={i} className="text-[11px] truncate">
                            {item.qty}x {item.productNameSnapshot}
                          </div>
                        ))}
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
                            title="Cetak Nota Penjualan"
                            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => setSelectedTxForCancel(tx)}
                              title="Batalkan Nota (Pembalik Saldo)"
                              className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
