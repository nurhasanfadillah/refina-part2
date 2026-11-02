# REODONE — Aplikasi Manajemen Keuangan (Versi 1.0)

REODONE adalah aplikasi manajemen keuangan operasional berbasis aliran nominal yang dirancang khusus untuk mempermudah pencatatan transaksi single-entry, otomatisasi mutasi akun multi-buku, pengelolaan persediaan bahan baku dan barang jadi tanpa kartu stok fisik, pelacakan kas & piutang pelanggan, pemeriksaan opname berimbang, serta pembuatan laporan keuangan real-time dengan bukti transaksi cetak dan ekspor CSV.

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan preferensi yang telah dikonfirmasi pada tahap klarifikasi:
> - **Preloaded Indonesian Demo Data**: Sistem akan secara otomatis memuat dataset realistis UMKM/Manufaktur Indonesia (master produk HPP bertingkat, master pelanggan, transaksi penjualan, belanja beban operasional, pembelian aset, input barang jadi, pembayaran piutang, dan penyesuaian opname) yang siap dieksplorasi atau di-reset kapan saja.
> - **Visual Identity — Navy Prestige & Small Corner Radius**: Palet eksekutif Deep Navy (`#0A192F` / `#0F172A`) dipadukan dengan aksen emas/amber (`#D97706`) dan emerald (`#059669`), sudut tajam presisi (`rounded-md` / `rounded-lg`), tipografi angka tabular (`tabular-nums`), dan navigasi mobile-first yang ergonomis.
> - **Printable Vouchers & CSV Export**: Dilengkapi generator Nota Penjualan, Bukti Kas Masuk, Bukti Pengeluaran Kas, dan Bukti Opname siap cetak/PDF, serta ekspor CSV untuk kelima laporan keuangan utama.

---

### 1. Overview & Core Concept

- **What It Does**: REODONE mengotomatisasikan siklus keuangan bisnis secara menyeluruh melalui prinsip *nominal-based*:
  1. **Penjualan**: Menghasilkan piutang otomatis, mengakui pendapatan penjualan, mendebit HPP penjualan, dan mengkredit nilai persediaan barang jadi secara instan berbasis snapshot transaksi.
  2. **Pengeluaran**: 5 alur pengeluaran terpisah (Beban Operasional, Pembelian Peralatan, Pembelian Bahan Baku, Biaya Tenaga Kerja Langsung penambah barang jadi, dan Pembelian Aset Lainnya).
  3. **Persediaan**: Konversi nilai nominal dari Bahan Baku ke Barang Jadi melalui modul Input Barang Jadi (Qty × HPP bahan baku snapshot).
  4. **Keuangan**: Manajemen arus kas, pembayaran customer terhadap piutang (dengan validasi saldo), dan penambahan/pelunasan piutang lainnya.
  5. **Opname**: Penyesuaian nilai aktual vs sistem untuk 6 objek aset dengan mekanisme penyeimbang otomatis ke akun Aset Lainnya (untuk Bahan Baku, Barang Jadi, Peralatan, Kas) atau penyesuaian langsung (Piutang & Aset Lainnya).
  6. **Laporan & Audit**: Laba Rugi, Saldo Aset, Mutasi Kas, Kartu Piutang Pelanggan, dan Laporan Persediaan dengan filter periode tanggal, bulan, dan tahun.

- **Target Audience / Persona**: Pemilik bisnis, manajer operasional, dan staf administrasi keuangan yang membutuhkan kontrol keuangan ketat tanpa kerumitan debit/kredit manual akuntansi konvensional.
- **Key Value**: Mencegah kesalahan input ganda (*single entry* dengan *automatic multi-account mutation*), menjamin integritas data historis (*snapshot pricing* & pembatalan transaksi dengan jurnal pembalik otomatis), serta menyajikan posisi kas dan laba bersih secara akurat setiap detik.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  - *Dashboard Eksekutif*: Ringkasan KPI kas aktual, total piutang beredar, total nilai persediaan, tren pendapatan vs beban, dan grafik laba kotor/bersih.
  - *Modul Penjualan*: Form pencatatan penjualan cepat dengan pencarian produk & customer, kalkulasi otomatis Qty × Harga & Qty × HPP, penerbitan Nota Penjualan cetak, serta daftar invoice/transaksi dengan status DRAFT / POSTED / CANCELLED.
  - *Modul Pengeluaran*: Segmentasi 5 jenis pengeluaran dengan kategori dinamis, input cepat nominal, dan cetak Bukti Kas Keluar.
  - *Modul Persediaan*: Dashboard nilai nominal bahan baku & barang jadi, form Input Barang Jadi (konversi nominal bahan baku ke barang jadi), serta riwayat mutasi persediaan.
  - *Modul Keuangan*: Rekonsiliasi Kas, daftar piutang per pelanggan, form pembayaran piutang dengan indikator sisa saldo, dan penambahan piutang lainnya.
  - *Modul Opname*: Form pemeriksaan fisik dengan kalkulasi otomatis selisih (Nilai Aktual − Saldo Sistem) dan jurnal penyeimbang otomatis.
  - *Modul Laporan*: 5 Laporan keuangan interaktif dengan filter rentang tanggal, tombol cetak voucher/laporan, dan download spreadsheet CSV.
  - *Master Data Management*: Pengelolaan data Produk (Kode, Nama, Harga Jual, HPP Penjualan, HPP Bahan Baku), Pelanggan, dan Kategori.

