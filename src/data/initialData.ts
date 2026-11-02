import {
  Account,
  Product,
  Customer,
  Category,
  Transaction,
  AccountMovement,
  TransactionLog
} from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'A01', name: 'Kas Operasional', group: 'Aset', initialBalance: 0 },
  { id: 'A02', name: 'Piutang Usaha', group: 'Aset', initialBalance: 0 },
  { id: 'A03', name: 'Persediaan Bahan Baku', group: 'Aset', initialBalance: 0 },
  { id: 'A04', name: 'Persediaan Barang Jadi', group: 'Aset', initialBalance: 0 },
  { id: 'A05', name: 'Aset Peralatan & Mesin', group: 'Aset', initialBalance: 0 },
  { id: 'A06', name: 'Aset Lainnya', group: 'Aset', initialBalance: 0 },
  { id: 'R01', name: 'Pendapatan Penjualan', group: 'Pendapatan', initialBalance: 0 },
  { id: 'R02', name: 'HPP Penjualan', group: 'HPP', initialBalance: 0 },
  { id: 'B01', name: 'Beban Operasional', group: 'Beban', initialBalance: 0 },
  { id: 'B02', name: 'Beban Penyesuaian', group: 'Beban', initialBalance: 0 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'PRD-001',
    code: 'BOX-CORR-01',
    name: 'Box Kemasan Corrugated Sablon 25x20x10',
    defaultSellingPrice: 12500,
    defaultSellingHpp: 8000,
    defaultRawMaterialHpp: 5500,
    status: 'ACTIVE'
  },
  {
    id: 'PRD-002',
    code: 'CUP-DBL-08',
    name: 'Paper Cup Double Wall Hot 8oz Logo',
    defaultSellingPrice: 1800,
    defaultSellingHpp: 1100,
    defaultRawMaterialHpp: 800,
    status: 'ACTIVE'
  },
  {
    id: 'PRD-003',
    code: 'TOT-KNV-01',
    name: 'Tote Bag Kanvas Premium 35x40 cm Sablon 2 Sisi',
    defaultSellingPrice: 35000,
    defaultSellingHpp: 22000,
    defaultRawMaterialHpp: 16000,
    status: 'ACTIVE'
  },
  {
    id: 'PRD-004',
    code: 'BTL-TMB-50',
    name: 'Tumbler Stainless Vacuum 500ml Grafir Laser',
    defaultSellingPrice: 65000,
    defaultSellingHpp: 42000,
    defaultRawMaterialHpp: 35000,
    status: 'ACTIVE'
  },
  {
    id: 'PRD-005',
    code: 'STK-VNY-01',
    name: 'Stiker Label Vinyl Waterproof UV Die-Cut',
    defaultSellingPrice: 950,
    defaultSellingHpp: 500,
    defaultRawMaterialHpp: 350,
    status: 'ACTIVE'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    code: 'CUST-KOP-01',
    name: 'Kopi Kenangan Senopati',
    phone: '0812-9876-1001',
    address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    status: 'ACTIVE'
  },
  {
    id: 'CUST-002',
    code: 'CUST-ROT-02',
    name: 'Toko Roti Mawar Indah',
    phone: '0813-8765-4002',
    address: 'Jl. Riau No. 115, Citarum, Bandung',
    status: 'ACTIVE'
  },
  {
    id: 'CUST-003',
    code: 'CUST-BRK-03',
    name: 'CV Berkah Abadi Jaya',
    phone: '0811-2345-6003',
    address: 'Kawasan Industri MM2100 Blok C-4, Cikarang Barat, Bekasi',
    status: 'ACTIVE'
  },
  {
    id: 'CUST-004',
    code: 'CUST-HTL-04',
    name: 'Hotel Grand Santika Premiere',
    phone: '0817-6543-2004',
    address: 'Jl. Pemuda No. 78, Genteng, Surabaya',
    status: 'ACTIVE'
  },
  {
    id: 'CUST-005',
    code: 'CUST-SRY-05',
    name: 'PT Surya Digital Niaga',
    phone: '0819-0876-5005',
    address: 'The Breeze BSD City Kav. 2A, Tangerang Selatan',
    status: 'ACTIVE'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'CAT-EXP-01', name: 'Listrik & Air Pabrik (PLN & PAM)', type: 'EXPENSE' },
  { id: 'CAT-EXP-02', name: 'Internet Fiber & Cloud IT System', type: 'EXPENSE' },
  { id: 'CAT-EXP-03', name: 'Ongkir & Logistik Pengiriman Ekspedisi', type: 'EXPENSE' },
  { id: 'CAT-EXP-04', name: 'Sewa Workshop & Gudang Penyimpanan', type: 'EXPENSE' },
  { id: 'CAT-EXP-05', name: 'Pemasaran Digital & Meta Ads', type: 'EXPENSE' },
  { id: 'CAT-EXP-06', name: 'ATK & Keperluan Operasional Kantor', type: 'EXPENSE' },
  { id: 'CAT-EXP-07', name: 'Perawatan & Servis Mesin Cetak', type: 'EXPENSE' },
  { id: 'CAT-AST-01', name: 'Mesin Produksi & Peralatan Cetak', type: 'ASSET' },
  { id: 'CAT-AST-02', name: 'Bahan Baku Kertas Kraft & Tinta Eco', type: 'ASSET' },
  { id: 'CAT-AST-03', name: 'Tenaga Kerja Langsung (Sablon & Finishing)', type: 'ASSET' },
  { id: 'CAT-AST-04', name: 'Aset Inventaris & Perlengkapan Lainnya', type: 'ASSET' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-202610-001',
    transactionNo: 'OPN-202610-001',
    transactionDate: '2026-10-01',
    transactionType: 'OPENING_BALANCE',
    description: 'Setoran Saldo Awal Modal Perusahaan (Kas, Persediaan, Peralatan)',
    totalAmount: 115000000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-01T08:00:00Z',
    postedAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'TX-202610-002',
    transactionNo: 'RAW-202610-001',
    transactionDate: '2026-10-05',
    transactionType: 'RAW_PURCHASE',
    categoryId: 'CAT-AST-02',
    categoryNameSnapshot: 'Bahan Baku Kertas Kraft & Tinta Eco',
    description: 'Pembelian 15 Roll Kertas Kraft Corrugated & Tinta Sablon Waterbased',
    totalAmount: 8500000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-05T09:30:00Z',
    postedAt: '2026-10-05T09:30:00Z'
  },
  {
    id: 'TX-202610-003',
    transactionNo: 'LAB-202610-001',
    transactionDate: '2026-10-08',
    transactionType: 'DIRECT_LABOR',
    categoryId: 'CAT-AST-03',
    categoryNameSnapshot: 'Tenaga Kerja Langsung (Sablon & Finishing)',
    description: 'Upah Tenaga Kerja Langsung Borongan Sablon & Lem Box Kemasan',
    totalAmount: 3200000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-08T16:00:00Z',
    postedAt: '2026-10-08T16:00:00Z'
  },
  {
    id: 'TX-202610-004',
    transactionNo: 'FG-202610-001',
    transactionDate: '2026-10-10',
    transactionType: 'FINISHED_GOODS',
    description: 'Penyelesaian Produksi 1.000 pcs Box Kemasan Corrugated Sablon',
    totalAmount: 5500000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-10T14:15:00Z',
    postedAt: '2026-10-10T14:15:00Z',
    items: [
      {
        id: 'ITEM-FG-001',
        transactionId: 'TX-202610-004',
        productId: 'PRD-001',
        productNameSnapshot: 'Box Kemasan Corrugated Sablon 25x20x10',
        qty: 1000,
        sellingPriceSnapshot: 12500,
        sellingHppSnapshot: 8000,
        rawMaterialHppSnapshot: 5500,
        totalSelling: 12500000,
        totalHpp: 8000000,
        totalRawMaterial: 5500000
      }
    ]
  },
  {
    id: 'TX-202610-005',
    transactionNo: 'SL-202610-001',
    transactionDate: '2026-10-15',
    transactionType: 'SALE',
    customerId: 'CUST-001',
    customerNameSnapshot: 'Kopi Kenangan Senopati',
    description: 'Penjualan 800 pcs Box Kemasan Corrugated Sablon',
    totalAmount: 10000000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-15T11:00:00Z',
    postedAt: '2026-10-15T11:00:00Z',
    items: [
      {
        id: 'ITEM-SL-001',
        transactionId: 'TX-202610-005',
        productId: 'PRD-001',
        productNameSnapshot: 'Box Kemasan Corrugated Sablon 25x20x10',
        qty: 800,
        sellingPriceSnapshot: 12500,
        sellingHppSnapshot: 8000,
        rawMaterialHppSnapshot: 5500,
        totalSelling: 10000000,
        totalHpp: 6400000,
        totalRawMaterial: 4400000
      }
    ]
  },
  {
    id: 'TX-202610-006',
    transactionNo: 'SL-202610-002',
    transactionDate: '2026-10-18',
    transactionType: 'SALE',
    customerId: 'CUST-002',
    customerNameSnapshot: 'Toko Roti Mawar Indah',
    description: 'Penjualan 2.500 pcs Paper Cup Double Wall Hot 8oz',
    totalAmount: 4500000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-18T10:30:00Z',
    postedAt: '2026-10-18T10:30:00Z',
    items: [
      {
        id: 'ITEM-SL-002',
        transactionId: 'TX-202610-006',
        productId: 'PRD-002',
        productNameSnapshot: 'Paper Cup Double Wall Hot 8oz Logo',
        qty: 2500,
        sellingPriceSnapshot: 1800,
        sellingHppSnapshot: 1100,
        rawMaterialHppSnapshot: 800,
        totalSelling: 4500000,
        totalHpp: 2750000,
        totalRawMaterial: 2000000
      }
    ]
  },
  {
    id: 'TX-202610-007',
    transactionNo: 'EXP-202610-001',
    transactionDate: '2026-10-20',
    transactionType: 'EXPENSE',
    categoryId: 'CAT-EXP-01',
    categoryNameSnapshot: 'Listrik & Air Pabrik (PLN & PAM)',
    description: 'Tagihan Listrik Workshop Periode Oktober 2026',
    totalAmount: 1850000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-20T13:00:00Z',
    postedAt: '2026-10-20T13:00:00Z'
  },
  {
    id: 'TX-202610-008',
    transactionNo: 'EXP-202610-002',
    transactionDate: '2026-10-22',
    transactionType: 'EXPENSE',
    categoryId: 'CAT-EXP-02',
    categoryNameSnapshot: 'Internet Fiber & Cloud IT System',
    description: 'Biaya Langganan Internet Biznet 150 Mbps & Cloud Server',
    totalAmount: 750000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-22T09:00:00Z',
    postedAt: '2026-10-22T09:00:00Z'
  },
  {
    id: 'TX-202610-009',
    transactionNo: 'PAY-202610-001',
    transactionDate: '2026-10-25',
    transactionType: 'CUSTOMER_PAYMENT',
    customerId: 'CUST-001',
    customerNameSnapshot: 'Kopi Kenangan Senopati',
    description: 'Penerimaan Pembayaran Parsial Piutang Penjualan Box Kemasan',
    totalAmount: 7000000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-25T15:20:00Z',
    postedAt: '2026-10-25T15:20:00Z'
  },
  {
    id: 'TX-202610-010',
    transactionNo: 'EQP-202610-001',
    transactionDate: '2026-10-28',
    transactionType: 'ASSET_EQUIPMENT',
    categoryId: 'CAT-AST-01',
    categoryNameSnapshot: 'Mesin Produksi & Peralatan Cetak',
    description: 'Pembelian 1 Unit Mesin Digital Hot Foil & Embossing Presisi',
    totalAmount: 6500000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-28T11:45:00Z',
    postedAt: '2026-10-28T11:45:00Z'
  },
  {
    id: 'TX-202610-011',
    transactionNo: 'OPN-202610-002',
    transactionDate: '2026-10-31',
    transactionType: 'OPNAME',
    description: 'Penyesuaian Fisik Opname Akhir Bulan Bahan Baku Kertas (Selisih -Rp 250.000 dialihkan ke Aset Lainnya)',
    totalAmount: 250000,
    status: 'POSTED',
    createdBy: 'Nurhasan (Owner)',
    createdAt: '2026-10-31T17:00:00Z',
    postedAt: '2026-10-31T17:00:00Z',
    opnameDetail: {
      id: 'OPND-001',
      transactionId: 'TX-202610-011',
      accountId: 'A03',
      systemAmount: 23000000,
      actualAmount: 22750000,
      differenceAmount: -250000,
      reason: 'Penyusutan bahan baku kertas terpapar kelembaban saat penyimpanan gudang'
    }
  }
];

