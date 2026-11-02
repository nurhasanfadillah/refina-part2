import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import {
  LayoutDashboard, ShoppingCart, ArrowUpRight, Package, Wallet,
  ClipboardCheck, FileSpreadsheet, Settings2, Menu, X, ChevronRight
} from 'lucide-react';

const navGroups = [
  { label: 'WORKSPACE', items: [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'sales', label: 'Penjualan', icon: ShoppingCart },
    { id: 'expenses', label: 'Pengeluaran', icon: ArrowUpRight },
  ]},
  { label: 'FINANCE & OPERATIONS', items: [
    { id: 'inventory', label: 'Persediaan', icon: Package },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
    { id: 'opname', label: 'Stok Opname', icon: ClipboardCheck },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
  ]},
  { label: 'CONFIGURATION', items: [
    { id: 'master', label: 'Master Data', icon: Settings2 },
  ]},
];

const NavigationItems: React.FC<{ activeView: string; onNavigate: (id: string) => void }> = ({ activeView, onNavigate }) => (
  <div className="space-y-6">
    {navGroups.map(group => (
      <section key={group.label}>
        <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.16em] text-slate-500">{group.label}</p>
        <div className="space-y-1">
          {group.items.map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            const classes = active
              ? 'bg-amber-400/10 text-amber-300 border-amber-400/20 shadow-[inset_2px_0_0_0_#fbbf24]'
              : 'text-slate-400 border-transparent hover:text-slate-100 hover:bg-slate-800/70';
            return (
              <button key={item.id} type="button" onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={'group w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left transition-colors border ' + classes}>
                <Icon className={'w-[18px] h-[18px] shrink-0 ' + (active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </section>
    ))}
  </div>
);

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useFinancial();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = (id: string) => { setActiveView(id); setDrawerOpen(false); };

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col bg-slate-950 border-r border-slate-800/90 no-print">
        <button type="button" onClick={() => navigate('dashboard')} className="h-16 px-5 flex items-center gap-3 border-b border-slate-800 text-left">
          <span className="w-9 h-9 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black">◈</span>
          <span>
            <span className="block text-sm font-extrabold tracking-wide text-slate-100">REDONE FINANCE</span>
            <span className="block text-[10px] tracking-[0.12em] text-slate-500 mt-0.5">OPERATIONAL CONTROL</span>
          </span>
        </button>
        <div className="flex-1 overflow-y-auto px-3 py-6"><NavigationItems activeView={activeView} onNavigate={navigate} /></div>
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="rounded-md bg-slate-900 border border-slate-800 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Workspace</p>
            <p className="text-xs font-semibold text-slate-200 mt-1">PT. Redone Berkah Mandiri</p>
            <p className="text-[10px] text-slate-500 mt-1">Finance · v1.0</p>
          </div>
        </div>
      </aside>

      <div className="lg:hidden no-print">
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Buka menu navigasi" aria-expanded={drawerOpen}
          className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-xs font-bold text-slate-950 shadow-xl shadow-black/30">
          <Menu className="w-4 h-4" /> Menu
        </button>
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}>
            <aside role="dialog" aria-modal="true" aria-label="Menu navigasi"
              className="h-full w-[min(19rem,86vw)] bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col"
              onClick={event => event.stopPropagation()}>
              <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black">◈</span>
                  <span className="text-sm font-extrabold tracking-wide">REDONE FINANCE</span>
                </div>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Tutup menu" className="p-2 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-6"><NavigationItems activeView={activeView} onNavigate={navigate} /></div>
              <div className="border-t border-slate-800 p-4 text-[11px] text-slate-500">PT. Redone Berkah Mandiri Utama</div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};
