"use client";

import { useState } from "react";

export default function CalculatorPage() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [months, setMonths] = useState("");

  const p = parseFloat(principal.replace(/,/g, "")) || 0;
  const r = parseFloat(rate) || 0;
  const m = parseInt(months) || 0;

  const totalProfit = p * (r / 100) * m;
  const totalAmount = p + totalProfit;
  const perMonth = p * (r / 100);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🧮 Profit Rate Calculator</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Calculate how much profit is owed on a principal amount at a given monthly rate.</p>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Amount (Rs.)</label>
          <input
            type="text"
            value={principal}
            onChange={e => {
              const val = e.target.value.replace(/[^\d.]/g, "");
              const parts = val.split(".");
              if (parts[0]) parts[0] = parseInt(parts[0], 10).toLocaleString("en-US");
              setPrincipal(parts.join("."));
            }}
            placeholder="e.g. 100,000"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white font-sans"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="e.g. 2"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Months</label>
          <input
            type="number"
            value={months}
            onChange={e => setMonths(e.target.value)}
            placeholder="e.g. 6"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>
      </div>

      {p > 0 && r > 0 && m > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">Results</h2>
          <div className="divide-y divide-indigo-100 dark:divide-indigo-800">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Principal</span>
              <span className="font-semibold text-gray-900 dark:text-white">Rs. {fmt(p)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Monthly Profit ({r}%)</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">Rs. {fmt(perMonth)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Profit ({m} months)</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">Rs. {fmt(totalProfit)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-700 dark:text-gray-300 font-bold">Total Amount Due</span>
              <span className="font-black text-indigo-700 dark:text-indigo-400 text-base">Rs. {fmt(totalAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