- **Visual Identity & Theme (Navy Prestige Mobile-First)**:
  - *Canvas & Background*: `#080D1A` (Darkest Navy/Slate canvas), `#0F172A` (Surface Card), `#1E293B` (Elevated/Border elements), `#F8FAFC` untuk teks kontras tinggi.
  - *Aksentuasi Finansial*: Emerald `#10B981` (penerimaan kas & laba positif), Amber `#F59E0B` (piutang & peringatan), Crimson `#EF4444` (pengeluaran kas & selisih negatif), serta Navy Blue `#3B82F6` (tombol aksi primer).
  - *Radius Presisi*: Sudut tajam terukur `rounded-md` (6px) dan `rounded-lg` (8px), menghindari elemen rounded-full/pill berlebihan.
  - *Zero-Pill Discipline*: Tag status dan metadata transaksi ditampilkan sebagai teks tipografis bersih dengan pemisah titik tengah (`POSTED · 12 Okt 2026 · Kas Utama`).
  - *Mobile Touch Ergonomics*: Bottom navigation dock pada layar kecil (tinggi tab $\le 56\text{px}$, area sentuh $\ge 48\text{px}$), sticky action bar untuk form input transaksi, dan drawer modal yang mudah diakses dengan satu tangan.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Engine Mutasi Akun Atomik & Snapshot Transaksi**
  - *Chosen Approach*: Setiap transaksi POSTED secara otomatis membuat record mutasi bertanda (*signed amount*) di tabel `account_movements`. Harga dan HPP produk di-snapshot permanen pada `transaction_items` saat transaksi disimpan.
  - *Why*: Menjamin bahwa perubahan harga master data di masa depan tidak akan pernah merusak kalkulasi transaksi historis yang telah diposting.
  - *Alternatives Considered*: Menghitung ulang saldo dari master produk saat pelaporan (ditolak karena melanggar integritas akuntansi).

- **Decision 2: Mekanisme Pembatalan (Cancellation via Reversal)**
  - *Chosen Approach*: Transaksi POSTED tidak dapat dihapus permanen (`DELETE`), melainkan diubah statusnya menjadi `CANCELLED` dengan pembuatan mutasi pembalik otomatis dan pencatatan alasan pembatalan.
  - *Why*: Memenuhi spesifikasi audit trail Bab 8.2 dan mencegah ketidakcocokan saldo tersembunyi.

- **Decision 3: Persistensi Data Lokal dengan Penyimpanan Aman & Demo Reset**
  - *Chosen Approach*: Menyediakan in-memory store yang tersinkronisasi ke `localStorage` browser dengan fungsi Export/Import JSON dan tombol *Reset to Realistic Demo Data*.
  - *Why*: Memastikan aplikasi bekerja 100% responsif, tanpa latency jaringan, data tersimpan persisten di perangkat pengguna, dan siap diuji langsung dengan data operasional lengkap.

- **Decision 4: Penanganan Logika Khusus Opname**
  - *Chosen Approach*: Sesuai tabel spesifikasi Bab 4.5: Selisih opname Bahan Baku, Barang Jadi, Peralatan, dan Kas otomatis menghasilkan mutasi penyeimbang ke akun Aset Lainnya (`A06`). Sedangkan opname Piutang dan Aset Lainnya disesuaikan langsung pada saldonya sendiri.
  - *Why*: Mempertahankan total nilai aset perusahaan tetap seimbang dan akuntabel.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REODONE UI LAYER                              │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Mobile Bottom Bar (≤56px)│  │ Desktop Sidebar & Breadcrumb Header │  │
│  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
│              ▼                                   ▼                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ View Router: Penjualan | Pengeluaran | Persediaan | Keuangan     │  │
│  │              Opname    | Laporan     | Master Data | Settings     │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FINANCIAL CORE ENGINE (TypeScript)                   │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Transaction Processor  │  │ Balance & Ledger Calculation Engine  │  │
│  │ - Sale (4-fold post)   │  │ - Saldo Akhir = Saldo Awal + Mutasi  │  │
│  │ - Expense (5 subtypes) │  │ - Cash Flow Ledger (Running Balance) │  │
│  │ - Finished Goods Conv. │  │ - Customer AR Balances & Payments    │  │
│  │ - Customer Payment     │  │ - Inventory Value Tracking           │  │
│  │ - Opname Balancer      │  │ - Profit & Loss (Gross & Net Profit) │  │
│  │ - Reversal Cancelation │  │ - Date Range / Month / Year Filters  │  │
│  └───────────┬────────────┘  └──────────────────┬───────────────────┘  │
└──────────────┼──────────────────────────────────┼──────────────────────┘
               ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE & REPORT GENERATORS                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ LocalStorage Reactive State + Auto-Sync                          │  │
│  │ (Accounts, Transactions, Items, Movements, Opnames, Masters)     │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Printable Document Engine: Nota Penjualan, BKM, BKK, Opname Slip │  │
│  │ CSV Export Engine: Laba Rugi, Saldo Aset, Mutasi Kas, AR, Stok   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen Entitas Data Utama
- **Accounts (`A01` - `B02`)**: Kas (`A01`), Piutang (`A02`), Persediaan Bahan Baku (`A03`), Persediaan Barang Jadi (`A04`), Aset Peralatan (`A05`), Aset Lainnya (`A06`), Pendapatan Penjualan (`R01`), HPP Penjualan (`R02`), Beban Operasional (`B01`), Beban Penyesuaian (`B02`).
- **Transactions & Movements**: Relasi satu transaksi ke banyak mutasi bertanda (*signed amount*) yang menjamin atomic execution.
- **Master Data**: Produk (Kode, Nama, Harga Jual Default, HPP Penjualan Default, HPP Bahan Baku Default, Status), Customer (Kode, Nama, Telepon, Alamat, Status), dan Kategori (Beban & Aset).
- **Printable Vouchers**: Format cetak profesional ukuran A4 / Slip Nota kasir dengan logo REODONE, nomor transaksi, stempel status, rincian item, dan tanda tangan otorisasi.
