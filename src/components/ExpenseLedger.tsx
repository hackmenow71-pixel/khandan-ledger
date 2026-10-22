"use client";

import React from "react";

export function ExpenseLedger({ expenses }: { expenses: any[] }) {
  // Generate current month and next 5 months (total 6 months)
  const today = new Date();
  const months: { label: string, key: string, date: Date }[] = [];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    months.push({ label, key, date: d });
  }

  const totalExpected = expenses.reduce((sum, exp) => sum + (exp.expectedAmount || 0), 0);

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden print:mt-12">
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          📆 6-Month Expense Ledger
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 no-print">Current & Coming Months</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-700 z-10">
                Expense
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Exp. Amount
              </th>
              {months.map(m => (
                <th key={m.key} className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => {
              return (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 z-10">
                    <div className="font-semibold text-gray-900 dark:text-white font-sans">{expense.nameEnglish}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-urdu">{expense.nameUrdu}</div>
                    <div className="text-[10px] text-gray-400 uppercase mt-1 tracking-wider">Day {expense.dueDay}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-center bg-gray-50/50 dark:bg-gray-900/50">
                    {expense.expectedAmount.toLocaleString()}
                  </td>
                  {months.map((m, idx) => {
                    const payment = expense.payments.find((p: any) => p.month === m.key);
                    const isPaid = !!payment;
                    
                    // Check if this month is before the expense was created
                    const createdDate = new Date(expense.createdAt);
                    const createdMonthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
                    const isBeforeCreation = m.key < createdMonthKey;

                    if (isBeforeCreation) {
                      return (
                        <td key={m.key} className="px-4 py-4 whitespace-nowrap text-center text-xs text-gray-300 dark:text-gray-600 bg-gray-50/30 dark:bg-gray-900/30 italic">
                          —
                        </td>
                      );
                    }

                    if (isPaid) {
                      return (
                        <td key={m.key} className="px-4 py-4 whitespace-nowrap text-center bg-green-50/30 dark:bg-green-900/10">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            ✓ {payment.amountPaid.toLocaleString()}
                          </span>
                        </td>
                      );
                    } else {
                      // Unpaid. Determine if it's current month or future.
                      const isCurrentMonth = idx === 0;
                      return (
                        <td key={m.key} className={`px-4 py-4 whitespace-nowrap text-center ${isCurrentMonth ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''}`}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isCurrentMonth ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {isCurrentMonth ? 'Pending' : 'Upcoming'}
                          </span>
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={months.length + 2} className="px-6 py-8 text-center text-gray-500">
                  No recurring expenses tracked yet.
                </td>
              </tr>
            )}
            {expenses.length > 0 && (
              <tr className="bg-gray-100 dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-600">
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-700 z-10 text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide text-right">
                  Total
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-black text-gray-900 dark:text-white text-center bg-gray-200/50 dark:bg-gray-800/50">
                  {totalExpected.toLocaleString()}
                </td>
                {months.map(m => {
                  const totalForMonth = expenses.reduce((sum, exp) => {
                    const p = exp.payments.find((payment: any) => payment.month === m.key);
                    return sum + (p ? p.amountPaid : 0);
                  }, 0);
                  return (
                    <td key={m.key} className="px-4 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-black text-green-700 dark:text-green-400">
                        {totalForMonth > 0 ? totalForMonth.toLocaleString() : "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}