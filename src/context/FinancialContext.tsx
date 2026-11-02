import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Account,
  AccountId,
  Product,
  Customer,
  Category,
  Transaction,
  TransactionType,
  AccountMovement,
  TransactionLog,
  DateFilter
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_MOVEMENTS,
  INITIAL_LOGS
} from '../data/initialData';
import { getTodayDateString, getPeriodDateRange } from '../utils/formatters';

const STORAGE_KEY_ACCOUNTS = 'reodone_accounts_v1';
const STORAGE_KEY_PRODUCTS = 'reodone_products_v1';
const STORAGE_KEY_CUSTOMERS = 'reodone_customers_v1';
const STORAGE_KEY_CATEGORIES = 'reodone_categories_v1';
const STORAGE_KEY_TRANSACTIONS = 'reodone_transactions_v1';
const STORAGE_KEY_MOVEMENTS = 'reodone_movements_v1';
const STORAGE_KEY_LOGS = 'reodone_logs_v1';

export interface FinancialContextType {
  accounts: Account[];
  products: Product[];
  customers: Customer[];
  categories: Category[];
  transactions: Transaction[];
  movements: AccountMovement[];
  logs: TransactionLog[];
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  activeView: string;
  setActiveView: (view: string) => void;

  // Master Data Methods
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;

  // Transaction Processors (Strictly Nominal & Atomic)
  createSaleTransaction: (data: {
    transactionDate: string;
    customerId: string;
    items: Array<{
      productId: string;
      qty: number;
      sellingPrice: number;
      sellingHpp: number;
    }>;
    description?: string;
  }) => { success: boolean; error?: string; transactionId?: string };

  createExpenseTransaction: (data: {
    transactionType: 'EXPENSE' | 'ASSET_EQUIPMENT' | 'RAW_PURCHASE' | 'DIRECT_LABOR' | 'OTHER_ASSET_ADD';
    transactionDate: string;
    categoryId?: string;
    description: string;
    amount: number;
  }) => { success: boolean; error?: string };

  createFinishedGoodsTransaction: (data: {
    transactionDate: string;
    productId: string;
    qty: number;
    rawMaterialHpp: number;
    description?: string;
  }) => { success: boolean; error?: string };

  createCustomerPaymentTransaction: (data: {
    transactionDate: string;
    customerId: string;
    amount: number;
    description?: string;
  }) => { success: boolean; error?: string };

  createOtherReceivableTransaction: (data: {
    transactionType: 'OTHER_RECEIVABLE_ADD' | 'OTHER_RECEIVABLE_PAYMENT';
    transactionDate: string;
    description: string;
    amount: number;
    customerId?: string;
  }) => { success: boolean; error?: string };

  createOpnameTransaction: (data: {
    transactionDate: string;
    accountId: AccountId;
    actualAmount: number;
    reason: string;
    targetDestination?: string;
    customerId?: string;
  }) => { success: boolean; error?: string };

  createOpeningBalanceTransaction: (data: {
    transactionDate: string;
    cash: number;
    rawMaterials: number;
    finishedGoods: number;
    equipment: number;
    otherAssets: number;
    description?: string;
  }) => { success: boolean; error?: string };

  cancelTransaction: (transactionId: string, reason: string) => { success: boolean; error?: string };

  // Ledger & Calculation Methods
  getAccountBalance: (accountId: AccountId, upToDate?: string) => number;
  getCustomerReceivableBalance: (customerId: string, upToDate?: string) => number;
  getFilteredTransactions: () => Transaction[];
  
