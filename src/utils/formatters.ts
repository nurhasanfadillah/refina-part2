/**
 * REODONE Utility Formatters & Exporters
 */

export function formatRupiah(value: number, includePrefix = true): string {
  if (value === null || value === undefined || isNaN(value)) {
    return includePrefix ? 'Rp 0' : '0';
  }
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(value));
  const formatted = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (includePrefix) {
    return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (!year || !month || !day) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const sanitize = (val: string | number) => {
    const stringVal = String(val ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvContent = [
    headers.map(sanitize).join(','),
    ...rows.map(row => row.map(sanitize).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPeriodDateRange(filter: {
  preset: 'today' | 'this_month' | 'last_month' | 'this_year' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
}): { start: string; end: string; isAll: boolean; label: string } {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (filter.preset === 'all') {
    return {
      start: '',
      end: '',
      isAll: true,
      label: 'Seluruh Periode Akumulasi'
    };
  }

  const today = getTodayDateString();
  const [yearStr, monthStr] = today.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (filter.preset === 'today') {
    return {
      start: today,
      end: today,
      isAll: false,
      label: `Hari Ini (${formatDateIndo(today)})`
    };
  }

  if (filter.preset === 'this_month') {
    const start = `${yearStr}-${monthStr}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
    return {
      start,
      end,
      isAll: false,
      label: `Bulan Berjalan (${months[month - 1]} ${year})`
    };
  }

  if (filter.preset === 'last_month') {
    const prevDate = new Date(year, month - 2, 1);
    const pYear = prevDate.getFullYear();
    const pMonth = prevDate.getMonth() + 1;
    const pYearStr = String(pYear);
    const pMonthStr = String(pMonth).padStart(2, '0');
    const pLastDay = new Date(pYear, pMonth, 0).getDate();
    const start = `${pYearStr}-${pMonthStr}-01`;
    const end = `${pYearStr}-${pMonthStr}-${String(pLastDay).padStart(2, '0')}`;
    return {
      start,
      end,
      isAll: false,
      label: `Bulan Lalu (${months[pMonth - 1]} ${pYear})`
    };
  }

  if (filter.preset === 'this_year') {
    return {
      start: `${yearStr}-01-01`,
      end: `${yearStr}-12-31`,
      isAll: false,
      label: `Tahun Berjalan (${year})`
    };
  }

  if (filter.preset === 'custom') {
    const start = filter.startDate || '1970-01-01';
    const end = filter.endDate || '2099-12-31';
    return {
      start,
      end,
      isAll: false,
      label: `Rentang Kustom (${formatDateShort(start)} s/d ${formatDateShort(end)})`
    };
  }

  return {
    start: '',
    end: '',
    isAll: true,
    label: 'Seluruh Periode Akumulasi'
  };
}
