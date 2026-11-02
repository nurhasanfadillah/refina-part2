import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah, formatDateIndo, getTodayDateString } from '../../utils/formatters';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  Printer,
  Ban,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';
import { Transaction } from '../../types';
import { PrintModal } from '../common/PrintModal';
import { CancelModal } from '../common/CancelModal';
import { NominalInput } from '../common/NominalInput';

export const FinanceView: React.FC = () => {
  const {
    customers,
    transactions,
    createCustomerPaymentTransaction,
    createOtherReceivableTransaction,
    cancelTransaction,
    getAccountBalance,
    getCustomerReceivableBalance,
    getCustomerReceivableReport
  } = useFinancial();

  const [activeTab, setActiveTab] = useState<'PAYMENT' | 'OTHER_RECEIVABLE'>('PAYMENT');

  // Customer Payment Form State
  const [payDate, setPayDate] = useState(getTodayDateString());
  const [payCustomerId, setPayCustomerId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDescription, setPayDescription] = useState('');

  // Other Receivable Form State
  const [otherType, setOtherType] = useState<'OTHER_RECEIVABLE_ADD' | 'OTHER_RECEIVABLE_PAYMENT'>(
    'OTHER_RECEIVABLE_ADD'
  );
  const [otherDate, setOtherDate] = useState(getTodayDateString());
  const [otherCustomerId, setOtherCustomerId] = useState('');
  const [otherAmount, setOtherAmount] = useState<number>(0);
  const [otherDescription, setOtherDescription] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedTxForPrint, setSelectedTxForPrint] = useState<Transaction | null>(null);
  const [selectedTxForCancel, setSelectedTxForCancel] = useState<Transaction | null>(null);

  const totalCash = getAccountBalance('A01');
  const totalReceivables = getAccountBalance('A02');
  const customerReports = getCustomerReceivableReport();

  // Selected customer's outstanding balance
  const selectedCustomerBalance = payCustomerId
    ? getCustomerReceivableBalance(payCustomerId)
    : 0;

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!payCustomerId) {
      setFormError('Pilih customer terlebih dahulu');
      return;
    }

    if (!payAmount || payAmount <= 0) {
      setFormError('Nominal pembayaran harus lebih besar dari 0');
      return;
    }

    const res = createCustomerPaymentTransaction({
      transactionDate: payDate,
      customerId: payCustomerId,
      amount: payAmount,
      description: payDescription
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal memproses pembayaran customer');
      return;
    }

    setFormSuccess(
      `Pembayaran piutang senilai ${formatRupiah(payAmount)} berhasil diposting ke Kas (A01)!`
    );
    setPayAmount(0);
    setPayDescription('');
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!otherAmount || otherAmount <= 0) {
      setFormError('Nominal transaksi harus lebih besar dari 0');
      return;
    }

    if (!otherDescription.trim()) {
      setFormError('Keterangan transaksi wajib diisi');
      return;
    }

    const res = createOtherReceivableTransaction({
      transactionType: otherType,
      transactionDate: otherDate,
      description: otherDescription,
      amount: otherAmount,
      customerId: otherCustomerId || undefined
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal menyimpan transaksi piutang lainnya');
      return;
    }

    setFormSuccess('Transaksi piutang lainnya berhasil diposting!');
    setOtherAmount(0);
    setOtherDescription('');
  };

  // Payment & Receivable Transactions
  const financeTransactions = transactions.filter(t =>
    ['CUSTOMER_PAYMENT', 'OTHER_RECEIVABLE_ADD', 'OTHER_RECEIVABLE_PAYMENT'].includes(
      t.transactionType
    )
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              MODUL 4: MANAJEMEN KEUANGAN (KAS & PIUTANG)
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Penerimaan Kas & Rekonsiliasi Piutang Pelanggan
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Pembayaran customer menggunakan metode general: cukup pilih customer dan masukkan nominal.
              Sistem otomatis mengurangi saldo piutang customer dan menambah saldo kas perusahaan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-2 border border-slate-800 rounded-md text-right">
              <span className="text-[10px] text-slate-400 block">Saldo Kas Aktif (A01):</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {formatRupiah(totalCash)}
              </span>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 border border-slate-800 rounded-md text-right">
              <span className="text-[10px] text-slate-400 block">Total Piutang Tertagih (A02):</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {formatRupiah(totalReceivables)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('PAYMENT')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'PAYMENT'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            1. Penerimaan Pembayaran Customer (Pelunasan Piutang)
          </button>
          <button
            onClick={() => setActiveTab('OTHER_RECEIVABLE')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'OTHER_RECEIVABLE'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            2. Piutang Lainnya (Non-Penjualan)
          </button>
        </div>
      </div>

      {/* Form Area */}
      {activeTab === 'PAYMENT' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Form Penerimaan Kas: Pembayaran Piutang Customer (Section 4.4 C)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mutasi Otomatis: Kas (A01) Bertambah · Piutang Customer (A02) Berkurang
              </p>
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

          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tanggal Pembayaran <span className="text-amber-400">*</span>
                </label>
                <input
                  type="date"
                  value={payDate}
                  onChange={e => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pilih Customer <span className="text-amber-400">*</span>
                </label>
                <select
                  value={payCustomerId}
                  onChange={e => setPayCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
                  required
                >
                  <option value="">-- Pilih Customer --</option>
                  {customers.map(c => {
                    const bal = getCustomerReceivableBalance(c.id);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} — Sisa Piutang: {formatRupiah(bal)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nominal Pembayaran (Rp) <span className="text-amber-400">*</span>
                </label>
                <NominalInput
                  min={1}
                  value={payAmount}
                  onChange={val => setPayAmount(val)}
                  placeholder="Contoh: 5.000.000"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Customer Outstanding Balance Card */}
            {payCustomerId && (
              <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-md flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">Sisa Saldo Piutang Customer Saat Ini:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatRupiah(selectedCustomerBalance)}
                  </span>
                </div>
                {payAmount > 0 && (
                  <div className="text-right">
                    <span className="text-slate-400 block">Estimasi Sisa Piutang Setelah Bayar:</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        selectedCustomerBalance - payAmount < 0
                          ? 'text-red-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatRupiah(selectedCustomerBalance - payAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Keterangan / Nomor Bukti Transfer Bank
              </label>
              <input
                type="text"
                value={payDescription}
                onChange={e => setPayDescription(e.target.value)}
                placeholder="Contoh: Transfer Bank BCA an. Kopi Kenangan / Pelunasan termin 1..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Posting Penerimaan Kas & Kurangi Piutang
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Other Receivable Form Area */
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Form Piutang Lainnya (Section 4.4 D)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mencatat piutang non-penjualan atau pelunasan kas dari piutang lainnya
              </p>
            </div>
          </div>

          <form onSubmit={handleOtherSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tipe Transaksi <span className="text-amber-400">*</span>
                </label>
                <select
                  value={otherType}
                  onChange={e =>
                    setOtherType(
                      e.target.value as 'OTHER_RECEIVABLE_ADD' | 'OTHER_RECEIVABLE_PAYMENT'
                    )
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden"
                >
                  <option value="OTHER_RECEIVABLE_ADD">
                    Penambahan Piutang Lainnya (Piutang +)
                  </option>
                  <option value="OTHER_RECEIVABLE_PAYMENT">
                    Pembayaran Piutang Lainnya (Kas +, Piutang -)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tanggal Transaksi <span className="text-amber-400">*</span>
                </label>
                <input
                  type="date"
                  value={otherDate}
                  onChange={e => setOtherDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer / Pihak Terkait (Opsional)
                </label>
                <select
                  value={otherCustomerId}
                  onChange={e => setOtherCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden"
                >
                  <option value="">-- Pihak Umum / Eksternal --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nominal (Rp) <span className="text-amber-400">*</span>
                </label>
                <NominalInput
                  min={1}
                  value={otherAmount}
                  onChange={val => setOtherAmount(val)}
                  placeholder="Contoh: 1.000.000"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Keterangan Transaksi <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={otherDescription}
                onChange={e => setOtherDescription(e.target.value)}
                placeholder="Contoh: Talangan operasional vendor pengiriman / Piutang sewa..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-100 focus:outline-hidden"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Posting Piutang Lainnya
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Receivable Balances Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Kartu Saldo Piutang Per Pelanggan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Akumulasi penambahan piutang penjualan vs penerimaan pembayaran
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            Total Piutang Beredar: {formatRupiah(totalReceivables)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3">Kode Customer</th>
                <th className="py-2.5 px-3">Nama Customer</th>
                <th className="py-2.5 px-3">Kontak / Telepon</th>
                <th className="py-2.5 px-3 text-right">Penambahan Piutang</th>
                <th className="py-2.5 px-3 text-right">Pembayaran Masuk</th>
                <th className="py-2.5 px-3 text-right">Sisa Saldo Piutang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customerReports.map(c => (
                <tr key={c.customerId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400">{c.customerId}</td>
                  <td className="py-3 px-3 font-medium text-slate-200">{c.customerName}</td>
                  <td className="py-3 px-3 text-slate-400">{c.customerPhone}</td>
                  <td className="py-3 px-3 text-right font-mono text-amber-400">
                    {formatRupiah(c.additions)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {formatRupiah(c.reductions)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                    <span
                      className={
                        c.endingBalance > 0
                          ? 'text-amber-400'
                          : c.endingBalance === 0
                          ? 'text-slate-400'
                          : 'text-red-400'
                      }
                    >
                      {formatRupiah(c.endingBalance)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finance Transactions History */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Riwayat Pembayaran & Piutang Lainnya
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Setiap pembayaran otomatis menambah kas dan mengurangi piutang
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {financeTransactions.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3">No. Bukti</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Customer / Mitra</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {financeTransactions.map(tx => {
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
                    <td className="py-3 px-3 text-slate-200 font-medium whitespace-nowrap">
                      {tx.customerNameSnapshot || '-'}
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
                          title="Cetak Bukti Penerimaan Kas (BKM)"
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
