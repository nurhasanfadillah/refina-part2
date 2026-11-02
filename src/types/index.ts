/**
 * REODONE Financial Management System - Core Types & Enums
 * Based on System Specification v1.0
 */

export type AccountId =
  | 'A01' // Kas (Aset)
  | 'A02' // Piutang (Aset)
  | 'A03' // Persediaan Bahan Baku (Aset)
  | 'A04' // Persediaan Barang Jadi (Aset)
  | 'A05' // Aset Peralatan (Aset)
  | 'A06' // Aset Lainnya (Aset)
  | 'R01' // Pendapatan Penjualan (Pendapatan)
  | 'R02' // HPP Penjualan (HPP)
  | 'B01' // Beban Operasional (Beban)
  | 'B02'; // Beban Penyesuaian (Beban)

export type AccountGroup = 'Aset' | 'Pendapatan' | 'HPP' | 'Beban';

export interface Account {
  id: AccountId;
  name: string;
  group: AccountGroup;
  initialBalance: number;
}

export type TransactionType =
  | 'SALE' // Penjualan
  | 'EXPENSE' // Pengeluaran Beban
  | 'ASSET_EQUIPMENT' // Pembelian Peralatan
  | 'RAW_PURCHASE' // Pembelian Bahan Baku
  | 'DIRECT_LABOR' // Tenaga Kerja Langsung
  | 'OTHER_ASSET_ADD' // Penambahan Aset Lainnya
  | 'FINISHED_GOODS' // Input Barang Jadi
  | 'CUSTOMER_PAYMENT' // Pembayaran Customer
  | 'OTHER_RECEIVABLE_ADD' // Penambahan Piutang Lainnya
  | 'OTHER_RECEIVABLE_PAYMENT' // Pembayaran Piutang Lainnya
  | 'OPNAME' // Opname Penyesuaian
  | 'OPENING_BALANCE' // Saldo Awal
  | 'MANUAL_ADJUSTMENT'; // Penyesuaian Manual

export type TransactionStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export interface Product {
  id: string;
  code: string;
  name: string;
  defaultSellingPrice: number;
  defaultSellingHpp: number;
  defaultRawMaterialHpp: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'ASSET';
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  productNameSnapshot: string;
  qty: number;
  sellingPriceSnapshot: number;
  sellingHppSnapshot: number;
  rawMaterialHppSnapshot: number;
  totalSelling: number;
  totalHpp: number;
  totalRawMaterial: number;
}

export interface AccountMovement {
  id: string;
  transactionId: string;
  accountId: AccountId;
  customerId?: string;
  signedAmount: number; // Positif = penambahan saldo, Negatif = pengurangan saldo
  description: string;
  createdAt: string;
}

export interface OpnameDetail {
  id: string;
  transactionId: string;
  accountId: AccountId;
  customerId?: string;
  systemAmount: number;
  actualAmount: number;
  differenceAmount: number; // actualAmount - systemAmount
  reason: string;
  targetDestination?: string;
}

export interface TransactionLog {
  id: string;
  transactionId: string;
  action: 'CREATE' | 'POST' | 'CANCEL';
  description: string;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionNo: string;
  transactionDate: string; // YYYY-MM-DD
  transactionType: TransactionType;
  customerId?: string;
  customerNameSnapshot?: string;
  categoryId?: string;
  categoryNameSnapshot?: string;
  description: string;
  totalAmount: number;
  status: TransactionStatus;
  items?: TransactionItem[];
  opnameDetail?: OpnameDetail;
  cancellationReason?: string;
  createdBy: string;
  createdAt: string;
  postedAt?: string;
  cancelledAt?: string;
}

export interface DateFilter {
  preset: 'today' | 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom';
  startDate: string;
  endDate: string;
}