export const INITIAL_MOVEMENTS: AccountMovement[] = [
  // TX-202610-001: Opening Balance
  {
    id: 'MOV-001',
    transactionId: 'TX-202610-001',
    accountId: 'A01',
    signedAmount: 50000000,
    description: 'Saldo Awal Kas',
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'MOV-002',
    transactionId: 'TX-202610-001',
    accountId: 'A03',
    signedAmount: 20000000,
    description: 'Saldo Awal Persediaan Bahan Baku',
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'MOV-003',
    transactionId: 'TX-202610-001',
    accountId: 'A04',
    signedAmount: 15000000,
    description: 'Saldo Awal Persediaan Barang Jadi',
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'MOV-004',
    transactionId: 'TX-202610-001',
    accountId: 'A05',
    signedAmount: 25000000,
    description: 'Saldo Awal Aset Peralatan',
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: 'MOV-005',
    transactionId: 'TX-202610-001',
    accountId: 'A06',
    signedAmount: 5000000,
    description: 'Saldo Awal Aset Lainnya',
    createdAt: '2026-10-01T08:00:00Z'
  },

  // TX-202610-002: RAW_PURCHASE (Kas -8.5M, Bahan Baku +8.5M)
  {
    id: 'MOV-006',
    transactionId: 'TX-202610-002',
    accountId: 'A03',
    signedAmount: 8500000,
    description: 'Pembelian Bahan Baku Kertas & Tinta',
    createdAt: '2026-10-05T09:30:00Z'
  },
  {
    id: 'MOV-007',
    transactionId: 'TX-202610-002',
    accountId: 'A01',
    signedAmount: -8500000,
    description: 'Pengeluaran Kas Pembelian Bahan Baku',
    createdAt: '2026-10-05T09:30:00Z'
  },

  // TX-202610-003: DIRECT_LABOR (Kas -3.2M, Barang Jadi +3.2M)
  {
    id: 'MOV-008',
    transactionId: 'TX-202610-003',
    accountId: 'A04',
    signedAmount: 3200000,
    description: 'Tenaga Kerja Langsung Sablon & Finishing',
    createdAt: '2026-10-08T16:00:00Z'
  },
  {
    id: 'MOV-009',
    transactionId: 'TX-202610-003',
    accountId: 'A01',
    signedAmount: -3200000,
    description: 'Pembayaran Kas Tenaga Kerja Langsung',
    createdAt: '2026-10-08T16:00:00Z'
  },

  // TX-202610-004: FINISHED_GOODS (Barang Jadi +5.5M, Bahan Baku -5.5M)
  {
    id: 'MOV-010',
    transactionId: 'TX-202610-004',
    accountId: 'A04',
    signedAmount: 5500000,
    description: 'Input Barang Jadi Box Kemasan (1.000 pcs)',
    createdAt: '2026-10-10T14:15:00Z'
  },
  {
    id: 'MOV-011',
    transactionId: 'TX-202610-004',
    accountId: 'A03',
    signedAmount: -5500000,
    description: 'Pengurangan Bahan Baku untuk Box Kemasan',
    createdAt: '2026-10-10T14:15:00Z'
  },

  // TX-202610-005: SALE 1 (Pendapatan +10M, Piutang +10M, Barang Jadi -6.4M, HPP +6.4M)
  {
    id: 'MOV-012',
    transactionId: 'TX-202610-005',
    accountId: 'R01',
    signedAmount: 10000000,
    description: 'Pendapatan Penjualan Box Kemasan',
    createdAt: '2026-10-15T11:00:00Z'
  },
  {
    id: 'MOV-013',
    transactionId: 'TX-202610-005',
    accountId: 'A02',
    customerId: 'CUST-001',
    signedAmount: 10000000,
    description: 'Piutang Penjualan Kopi Kenangan Senopati',
    createdAt: '2026-10-15T11:00:00Z'
  },
  {
    id: 'MOV-014',
    transactionId: 'TX-202610-005',
    accountId: 'A04',
    signedAmount: -6400000,
    description: 'Pengurangan Persediaan Barang Jadi (HPP Box Kemasan)',
    createdAt: '2026-10-15T11:00:00Z'
  },
  {
    id: 'MOV-015',
    transactionId: 'TX-202610-005',
    accountId: 'R02',
    signedAmount: 6400000,
    description: 'Beban HPP Penjualan Box Kemasan',
    createdAt: '2026-10-15T11:00:00Z'
  },

  // TX-202610-006: SALE 2 (Pendapatan +4.5M, Piutang +4.5M, Barang Jadi -2.75M, HPP +2.75M)
  {
    id: 'MOV-016',
    transactionId: 'TX-202610-006',
    accountId: 'R01',
    signedAmount: 4500000,
    description: 'Pendapatan Penjualan Paper Cup Double Wall',
    createdAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 'MOV-017',
    transactionId: 'TX-202610-006',
    accountId: 'A02',
    customerId: 'CUST-002',
    signedAmount: 4500000,
    description: 'Piutang Penjualan Toko Roti Mawar Indah',
    createdAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 'MOV-018',
    transactionId: 'TX-202610-006',
    accountId: 'A04',
    signedAmount: -2750000,
    description: 'Pengurangan Persediaan Barang Jadi (HPP Paper Cup)',
    createdAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 'MOV-019',
    transactionId: 'TX-202610-006',
    accountId: 'R02',
    signedAmount: 2750000,
    description: 'Beban HPP Penjualan Paper Cup',
    createdAt: '2026-10-18T10:30:00Z'
  },

  // TX-202610-007: EXPENSE (Beban +1.85M, Kas -1.85M)
  {
    id: 'MOV-020',
    transactionId: 'TX-202610-007',
    accountId: 'B01',
    signedAmount: 1850000,
    description: 'Beban Listrik & Air PLN',
    createdAt: '2026-10-20T13:00:00Z'
  },
  {
    id: 'MOV-021',
    transactionId: 'TX-202610-007',
    accountId: 'A01',
    signedAmount: -1850000,
    description: 'Pembayaran Kas Beban Listrik PLN',
    createdAt: '2026-10-20T13:00:00Z'
  },

  // TX-202610-008: EXPENSE (Beban +750k, Kas -750k)
  {
    id: 'MOV-022',
    transactionId: 'TX-202610-008',
    accountId: 'B01',
    signedAmount: 750000,
    description: 'Beban Internet & IT System',
    createdAt: '2026-10-22T09:00:00Z'
  },
  {
    id: 'MOV-023',
    transactionId: 'TX-202610-008',
    accountId: 'A01',
    signedAmount: -750000,
    description: 'Pembayaran Kas Beban Internet',
    createdAt: '2026-10-22T09:00:00Z'
  },

  // TX-202610-009: CUSTOMER_PAYMENT (Kas +7M, Piutang CUST-001 -7M)
  {
    id: 'MOV-024',
    transactionId: 'TX-202610-009',
    accountId: 'A01',
    signedAmount: 7000000,
    description: 'Penerimaan Kas Pembayaran Piutang Kopi Kenangan',
    createdAt: '2026-10-25T15:20:00Z'
  },
  {
    id: 'MOV-025',
    transactionId: 'TX-202610-009',
    accountId: 'A02',
    customerId: 'CUST-001',
    signedAmount: -7000000,
    description: 'Pelunasan Sebagian Piutang Kopi Kenangan',
    createdAt: '2026-10-25T15:20:00Z'
  },

  // TX-202610-010: ASSET_EQUIPMENT (Aset Peralatan +6.5M, Kas -6.5M)
  {
    id: 'MOV-026',
    transactionId: 'TX-202610-010',
    accountId: 'A05',
    signedAmount: 6500000,
    description: 'Pembelian Aset Mesin Digital Hot Foil',
    createdAt: '2026-10-28T11:45:00Z'
  },
  {
    id: 'MOV-027',
    transactionId: 'TX-202610-010',
    accountId: 'A01',
    signedAmount: -6500000,
    description: 'Pengeluaran Kas Pembelian Mesin Hot Foil',
    createdAt: '2026-10-28T11:45:00Z'
  },

  // TX-202610-011: OPNAME (A03 -250k, A06 +250k balancing)
  {
    id: 'MOV-028',
    transactionId: 'TX-202610-011',
    accountId: 'A03',
    signedAmount: -250000,
    description: 'Penyesuaian Opname Bahan Baku Kertas (Selisih Negatif)',
    createdAt: '2026-10-31T17:00:00Z'
  },
  {
    id: 'MOV-029',
    transactionId: 'TX-202610-011',
    accountId: 'A06',
    signedAmount: 250000,
    description: 'Penyeimbang Opname Bahan Baku ke Aset Lainnya',
    createdAt: '2026-10-31T17:00:00Z'
  }
];

export const INITIAL_LOGS: TransactionLog[] = [
  {
    id: 'LOG-001',
    transactionId: 'TX-202610-001',
    action: 'POST',
    description: 'Inisialisasi Saldo Awal Berhasil',
    userId: 'Nurhasan (Owner)',
    createdAt: '2026-10-01T08:00:00Z'
  }
];
