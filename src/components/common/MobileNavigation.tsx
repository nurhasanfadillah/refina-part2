import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowUpRight,
  Package,
  Wallet,
  ClipboardCheck,
  FileSpreadsheet,
  Settings2,
  MoreHorizontal,
  Trash2,
  X
} from 'lucide-react';
import { ClearDataModal } from './ClearDataModal';

export const MobileNavigation: React.FC = () => {
  const { activeView, setActiveView } = useFinancial();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const primaryTabs = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'sales', label: 'Penjualan', icon: ShoppingCart },
    { id: 'expenses', label: 'Pengeluaran', icon: ArrowUpRight },
    { id: 'inventory', label: 'Persediaan', icon: Package },
    { id: 'finance', label: 'Keuangan', icon: Wallet }
  ];

  const secondaryTabs = [
    { id: 'opname', label: 'Opname Fisik', icon: ClipboardCheck },
    { id: 'reports', label: 'Laporan Keuangan', icon: FileSpreadsheet },
    { id: 'master', label: 'Master Data', icon: Settings2 }
  ];

  return (
    <>
      {/* More Options Bottom Drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-xl p-4 shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Menu Lainnya
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {secondaryTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveView(tab.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-[11px] text-center leading-tight">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowClearModal(true);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-md text-xs font-medium transition-colors bg-red-950/30 text-red-400 hover:bg-red-950/60 border border-red-900/40"
              >
                <Trash2 className="w-5 h-5 mb-1.5" />
                <span className="text-[11px] text-center leading-tight">
                  Kosongkan
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ClearDataModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
      />

      {/* Fixed Bottom Dock Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 lg:hidden no-print">
        <div className="grid grid-cols-6 h-full items-center">
          {primaryTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-medium tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowMoreMenu(true)}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              ['opname', 'reports', 'master'].includes(activeView)
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
