import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { formatRupiah } from '../../utils/formatters';
import {
  Settings2,
  Package,
  Users,
  Tags,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X
} from 'lucide-react';
import { Product, Customer, Category } from '../../types';
import { NominalInput } from '../common/NominalInput';

export const MasterDataView: React.FC = () => {
  const {
    products,
    customers,
    categories,
    addProduct,
    updateProduct,
    addCustomer,
    updateCustomer,
    addCategory
  } = useFinancial();

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CUSTOMERS' | 'CATEGORIES'>('PRODUCTS');
  const [searchQuery, setSearchQuery] = useState('');

  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodSellingPrice, setProdSellingPrice] = useState<number>(0);
  const [prodSellingHpp, setProdSellingHpp] = useState<number>(0);
  const [prodRawMaterialHpp, setProdRawMaterialHpp] = useState<number>(0);

  // Customer Form State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custCode, setCustCode] = useState('');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Category Form State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'EXPENSE' | 'ASSET'>('EXPENSE');

  // Handle Product Submit
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        code: prodCode.trim() || editingProduct.code,
        name: prodName.trim(),
        defaultSellingPrice: prodSellingPrice,
        defaultSellingHpp: prodSellingHpp,
        defaultRawMaterialHpp: prodRawMaterialHpp
      });
    } else {
      addProduct({
        code: prodCode.trim() || `PRD-${Date.now().toString().slice(-4)}`,
        name: prodName.trim(),
        defaultSellingPrice: prodSellingPrice,
        defaultSellingHpp: prodSellingHpp,
        defaultRawMaterialHpp: prodRawMaterialHpp,
        status: 'ACTIVE'
      });
    }

    setShowProductModal(false);
    setEditingProduct(null);
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdCode(product.code);
      setProdName(product.name);
      setProdSellingPrice(product.defaultSellingPrice);
      setProdSellingHpp(product.defaultSellingHpp);
      setProdRawMaterialHpp(product.defaultRawMaterialHpp);
    } else {
      setEditingProduct(null);
      setProdCode(`PRD-${String(products.length + 1).padStart(3, '0')}`);
      setProdName('');
      setProdSellingPrice(10000);
      setProdSellingHpp(6000);
      setProdRawMaterialHpp(4000);
    }
    setShowProductModal(true);
  };

  // Handle Customer Submit
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        code: custCode.trim() || editingCustomer.code,
        name: custName.trim(),
        phone: custPhone.trim(),
        address: custAddress.trim()
      });
    } else {
      addCustomer({
        code: custCode.trim() || `CUST-${Date.now().toString().slice(-4)}`,
        name: custName.trim(),
        phone: custPhone.trim(),
        address: custAddress.trim(),
        status: 'ACTIVE'
      });
    }

    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  const openCustomerModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustCode(customer.code);
      setCustName(customer.name);
      setCustPhone(customer.phone);
      setCustAddress(customer.address);
    } else {
      setEditingCustomer(null);
      setCustCode(`CUST-${String(customers.length + 1).padStart(3, '0')}`);
      setCustName('');
      setCustPhone('');
      setCustAddress('');
    }
    setShowCustomerModal(true);
  };

  // Handle Category Submit
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    addCategory({
      name: catName.trim(),
      type: catType
    });

    setCatName('');
    setShowCategoryModal(false);
  };

  // Filtered Lists
  const filteredProducts = products.filter(p =>
    searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const filteredCustomers = customers.filter(c =>
    searchQuery
      ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5" />
              MASTER DATA PERUSAHAAN (BAB 3)
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Katalog Produk, Pelanggan & Kategori Akun
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Data dasar yang digunakan saat transaksi penjualan dan input barang jadi.
              Harga Jual, HPP Penjualan, dan HPP Bahan Baku terpisah sesuai fungsinya (Bab 3.1).
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'PRODUCTS' && (
              <button
                onClick={() => openProductModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Produk
              </button>
            )}
            {activeTab === 'CUSTOMERS' && (
              <button
                onClick={() => openCustomerModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Customer
              </button>
            )}
            {activeTab === 'CATEGORIES' && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Kategori
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('PRODUCTS');
              setSearchQuery('');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'PRODUCTS'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            3.1 Master Produk ({products.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('CUSTOMERS');
              setSearchQuery('');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'CUSTOMERS'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            3.2 Master Customer ({customers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('CATEGORIES');
              setSearchQuery('');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'CATEGORIES'
                ? 'bg-amber-400 text-slate-900 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Tags className="w-3.5 h-3.5" />
            3.3 Kategori Transaksi ({categories.length})
          </button>
        </div>
      </div>

      {/* 3.1 Products Table */}
      {activeTab === 'PRODUCTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Katalog Produk & Tarif Standar
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nilai default dapat disesuaikan saat transaksi dan di-snapshot permanen
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kode, nama produk..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="py-2.5 px-3">Kode Produk</th>
                  <th className="py-2.5 px-3">Nama Produk</th>
                  <th className="py-2.5 px-3 text-right">Harga Jual Default</th>
                  <th className="py-2.5 px-3 text-right">HPP Penjualan Default</th>
                  <th className="py-2.5 px-3 text-right">HPP Bahan Baku Default</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-medium text-amber-400">
                      {p.code}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-100">{p.name}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                      {formatRupiah(p.defaultSellingPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-400">
                      {formatRupiah(p.defaultSellingHpp)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-cyan-400">
                      {formatRupiah(p.defaultRawMaterialHpp)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() =>
                          updateProduct(p.id, {
                            status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                          })
                        }
                        className={`text-[11px] font-semibold cursor-pointer ${
                          p.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => openProductModal(p)}
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                        title="Edit Produk"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.2 Customers Table */}
      {activeTab === 'CUSTOMERS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Daftar Master Customer (Pelanggan)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Basis data penagihan piutang dan penerimaan kas pembayaran
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari customer, telepon, alamat..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Customer</th>
                  <th className="py-2.5 px-3">Nomor Telepon</th>
                  <th className="py-2.5 px-3">Alamat Lengkap</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-medium text-amber-400">{c.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-100">{c.name}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{c.phone}</td>
                    <td className="py-3 px-3 text-slate-400 max-w-sm truncate">{c.address}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() =>
                          updateCustomer(c.id, {
                            status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                          })
                        }
                        className={`text-[11px] font-semibold cursor-pointer ${
                          c.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => openCustomerModal(c)}
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3.3 Categories Table */}
      {activeTab === 'CATEGORIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">
              Kategori Transaksi Beban & Aset
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Digunakan untuk klasifikasi pengeluaran operasional dan belanja aset
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-3">
                Kategori Beban Operasional (Beban)
              </h3>
              <div className="space-y-2">
                {categories
                  .filter(c => c.type === 'EXPENSE')
                  .map(c => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center text-xs"
                    >
                      <span className="text-slate-200 font-medium">{c.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{c.id}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-3">
                Kategori Belanja Aset (Aset)
              </h3>
              <div className="space-y-2">
                {categories
                  .filter(c => c.type === 'ASSET')
                  .map(c => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center text-xs"
                    >
                      <span className="text-slate-200 font-medium">{c.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{c.id}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-100">
                {editingProduct ? 'Edit Master Produk' : 'Tambah Master Produk Baru'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Kode Produk</label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={e => setProdCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Harga Jual Default (Rp)
                  </label>
                  <NominalInput
                    min={0}
                    value={prodSellingPrice}
                    onChange={val => setProdSellingPrice(val)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    HPP Jual Default (Rp)
                  </label>
                  <NominalInput
                    min={0}
                    value={prodSellingHpp}
                    onChange={val => setProdSellingHpp(val)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    HPP Bahan Baku (Rp)
                  </label>
                  <NominalInput
                    min={0}
                    value={prodRawMaterialHpp}
                    onChange={val => setProdRawMaterialHpp(val)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Customer */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-100">
                {editingCustomer ? 'Edit Master Customer' : 'Tambah Master Customer Baru'}
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Kode Customer</label>
                  <input
                    type="text"
                    value={custCode}
                    onChange={e => setCustCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Nama Customer</label>
                  <input
                    type="text"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Alamat Kantor / Pengiriman</label>
                <textarea
                  value={custAddress}
                  onChange={e => setCustAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded"
                >
                  Simpan Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-100">Tambah Kategori Baru</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Kelompok Kategori</label>
                <select
                  value={catType}
                  onChange={e => setCatType(e.target.value as 'EXPENSE' | 'ASSET')}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                >
                  <option value="EXPENSE">Beban Operasional (Biaya)</option>
                  <option value="ASSET">Aset (Peralatan / Persediaan / Lainnya)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  placeholder="Contoh: Pajak & Retribusi Daerah..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded"
                >
                  Tambah Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
