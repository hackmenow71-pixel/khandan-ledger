"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deleteExpense, payExpense, undoPayment } from "@/app/actions/expenses";

export function ExpenseTracker({ expenses, isAdmin = true }: { expenses: any[], isAdmin?: boolean }) {
  const t = useTranslations("Expenses");
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [selYear, selMonth] = selectedMonth.split('-').map(Number);
  const daysInSelectedMonth = new Date(selYear, selMonth, 0).getDate();

  const filteredExpenses = expenses.filter(e => {
    const createdDate = new Date(e.createdAt);
    const createdYear = createdDate.getFullYear();
    const createdMonth = createdDate.getMonth() + 1;
    return createdYear < selYear || (createdYear === selYear && createdMonth <= selMonth);
  });

  const totalExpected = filteredExpenses.reduce((sum, e) => sum + e.expectedAmount, 0);
  let totalPaidThisMonth = 0;

  const expensesWithStatus = filteredExpenses.map(e => {
    const payment = e.payments.find((p: any) => p.month === selectedMonth);
    if (payment) totalPaidThisMonth += payment.amountPaid;
    return { ...e, payment, actualDueDay: Math.min(e.dueDay, daysInSelectedMonth) };
  });

  const progress = totalExpected > 0 ? Math.min(100, Math.round((totalPaidThisMonth / totalExpected) * 100)) : 0;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="no-print">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Select Month:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            className="shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-1 border text-black dark:text-white bg-white dark:bg-gray-700" 
          />
        </div>
        <div className="hidden print:block text-left text-lg font-bold text-gray-900">
          Selected Month: {selectedMonth}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expected vs Paid</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {totalPaidThisMonth.toLocaleString()} / {totalExpected.toLocaleString()}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 dark:bg-gray-700 no-print">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
        {expensesWithStatus.map((expense) => {
          const isPaid = !!expense.payment;
          
          let dueString = `Due: Day ${expense.actualDueDay}`;
          if (!isPaid && selectedMonth === currentMonthStr) {
            const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), expense.actualDueDay);
            // Reset times for accurate day diff
            today.setHours(0, 0, 0, 0);
            dueDateThisMonth.setHours(0, 0, 0, 0);
            const diffTime = dueDateThisMonth.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
              dueString = "Due today!";
            } else if (diffDays > 0) {
              dueString = `Due in ${diffDays} days`;
            } else {
              dueString = `Overdue by ${Math.abs(diffDays)} days`;
            }
          }

          return (
            <li key={expense.id} className={`py-4 flex flex-col sm:flex-row justify-between items-center gap-4 ${isPaid ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
              <div className="flex-1 px-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-sans">{expense.nameEnglish}</h3>
                <h3 className="text-sm text-gray-500 dark:text-gray-400 font-urdu">{expense.nameUrdu}</h3>
                <p className={`text-xs mt-1 font-medium ${isPaid ? 'text-gray-400 dark:text-gray-500' : (!isPaid && selectedMonth === currentMonthStr && expense.actualDueDay < today.getDate() ? 'text-red-500' : 'text-blue-500')}`}>
                  {dueString}
                </p>
              </div>
              <div className="w-32 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("expectedAmount")}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{expense.expectedAmount.toLocaleString()}</p>
              </div>
              <div className="w-48 text-center flex items-center justify-center">
                {isPaid ? (
                  <div className="text-center">
                    <p className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-1">
                      <span className="no-print"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
                      {t("paid")}: {expense.payment.amountPaid.toLocaleString()}
                    </p>
                    {isAdmin && <button onClick={() => startTransition(() => undoPayment(expense.payment.id))} className="text-xs text-red-500 hover:underline mt-1 no-print">Undo</button>}
                  </div>
                ) : (
                  <>
                    {isAdmin ? (
                    <form action={async (formData) => {
                      startTransition(() => {
                        payExpense(formData);
                      });
                    }} className="flex flex-col items-center gap-2 no-print">
                      <input type="hidden" name="expenseId" value={expense.id} />
                      <input type="hidden" name="month" value={selectedMonth} />
                      <input type="number" step="0.01" name="amountPaid" defaultValue={expense.expectedAmount} className="w-24 text-center shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded p-1 border text-black dark:text-white bg-white dark:bg-gray-700" />
                      <button type="submit" className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">{t("markPaid")}</button>
                    </form>
                    ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">Unpaid</span>
                    )}
                    <div className="hidden print:block text-gray-500 italic">Unpaid</div>
                  </>
                )}
              </div>
              {isAdmin && (
              <div className="w-16 text-right px-2 no-print">
                <button onClick={() => {
                  if (confirm(t("delete") + "?")) {
                    startTransition(() => deleteExpense(expense.id));
                  }
                }} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  {t("delete")}
                </button>
              </div>
              )}
            </li>
          );
        })}
        {expensesWithStatus.length === 0 && (
          <li className="py-8 text-center text-gray-500 dark:text-gray-400">{t("noExpenses")}</li>
        )}
      </ul>
    </div>
  );
}