  // Financial Reporting Engine
  getProfitAndLossReport: () => {
    revenue: number;
    hpp: number;
    grossProfit: number;
    operationalExpenses: number;
    adjustmentExpenses: number;
    totalExpenses: number;
    netProfit: number;
  };
  getAssetBalanceReport: () => {
    cash: number;
    receivables: number;
    rawMaterials: number;
    finishedGoods: number;
    equipment: number;
    otherAssets: number;
    totalAssets: number;
  };
  getCashMovementsReport: () => Array<{
    date: string;
    transactionNo: string;
    description: string;
    cashIn: number;
    cashOut: number;
    runningBalance: number;
  }>;
  getCustomerReceivableReport: () => Array<{
    customerId: string;
    customerName: string;
    customerPhone: string;
    openingBalance: number;
    additions: number;
    reductions: number;
    endingBalance: number;
    transactionCount: number;
  }>;
  getInventoryReport: () => {
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

  resetToDemoData: () => void;
  clearAllData: () => void;
  clearTransactionsOnly: () => void;
  clearEverything: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [movements, setMovements] = useState<AccountMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [logs, setLogs] = useState<TransactionLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    preset: 'all',
    startDate: '',
    endDate: ''
  });

  const [activeView, setActiveView] = useState<string>('dashboard');

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  // Master Data Add/Update
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newId = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    setProducts(prev => [...prev, { ...prodData, id: newId }]);
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...prodData } : p)));
  };

  const addCustomer = (custData: Omit<Customer, 'id'>) => {
    const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    setCustomers(prev => [...prev, { ...custData, id: newId }]);
  };

  const updateCustomer = (id: string, custData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...custData } : c)));
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newId = `CAT-${catData.type.substring(0, 3)}-${String(categories.length + 1).padStart(2, '0')}`;
    setCategories(prev => [...prev, { ...catData, id: newId }]);
  };

  // Helper for generating Next Transaction Number
  const getNextTransactionNo = (prefix: string) => {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = transactions.filter(t => t.transactionNo.startsWith(`${prefix}-${ym}`)).length + 1;
    return `${prefix}-${ym}-${String(count).padStart(3, '0')}`;
  };

  // Calculate Account Balance
  const getAccountBalance = (accountId: AccountId, upToDate?: string): number => {
    const targetMovements = movements.filter(m => {
      if (m.accountId !== accountId) return false;
      if (upToDate) {
        const movDate = m.createdAt.split('T')[0];
        if (movDate > upToDate) return false;
      }
      return true;
    });

    return targetMovements.reduce((sum, m) => sum + m.signedAmount, 0);
  };

  // Customer Receivables Balance
  const getCustomerReceivableBalance = (customerId: string, upToDate?: string): number => {
    const custMovements = movements.filter(m => {
      if (m.accountId !== 'A02') return false;
      if (m.customerId !== customerId) return false;
      if (upToDate) {
        const movDate = m.createdAt.split('T')[0];
        if (movDate > upToDate) return false;
      }
      return true;
    });

    return custMovements.reduce((sum, m) => sum + m.signedAmount, 0);
  };

  // Filtered Transactions by Date Filter
  const getFilteredTransactions = (): Transaction[] => {
    const { start, end, isAll } = getPeriodDateRange(dateFilter);
    if (isAll) return transactions;
    return transactions.filter(t => t.transactionDate >= start && t.transactionDate <= end);
  };

  // 1. PENJUALAN (Section 4.1)
  const createSaleTransaction = (data: {
    transactionDate: string;
    customerId: string;
    items: Array<{
      productId: string;
      qty: number;
      sellingPrice: number;
      sellingHpp: number;
    }>;
    description?: string;
  }) => {
    if (!data.customerId) return { success: false, error: 'Customer wajib dipilih' };
    if (!data.items || data.items.length === 0) return { success: false, error: 'Minimal 1 produk harus dipilih' };

    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return { success: false, error: 'Customer tidak valid' };

    const txId = `TX-${Date.now()}`;
    const txNo = getNextTransactionNo('SL');
    const nowIso = new Date().toISOString();

    let totalSelling = 0;
    let totalHpp = 0;

    const txItems = data.items.map((item, idx) => {
      const product = products.find(p => p.id === item.productId);
      const itemTotalSelling = item.qty * item.sellingPrice;
      const itemTotalHpp = item.qty * item.sellingHpp;

      totalSelling += itemTotalSelling;
      totalHpp += itemTotalHpp;

      return {
        id: `ITEM-SL-${Date.now()}-${idx}`,
        transactionId: txId,
        productId: item.productId,
        productNameSnapshot: product?.name || 'Produk Tidak Diketahui',
        qty: item.qty,
        sellingPriceSnapshot: item.sellingPrice,
        sellingHppSnapshot: item.sellingHpp,
        rawMaterialHppSnapshot: product?.defaultRawMaterialHpp || 0,
        totalSelling: itemTotalSelling,
        totalHpp: itemTotalHpp,
        totalRawMaterial: 0
      };
    });

    const newTx: Transaction = {
      id: txId,
      transactionNo: txNo,
      transactionDate: data.transactionDate || getTodayDateString(),
      transactionType: 'SALE',
      customerId: data.customerId,
      customerNameSnapshot: customer.name,
      description: data.description || `Penjualan produk kepada ${customer.name}`,
      totalAmount: totalSelling,
      status: 'POSTED',
      items: txItems,
      createdBy: 'Operator (System)',
      createdAt: nowIso,
      postedAt: nowIso
    };

    // 4 Atomic Account Movements
    const newMovements: AccountMovement[] = [
      // 1. Pendapatan Penjualan (R01): + Total Penjualan
      {
        id: `MOV-${Date.now()}-1`,
        transactionId: txId,
        accountId: 'R01',
        signedAmount: totalSelling,
        description: `Pendapatan Penjualan ${txNo} - ${customer.name}`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      },
      // 2. Piutang (A02): + Total Penjualan (linked to customerId)
      {
        id: `MOV-${Date.now()}-2`,
        transactionId: txId,
        accountId: 'A02',
        customerId: data.customerId,
        signedAmount: totalSelling,
        description: `Piutang Usaha Penjualan ${txNo} - ${customer.name}`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      },
      // 3. Persediaan Barang Jadi (A04): - Total HPP
      {
        id: `MOV-${Date.now()}-3`,
        transactionId: txId,
        accountId: 'A04',
        signedAmount: -totalHpp,
        description: `Pengurangan Persediaan Barang Jadi (HPP ${txNo})`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      },
      // 4. HPP Penjualan (R02): + Total HPP
      {
        id: `MOV-${Date.now()}-4`,
        transactionId: txId,
        accountId: 'R02',
        signedAmount: totalHpp,
        description: `HPP Penjualan ${txNo}`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      }
    ];

    const log: TransactionLog = {
      id: `LOG-${Date.now()}`,
      transactionId: txId,
      action: 'POST',
      description: `Penjualan ${txNo} senilai ${totalSelling} berhasil diposting`,
      userId: 'Operator',
      createdAt: nowIso
    };

    setTransactions(prev => [newTx, ...prev]);
    setMovements(prev => [...prev, ...newMovements]);
    setLogs(prev => [log, ...prev]);

    return { success: true, transactionId: txId };
  };

  // 2. TRANSAKSI PENGELUARAN (Section 4.2)
  const createExpenseTransaction = (data: {
    transactionType: 'EXPENSE' | 'ASSET_EQUIPMENT' | 'RAW_PURCHASE' | 'DIRECT_LABOR' | 'OTHER_ASSET_ADD';
    transactionDate: string;
    categoryId?: string;
    description: string;
    amount: number;
  }) => {
    if (!data.amount || data.amount <= 0) return { success: false, error: 'Nominal harus lebih dari 0' };
    if (!data.description) return { success: false, error: 'Keterangan transaksi wajib diisi' };

    const prefixMap = {
      EXPENSE: 'EXP',
      ASSET_EQUIPMENT: 'EQP',
      RAW_PURCHASE: 'RAW',
      DIRECT_LABOR: 'LAB',
      OTHER_ASSET_ADD: 'AST'
    };

    const txId = `TX-${Date.now()}`;
    const txNo = getNextTransactionNo(prefixMap[data.transactionType]);
    const nowIso = new Date().toISOString();
    const category = categories.find(c => c.id === data.categoryId);

    const newTx: Transaction = {
      id: txId,
      transactionNo: txNo,
      transactionDate: data.transactionDate || getTodayDateString(),
      transactionType: data.transactionType,
      categoryId: data.categoryId,
      categoryNameSnapshot: category?.name,
      description: data.description,
      totalAmount: data.amount,
      status: 'POSTED',
      createdBy: 'Operator (System)',
      createdAt: nowIso,
      postedAt: nowIso
    };

    const newMovements: AccountMovement[] = [];
    const dateFormatted = `${data.transactionDate}T12:00:00Z`;

    // Cash always decreases by amount
    const cashOutMovement: AccountMovement = {
      id: `MOV-${Date.now()}-cash`,
      transactionId: txId,
      accountId: 'A01',
      signedAmount: -data.amount,
      description: `Pengeluaran Kas (${txNo}): ${data.description}`,
      createdAt: dateFormatted
    };

    let targetAccount: AccountId = 'B01';
    let targetDesc = data.description;

    switch (data.transactionType) {
      case 'EXPENSE':
        targetAccount = 'B01'; // Beban Operasional
        targetDesc = `Beban Operasional (${txNo}): ${data.description}`;
        break;
      case 'ASSET_EQUIPMENT':
        targetAccount = 'A05'; // Aset Peralatan
        targetDesc = `Pembelian Peralatan (${txNo}): ${data.description}`;
        break;
      case 'RAW_PURCHASE':
        targetAccount = 'A03'; // Persediaan Bahan Baku
        targetDesc = `Pembelian Bahan Baku (${txNo}): ${data.description}`;
        break;
      case 'DIRECT_LABOR':
        targetAccount = 'A04'; // Persediaan Barang Jadi bertambah
        targetDesc = `Biaya Tenaga Kerja Langsung (${txNo}): ${data.description}`;
        break;
      case 'OTHER_ASSET_ADD':
        targetAccount = 'A06'; // Aset Lainnya
        targetDesc = `Pembelian Aset Lainnya (${txNo}): ${data.description}`;
        break;
    }

    const debitMovement: AccountMovement = {
      id: `MOV-${Date.now()}-debit`,
      transactionId: txId,
      accountId: targetAccount,
      signedAmount: data.amount,
      description: targetDesc,
      createdAt: dateFormatted
    };

    newMovements.push(debitMovement, cashOutMovement);

    setTransactions(prev => [newTx, ...prev]);
    setMovements(prev => [...prev, ...newMovements]);
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        transactionId: txId,
        action: 'POST',
        description: `Transaksi pengeluaran ${txNo} senilai ${data.amount} diposting`,
        userId: 'Operator',
        createdAt: nowIso
      },
      ...prev
    ]);

    return { success: true };
  };

  // 3. PERSEDIAAN: INPUT BARANG JADI (Section 4.3)
  const createFinishedGoodsTransaction = (data: {
    transactionDate: string;
    productId: string;
    qty: number;
    rawMaterialHpp: number;
    description?: string;
  }) => {
    if (!data.productId) return { success: false, error: 'Produk wajib dipilih' };
    if (!data.qty || data.qty <= 0) return { success: false, error: 'Qty harus lebih dari 0' };
    if (!data.rawMaterialHpp || data.rawMaterialHpp <= 0) return { success: false, error: 'HPP Bahan Baku harus lebih dari 0' };

    const product = products.find(p => p.id === data.productId);
    if (!product) return { success: false, error: 'Produk tidak ditemukan' };

    const totalAmount = data.qty * data.rawMaterialHpp;
    const txId = `TX-${Date.now()}`;
    const txNo = getNextTransactionNo('FG');
    const nowIso = new Date().toISOString();

    const newTx: Transaction = {
      id: txId,
      transactionNo: txNo,
      transactionDate: data.transactionDate || getTodayDateString(),
      transactionType: 'FINISHED_GOODS',
      description: data.description || `Input Barang Jadi: ${product.name} (${data.qty} pcs)`,
      totalAmount,
      status: 'POSTED',
      items: [
        {
          id: `ITEM-FG-${Date.now()}`,
          transactionId: txId,
          productId: data.productId,
          productNameSnapshot: product.name,
          qty: data.qty,
          sellingPriceSnapshot: product.defaultSellingPrice,
          sellingHppSnapshot: product.defaultSellingHpp,
          rawMaterialHppSnapshot: data.rawMaterialHpp,
          totalSelling: 0,
          totalHpp: 0,
          totalRawMaterial: totalAmount
        }
      ],
      createdBy: 'Operator (System)',
      createdAt: nowIso,
      postedAt: nowIso
    };

    // Mutasi: Barang Jadi (A04) Bertambah, Bahan Baku (A03) Berkurang
    const newMovements: AccountMovement[] = [
      {
        id: `MOV-${Date.now()}-fg`,
        transactionId: txId,
        accountId: 'A04',
        signedAmount: totalAmount,
        description: `Penambahan Barang Jadi (${txNo}): ${product.name} (${data.qty} pcs)`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      },
      {
        id: `MOV-${Date.now()}-raw`,
        transactionId: txId,
        accountId: 'A03',
        signedAmount: -totalAmount,
        description: `Konversi Bahan Baku ke Barang Jadi (${txNo})`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      }
    ];

    setTransactions(prev => [newTx, ...prev]);
    setMovements(prev => [...prev, ...newMovements]);
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        transactionId: txId,
        action: 'POST',
        description: `Input barang jadi ${txNo} total ${totalAmount} diposting`,
        userId: 'Operator',
        createdAt: nowIso
      },
      ...prev
    ]);

    return { success: true };
  };

  // 4. KEUANGAN: PEMBAYARAN CUSTOMER (Section 4.4 C)
  const createCustomerPaymentTransaction = (data: {
    transactionDate: string;
    customerId: string;
    amount: number;
    description?: string;
  }) => {
    if (!data.customerId) return { success: false, error: 'Customer wajib dipilih' };
    if (!data.amount || data.amount <= 0) return { success: false, error: 'Nominal pembayaran harus lebih dari 0' };

    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return { success: false, error: 'Customer tidak ditemukan' };



    const txId = `TX-${Date.now()}`;
    const txNo = getNextTransactionNo('PAY');
    const nowIso = new Date().toISOString();

    const newTx: Transaction = {
      id: txId,
      transactionNo: txNo,
      transactionDate: data.transactionDate || getTodayDateString(),
      transactionType: 'CUSTOMER_PAYMENT',
      customerId: data.customerId,
      customerNameSnapshot: customer.name,
      description: data.description || `Pembayaran piutang dari ${customer.name}`,
      totalAmount: data.amount,
      status: 'POSTED',
      createdBy: 'Operator (Kasir)',
      createdAt: nowIso,
      postedAt: nowIso
    };

    // Mutasi: Kas (A01) Bertambah, Piutang (A02) Berkurang
    const newMovements: AccountMovement[] = [
      {
        id: `MOV-${Date.now()}-cash`,
        transactionId: txId,
        accountId: 'A01',
        signedAmount: data.amount,
        description: `Penerimaan Kas Pembayaran Piutang (${txNo}) - ${customer.name}`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      },
      {
        id: `MOV-${Date.now()}-ar`,
        transactionId: txId,
        accountId: 'A02',
        customerId: data.customerId,
        signedAmount: -data.amount,
        description: `Pelunasan Piutang (${txNo}) - ${customer.name}`,
        createdAt: `${data.transactionDate}T12:00:00Z`
      }
    ];

    setTransactions(prev => [newTx, ...prev]);
    setMovements(prev => [...prev, ...newMovements]);
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        transactionId: txId,
        action: 'POST',
        description: `Penerimaan pembayaran ${txNo} senilai ${data.amount} diposting`,
        userId: 'Operator',
        createdAt: nowIso
      },
      ...prev
    ]);

    return { success: true };
  };

  // 4. KEUANGAN: PIUTANG LAINNYA (Section 4.4 D)
  const createOtherReceivableTransaction = (data: {
    transactionType: 'OTHER_RECEIVABLE_ADD' | 'OTHER_RECEIVABLE_PAYMENT';
    transactionDate: string;
    description: string;
    amount: number;
    customerId?: string;
  }) => {
    if (!data.amount || data.amount <= 0) return { success: false, error: 'Nominal harus lebih dari 0' };
    if (!data.description) return { success: false, error: 'Keterangan wajib diisi' };

    const prefix = data.transactionType === 'OTHER_RECEIVABLE_ADD' ? 'ORA' : 'ORP';
    const txId = `TX-${Date.now()}`;
    const txNo = getNextTransactionNo(prefix);
    const nowIso = new Date().toISOString();

    const customer = data.customerId ? customers.find(c => c.id === data.customerId) : undefined;

    const newTx: Transaction = {
      id: txId,
      transactionNo: txNo,
      transactionDate: data.transactionDate || getTodayDateString(),
      transactionType: data.transactionType,
      customerId: data.customerId,
      customerNameSnapshot: customer?.name,
      description: data.description,
      totalAmount: data.amount,
      status: 'POSTED',
      createdBy: 'Operator',
      createdAt: nowIso,
      postedAt: nowIso
    };

    const newMovements: AccountMovement[] = [];
    const dateFormatted = `${data.transactionDate}T12:00:00Z`;

    if (data.transactionType === 'OTHER_RECEIVABLE_ADD') {
      // Penambahan piutang lainnya: Piutang bertambah
      newMovements.push({
        id: `MOV-${Date.now()}-ar-add`,
        transactionId: txId,
        accountId: 'A02',
        customerId: data.customerId,
        signedAmount: data.amount,
        description: `Penambahan Piutang Lainnya (${txNo}): ${data.description}`,
        createdAt: dateFormatted
      });
    } else {
      // Pembayaran piutang lainnya: Kas bertambah, Piutang berkurang
      newMovements.push(
        {
          id: `MOV-${Date.now()}-cash-orp`,
          transactionId: txId,
          accountId: 'A01',
          signedAmount: data.amount,
          description: `Penerimaan Kas Piutang Lainnya (${txNo}): ${data.description}`,
          createdAt: dateFormatted
        },
        {
          id: `MOV-${Date.now()}-ar-orp`,
          transactionId: txId,
          accountId: 'A02',
          customerId: data.customerId,
          signedAmount: -data.amount,
          description: `Pelunasan Piutang Lainnya (${txNo}): ${data.description}`,
          createdAt: dateFormatted
        }
      );
    }

    setTransactions(prev => [newTx, ...prev]);
    setMovements(prev => [...prev, ...newMovements]);
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        transactionId: txId,
        action: 'POST',
        description: `Transaksi piutang lainnya ${txNo} senilai ${data.amount} diposting`,
        userId: 'Operator',
        createdAt: nowIso
      },
      ...prev
    ]);

    return { success: true };
  };

  // 5. OPNAME (Section 4.5 - Penyesuaian Alur Bisnis Baru)
  const createOpnameTransaction = (data: {
    transactionDate: string;
    accountId: AccountId;
    actualAmount: number;
    reason: string;
    targetDestination?: string;
    customerId?: string;
  }) => {
    if (!data.accountId) return { success: false, error: 'Objek opname wajib dipilih' };
    if (!data.reason) return { success: false, error: 'Alasan pemeriksaan opname wajib diisi' };

    const systemAmount = getAccountBalance(data.accountId, data.transactionDate);
    const difference = data.actualAmount - systemAmount;

    if (difference === 0) {
      return { success: false, error: 'Tidak ada selisih antara nilai aktual dan saldo sistem (selisih nol)' };
    }

    const txId = `TX-${Date.now()}`;
    const txNo = getNextTransactionNo('OPN');
    const nowIso = new Date().toISOString();

    const account = accounts.find(a => a.id === data.accountId);

    const newTx: Transaction = {
      id: txId,
      transactionNo: txNo,
      transactionDate: data.transactionDate || getTodayDateString(),
      transactionType: 'OPNAME',
      description: `Opname ${account?.name || data.accountId}: Aktual Rp ${data.actualAmount.toLocaleString()} vs Sistem Rp ${systemAmount.toLocaleString()} (Selisih: ${difference >= 0 ? '+' : ''}${difference.toLocaleString()})`,
      totalAmount: Math.abs(difference),
      status: 'POSTED',
      createdBy: 'Tim Audit Internal',
      createdAt: nowIso,
      postedAt: nowIso,
      opnameDetail: {
        id: `OPND-${Date.now()}`,
        transactionId: txId,
        accountId: data.accountId,
        customerId: data.customerId,
        systemAmount,
        actualAmount: data.actualAmount,
        differenceAmount: difference,
        reason: data.reason,
        targetDestination: data.targetDestination
      }
    };

    const newMovements: AccountMovement[] = [];
    const dateFormatted = `${data.transactionDate}T12:00:00Z`;

    // 1. Akun utama yang diperiksa selalu disesuaikan sebesar selisih (difference)
    newMovements.push({
      id: `MOV-${Date.now()}-opn-primary`,
      transactionId: txId,
      accountId: data.accountId,
      signedAmount: difference,
      description: `Penyesuaian Opname ${account?.name} (${difference >= 0 ? '+' : ''}${difference})`,
      createdAt: dateFormatted
    });

    // 2. Routing Akun Penyeimbang sesuai aturan baru:
    // A. Bahan Baku (A03): Diarahkan ke Persediaan Barang Jadi (A04)
    if (data.accountId === 'A03') {
      newMovements.push({
        id: `MOV-${Date.now()}-opn-fg`,
        transactionId: txId,
        accountId: 'A04',
        signedAmount: -difference,
        description: `Penyeimbang Opname Bahan Baku dialihkan ke Persediaan Barang Jadi (A04)`,
        createdAt: dateFormatted
      });
    }
    // B. Barang Jadi (A04): Opsi ke HPP Penjualan (R02) atau Aset Lainnya (A06)
    else if (data.accountId === 'A04') {
      const dest = data.targetDestination || 'HPP';
      if (dest === 'HPP' || dest === 'R02') {
        newMovements.push({
          id: `MOV-${Date.now()}-opn-hpp`,
          transactionId: txId,
          accountId: 'R02',
          signedAmount: -difference,
          description: `Penyeimbang Opname Barang Jadi dialihkan ke HPP Penjualan (R02)`,
          createdAt: dateFormatted
        });
      } else {
        newMovements.push({
          id: `MOV-${Date.now()}-opn-a06`,
          transactionId: txId,
          accountId: 'A06',
          signedAmount: -difference,
          description: `Penyeimbang Opname Barang Jadi dialihkan ke Aset Lainnya (A06)`,
          createdAt: dateFormatted
        });
      }
    }
    // C. Peralatan (A05): Diarahkan ke Beban Operasional sebagai Beban Penyusutan (B01)
    else if (data.accountId === 'A05') {
      newMovements.push({
        id: `MOV-${Date.now()}-opn-depr`,
        transactionId: txId,
        accountId: 'B01',
        signedAmount: -difference,
        description: `Beban Penyusutan Peralatan & Mesin (B01)`,
        createdAt: dateFormatted
      });
    }
    // D. Aset Lainnya (A06): Opsi ke Beban Penyesuaian (B02) atau Penyesuaian Langsung
    else if (data.accountId === 'A06') {
      const dest = data.targetDestination || 'BEBAN';
      if (dest === 'BEBAN' || dest === 'B02') {
        newMovements.push({
          id: `MOV-${Date.now()}-opn-b02`,
          transactionId: txId,
          accountId: 'B02',
          signedAmount: -difference,
          description: `Beban Penyesuaian Aset Lainnya (B02)`,
          createdAt: dateFormatted
        });
      }
      // Jika 'LANGSUNG', tidak perlu penyeimbang kedua karena akun A06 sudah dimutasi di langkah 1
    }
    // E. Kas (A01): Penyeimbang ke Aset Lainnya (A06)
    else if (data.accountId === 'A01') {
      newMovements.push({
        id: `MOV-${Date.now()}-opn-kas-bal`,
        transactionId: txId,
        accountId: 'A06',
        signedAmount: -difference,
        description: `Penyeimbang Opname Fisik Kas ke Aset Lainnya (A06)`,
        createdAt: dateFormatted
      });
    }
    // F. Piutang (A02): Penyesuaian langsung pada saldo Piutang (dengan customerId jika ada)
    else if (data.accountId === 'A02' && data.customerId) {
      // Update primary movement to link with customerId
      newMovements[0].customerId = data.customerId;
    }

    setTransactions(prev => [newTx, ...prev]);
    setMovements(prev => [...prev, ...newMovements]);
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        transactionId: txId,
        action: 'POST',
        description: `Opname ${txNo} berhasil diposting dengan selisih ${difference}`,
        userId: 'Tim Audit',
        createdAt: nowIso
      },
      ...prev
    ]);

    return { success: true };
  };

  // 6. PEMBATALAN TRANSAKSI DENGAN MUTASI PEMBALIK (Section 8.2)
  const cancelTransaction = (transactionId: string, reason: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return { success: false, error: 'Transaksi tidak ditemukan' };
    if (tx.status === 'CANCELLED') return { success: false, error: 'Transaksi sudah dibatalkan sebelumnya' };
    if (!reason || reason.trim() === '') return { success: false, error: 'Alasan pembatalan wajib diisi' };

    const relatedMovements = movements.filter(m => m.transactionId === transactionId);
    const nowIso = new Date().toISOString();

    // Buat mutasi pembalik atomik (signed amount dikali -1)
    const reversalMovements: AccountMovement[] = relatedMovements.map((m, idx) => ({
      id: `MOV-REV-${Date.now()}-${idx}`,
      transactionId: transactionId,
      accountId: m.accountId,
      customerId: m.customerId,
      signedAmount: -m.signedAmount,
      description: `[PEMBATALAN ${tx.transactionNo}] ${m.description} - Alasan: ${reason}`,
      createdAt: nowIso
    }));

    // Update status transaksi
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? {
              ...t,
              status: 'CANCELLED',
              cancellationReason: reason,
              cancelledAt: nowIso
            }
          : t
      )
    );

    // Append reversal movements
    setMovements(prev => [...prev, ...reversalMovements]);

    // Catat audit log
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        transactionId,
        action: 'CANCEL',
        description: `Transaksi ${tx.transactionNo} dibatalkan. Alasan: ${reason}`,
        userId: 'Operator',
        createdAt: nowIso
      },
      ...prev
    ]);

    return { success: true };
  };

  // 7. REPORTING ENGINES (Section 9)

  // 9.1 Laba Rugi Sederhana (Strict Period Filter)
  const getProfitAndLossReport = () => {
    const { start, end, isAll } = getPeriodDateRange(dateFilter);

    const filteredMovements = movements.filter(m => {
      if (isAll) return true;
      const date = m.createdAt.split('T')[0];
      return date >= start && date <= end;
    });

    const revenue = filteredMovements
      .filter(m => m.accountId === 'R01')
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const hpp = filteredMovements
      .filter(m => m.accountId === 'R02')
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const grossProfit = revenue - hpp;

    const operationalExpenses = filteredMovements
      .filter(m => m.accountId === 'B01')
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const adjustmentExpenses = filteredMovements
      .filter(m => m.accountId === 'B02')
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const totalExpenses = operationalExpenses + adjustmentExpenses;
    const netProfit = grossProfit - totalExpenses;

    return {
      revenue,
      hpp,
      grossProfit,
      operationalExpenses,
      adjustmentExpenses,
      totalExpenses,
      netProfit
    };
  };

  // 9.2 Laporan Saldo Aset (As-Of Cut-Off Date of Selected Period)
  const getAssetBalanceReport = () => {
    const { end, isAll } = getPeriodDateRange(dateFilter);
    const cutOffDate = isAll ? undefined : end;

    const cash = getAccountBalance('A01', cutOffDate);
    const receivables = getAccountBalance('A02', cutOffDate);
    const rawMaterials = getAccountBalance('A03', cutOffDate);
    const finishedGoods = getAccountBalance('A04', cutOffDate);
    const equipment = getAccountBalance('A05', cutOffDate);
    const otherAssets = getAccountBalance('A06', cutOffDate);
    const totalAssets = cash + receivables + rawMaterials + finishedGoods + equipment + otherAssets;

    return {
      cash,
      receivables,
      rawMaterials,
      finishedGoods,
      equipment,
      otherAssets,
      totalAssets
    };
  };

  // 9.3 Laporan Mutasi Kas (Running Balance Ledger with Opening Balance)
  const getCashMovementsReport = () => {
    const { start, end, isAll } = getPeriodDateRange(dateFilter);

    const allCashMovements = movements
      .filter(m => m.accountId === 'A01')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Calculate Saldo Awal from prior movements before the period
    const openingBalance = isAll || !start
      ? 0
      : allCashMovements
          .filter(m => m.createdAt.split('T')[0] < start)
          .reduce((sum, m) => sum + m.signedAmount, 0);

    const periodCashMovements = isAll
      ? allCashMovements
      : allCashMovements.filter(m => {
          const d = m.createdAt.split('T')[0];
          return d >= start && d <= end;
        });

    let runningBalance = openingBalance;
    const result: Array<{
      date: string;
      transactionNo: string;
      description: string;
      cashIn: number;
      cashOut: number;
      runningBalance: number;
    }> = [];

    periodCashMovements.forEach(m => {
      const tx = transactions.find(t => t.id === m.transactionId);
      const cashIn = m.signedAmount > 0 ? m.signedAmount : 0;
      const cashOut = m.signedAmount < 0 ? Math.abs(m.signedAmount) : 0;
      runningBalance += m.signedAmount;

      result.push({
        date: m.createdAt.split('T')[0],
        transactionNo: tx?.transactionNo || 'ADJ-CASH',
        description: m.description,
        cashIn,
        cashOut,
        runningBalance
      });
    });

    return result.reverse(); // Newest first
  };

  // 9.4 Laporan Piutang Pelanggan (Period Additions vs Reductions)
  const getCustomerReceivableReport = () => {
    const { start, end, isAll } = getPeriodDateRange(dateFilter);

    return customers.map(cust => {
      const custMovements = movements.filter(m => m.accountId === 'A02' && m.customerId === cust.id);

      const openingBalance = isAll || !start
        ? 0
        : custMovements
            .filter(m => m.createdAt.split('T')[0] < start)
            .reduce((sum, m) => sum + m.signedAmount, 0);

      const periodMovements = isAll
        ? custMovements
        : custMovements.filter(m => {
            const d = m.createdAt.split('T')[0];
            return d >= start && d <= end;
          });

      const additions = periodMovements
        .filter(m => m.signedAmount > 0)
        .reduce((sum, m) => sum + m.signedAmount, 0);

      const reductions = periodMovements
        .filter(m => m.signedAmount < 0)
        .reduce((sum, m) => sum + Math.abs(m.signedAmount), 0);

      const endingBalance = openingBalance + additions - reductions;

      return {
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        openingBalance,
        additions,
        reductions,
        endingBalance,
        transactionCount: periodMovements.length
      };
    });
  };

  // 9.5 Laporan Persediaan Nominal (Period-Accurate Flow Equation)
  const getInventoryReport = () => {
    const { start, end, isAll } = getPeriodDateRange(dateFilter);

    // Bahan Baku (A03)
    const rawAll = movements.filter(m => m.accountId === 'A03');
    const rawOpening = isAll || !start
      ? rawAll
          .filter(m => {
            const tx = transactions.find(t => t.id === m.transactionId);
            return tx?.transactionType === 'OPENING_BALANCE';
          })
          .reduce((sum, m) => sum + m.signedAmount, 0)
      : rawAll
          .filter(m => m.createdAt.split('T')[0] < start)
          .reduce((sum, m) => sum + m.signedAmount, 0);

    const rawPeriod = isAll
      ? rawAll
      : rawAll.filter(m => {
          const d = m.createdAt.split('T')[0];
          return d >= start && d <= end;
        });

    const rawPurchases = rawPeriod
      .filter(m => {
        const tx = transactions.find(t => t.id === m.transactionId);
        return tx?.transactionType === 'RAW_PURCHASE';
      })
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const rawUsedInFG = rawPeriod
      .filter(m => {
        const tx = transactions.find(t => t.id === m.transactionId);
        return tx?.transactionType === 'FINISHED_GOODS';
      })
      .reduce((sum, m) => sum + Math.abs(m.signedAmount), 0);

    const rawOpname = rawPeriod
      .filter(m => {
        const tx = transactions.find(t => t.id === m.transactionId);
        return tx?.transactionType === 'OPNAME';
      })
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const rawEnding = isAll ? getAccountBalance('A03') : getAccountBalance('A03', end);

    // Barang Jadi (A04)
    const fgAll = movements.filter(m => m.accountId === 'A04');
    const fgOpening = isAll || !start
      ? fgAll
          .filter(m => {
            const tx = transactions.find(t => t.id === m.transactionId);
            return tx?.transactionType === 'OPENING_BALANCE';
          })
          .reduce((sum, m) => sum + m.signedAmount, 0)
      : fgAll
          .filter(m => m.createdAt.split('T')[0] < start)
          .reduce((sum, m) => sum + m.signedAmount, 0);

    const fgPeriod = isAll
      ? fgAll
      : fgAll.filter(m => {
          const d = m.createdAt.split('T')[0];
          return d >= start && d <= end;
        });

    const fgProduced = fgPeriod
      .filter(m => {
        const tx = transactions.find(t => t.id === m.transactionId);
        return tx?.transactionType === 'FINISHED_GOODS';
      })
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const fgDirectLabor = fgPeriod
      .filter(m => {
        const tx = transactions.find(t => t.id === m.transactionId);
        return tx?.transactionType === 'DIRECT_LABOR';
      })
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const fgSoldHpp = fgPeriod
      .filter(m => {
        const tx = transactions.find(t => t.id === m.transactionId);
        return tx?.transactionType === 'SALE';
      })
      .reduce((sum, m) => sum + Math.abs(m.signedAmount), 0);

    const fgOpname = fgPeriod
      .filter(m => {
        const tx = transactions.find(t => t.id === m.transactionId);
        return tx?.transactionType === 'OPNAME';
      })
      .reduce((sum, m) => sum + m.signedAmount, 0);

    const fgEnding = isAll ? getAccountBalance('A04') : getAccountBalance('A04', end);

    return {
      rawMaterials: {
        opening: rawOpening,
        purchases: rawPurchases,
        usedInFinishedGoods: rawUsedInFG,
        opnameAdjustment: rawOpname,
        ending: rawEnding
      },
      finishedGoods: {
        opening: fgOpening,
        produced: fgProduced,
        directLabor: fgDirectLabor,
        soldHpp: fgSoldHpp,
        opnameAdjustment: fgOpname,
        ending: fgEnding
      }
    };
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setMovements(INITIAL_MOVEMENTS);
    setLogs(INITIAL_LOGS);

    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_LOGS));
  };

  const createOpeningBalanceTransaction = (data: {
    transactionDate: string;
    cash: number;
    rawMaterials: number;
    finishedGoods: number;
    equipment: number;
    otherAssets: number;
    description?: string;
  }) => {
    const totalAmount = data.cash + data.rawMaterials + data.finishedGoods + data.equipment + data.otherAssets;
    if (totalAmount <= 0) return { success: false, error: 'Total saldo awal harus lebih besar dari 0' };

    const txId = `TX-${Date.now()}`;
    const txNo = getNextTransactionNo('OPN');
    const nowIso = new Date().toISOString();
    const dateFormatted = `${data.transactionDate}T12:00:00Z`;

    const newTx: Transaction = {
      id: txId,
      transactionNo: txNo,
      transactionDate: data.transactionDate || getTodayDateString(),
      transactionType: 'OPENING_BALANCE',
      description: data.description || 'Pencatatan Saldo Awal Modal Perusahaan',
      totalAmount,
      status: 'POSTED',
      createdBy: 'Owner / Administrator',
      createdAt: nowIso,
      postedAt: nowIso
    };

    const newMovements: AccountMovement[] = [];
    if (data.cash > 0) {
      newMovements.push({
        id: `MOV-${Date.now()}-a01`,
        transactionId: txId,
        accountId: 'A01',
        signedAmount: data.cash,
        description: 'Saldo Awal Kas Operasional',
        createdAt: dateFormatted
      });
    }
    if (data.rawMaterials > 0) {
      newMovements.push({
        id: `MOV-${Date.now()}-a03`,
        transactionId: txId,
        accountId: 'A03',
        signedAmount: data.rawMaterials,
        description: 'Saldo Awal Persediaan Bahan Baku',
        createdAt: dateFormatted
      });
    }
    if (data.finishedGoods > 0) {
      newMovements.push({
        id: `MOV-${Date.now()}-a04`,
        transactionId: txId,
        accountId: 'A04',
        signedAmount: data.finishedGoods,
        description: 'Saldo Awal Persediaan Barang Jadi',
        createdAt: dateFormatted
      });
    }
    if (data.equipment > 0) {
      newMovements.push({
        id: `MOV-${Date.now()}-a05`,
        transactionId: txId,
        accountId: 'A05',
        signedAmount: data.equipment,
        description: 'Saldo Awal Aset Peralatan & Mesin',
        createdAt: dateFormatted
      });
    }
    if (data.otherAssets > 0) {
      newMovements.push({
        id: `MOV-${Date.now()}-a06`,
        transactionId: txId,
        accountId: 'A06',
        signedAmount: data.otherAssets,
        description: 'Saldo Awal Aset Lainnya',
        createdAt: dateFormatted
      });
    }

    setTransactions(prev => [newTx, ...prev]);
    setMovements(prev => [...prev, ...newMovements]);
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        transactionId: txId,
        action: 'POST',
        description: `Saldo awal ${txNo} senilai ${totalAmount} diposting`,
        userId: 'Owner',
        createdAt: nowIso
      },
      ...prev
    ]);

    return { success: true };
  };

  const clearTransactionsOnly = () => {
    setTransactions([]);
    setMovements([]);
    setLogs([]);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([]));
  };

  const clearEverything = () => {
    setTransactions([]);
    setMovements([]);
    setLogs([]);
    setProducts([]);
    setCustomers([]);
    setCategories([]);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([]));
  };

  const clearAllData = clearTransactionsOnly;

  return (
    <FinancialContext.Provider
      value={{
        accounts,
        products,
        customers,
        categories,
        transactions,
        movements,
        logs,
        dateFilter,
        setDateFilter,
        activeView,
        setActiveView,
        addProduct,
        updateProduct,
        addCustomer,
        updateCustomer,
        addCategory,
        createSaleTransaction,
        createExpenseTransaction,
        createFinishedGoodsTransaction,
        createCustomerPaymentTransaction,
        createOtherReceivableTransaction,
        createOpnameTransaction,
        createOpeningBalanceTransaction,
        cancelTransaction,
        getAccountBalance,
        getCustomerReceivableBalance,
        getFilteredTransactions,
        getProfitAndLossReport,
        getAssetBalanceReport,
        getCashMovementsReport,
        getCustomerReceivableReport,
        getInventoryReport,
        resetToDemoData,
        clearAllData,
        clearTransactionsOnly,
        clearEverything
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
