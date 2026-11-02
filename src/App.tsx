import React from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { SalesView } from './components/views/SalesView';
import { ExpensesView } from './components/views/ExpensesView';
import { InventoryView } from './components/views/InventoryView';
import { FinanceView } from './components/views/FinanceView';
import { OpnameView } from './components/views/OpnameView';
import { ReportsView } from './components/views/ReportsView';
import { MasterDataView } from './components/views/MasterDataView';

const MainContent: React.FC = () => {
  const { activeView } = useFinancial();
  return (
    <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 xl:px-8 pt-6">
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'sales' && <SalesView />}
      {activeView === 'expenses' && <ExpensesView />}
      {activeView === 'inventory' && <InventoryView />}
      {activeView === 'finance' && <FinanceView />}
      {activeView === 'opname' && <OpnameView />}
      {activeView === 'reports' && <ReportsView />}
      {activeView === 'master' && <MasterDataView />}
    </main>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <div id="app-main-layout" className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-amber-400 selection:text-slate-950">
        <Sidebar />
        <div className="min-w-0 flex-1 lg:pl-64">
          <Navbar />
          <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
            <div className="flex-1"><MainContent /></div>
            <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600 no-print mt-8">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>REDONE FINANCE — Sistem Manajemen Keuangan Operasional v1.0</span>
                <span className="font-mono text-[11px] text-slate-500">PT. REDONE BERKAH MANDIRI UTAMA · Standar Aliran Nominal</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </FinancialProvider>
  );
}
