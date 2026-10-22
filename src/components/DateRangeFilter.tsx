"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (dateFrom) params.set('dateFrom', dateFrom);
    else params.delete('dateFrom');
    if (dateTo) params.set('dateTo', dateTo);
    else params.delete('dateTo');
    router.push(pathname + '?' + params.toString());
  };

  const clear = () => {
    setDateFrom('');
    setDateTo('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('dateFrom');
    params.delete('dateTo');
    router.push(pathname + '?' + params.toString());
  };

  const hasFilter = searchParams.get('dateFrom') || searchParams.get('dateTo');

  return (
    <div className="flex flex-wrap items-center gap-2 no-print bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm mb-6">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">📅 Date Range:</span>
      <input
        type="date"
        value={dateFrom}
        onChange={e => setDateFrom(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
      />
      <span className="text-sm text-gray-400">to</span>
      <input
        type="date"
        value={dateTo}
        onChange={e => setDateTo(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
      />
      <button
        onClick={apply}
        className="px-3 py-1 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition"
      >
        Apply
      </button>
      {hasFilter && (
        <button
          onClick={clear}
          className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition"
        >
          Clear
        </button>
      )}
      {hasFilter && (
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded">
          ✦ Filtered
        </span>
      )}
    </div>
  );
}