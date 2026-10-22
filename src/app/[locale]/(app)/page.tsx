import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";
import { Link } from "@/i18n/routing";

import { DateRangeFilter } from "@/components/DateRangeFilter";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ filter?: string; dateFrom?: string; dateTo?: string; includeExp?: string }> }) {
  const t = await getTranslations("Dashboard");
  const tTx = await getTranslations("Transactions");
  const resolvedParams = await searchParams;
  const filter = resolvedParams.filter;
  const dateFrom = resolvedParams.dateFrom;
  const dateTo = resolvedParams.dateTo;
  const includeExp = resolvedParams.includeExp === 'true';

  const nameFilter = includeExp ? {} : {
    nameEnglish: { not: { contains: 'General Expenses' } }
  };



  const transactions = await prisma.transaction.findMany({
    include: { person: true },
    orderBy: { date: 'desc' },
    where: {
      person: nameFilter,
      ...(dateFrom || dateTo ? {
        date: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59') } : {}),
        }
      } : {})
    }
  });
  
  const personsCount = await prisma.person.count({
    where: nameFilter
  });
  
  let totalCredit = 0;
  let totalDebit = 0;
  let totalProfitPaid = 0;
  let totalToBeGiven = 0;
  let totalToBeTaken = 0;

  const categoryTotals: Record<string, number> = {};

  transactions.forEach(tr => {
    if (tr.type === "CREDIT") totalCredit += tr.amount;
    if (tr.type === "DEBIT") totalDebit += tr.amount;
    if (tr.type === "DEBIT_PROFIT") {
      totalDebit += tr.amount;
      totalProfitPaid += tr.amount;
    }
    if (tr.type === "TO_BE_GIVEN") totalToBeGiven += tr.amount;
    if (tr.type === "TO_BE_TAKEN") totalToBeTaken += tr.amount;

    if ((tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") && (tr as any).category) {
      const cat = (tr as any).category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + tr.amount;
    }
  });

  const customCategories = await prisma.category.findMany();

  const netBalance = totalCredit - totalDebit;
  
  // Calculate top balances
  const personsWithBalances = await prisma.person.findMany({
    where: nameFilter,
    include: { transactions: true }
  });

  const accountBalances = personsWithBalances.map(person => {
    let bal = 0;
    person.transactions.forEach(tr => {
      if (tr.type === "CREDIT") bal += tr.amount;
      if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") bal -= tr.amount;
    });
    return { ...person, balance: bal };
  });

  const topCreditors = [...accountBalances].sort((a, b) => b.balance - a.balance).filter(a => a.balance > 0).slice(0, 5);
  const topDebtors = [...accountBalances].sort((a, b) => a.balance - b.balance).filter(a => a.balance < 0).slice(0, 5);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  let filteredTransactions: any[] = [];
  let filterTitle = "";
  if (filter === "credit") { filteredTransactions = transactions.filter(t => t.type === "CREDIT"); filterTitle = t("totalCredit"); }
  if (filter === "debit") { filteredTransactions = transactions.filter(t => t.type === "DEBIT"); filterTitle = t("totalDebit"); }
  if (filter === "profit") { filteredTransactions = transactions.filter(t => t.type === "DEBIT_PROFIT"); filterTitle = t("totalProfitPaid"); }
  if (filter === "given") { filteredTransactions = transactions.filter(t => t.type === "TO_BE_GIVEN"); filterTitle = t("totalToBeGiven"); }
  if (filter === "taken") { filteredTransactions = transactions.filter(t => t.type === "TO_BE_TAKEN"); filterTitle = t("totalToBeTaken"); }

  // Fetch unpaid expenses for the current month
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const allExpenses = await prisma.recurringExpense.findMany({
    include: { payments: { where: { month: currentMonthStr } } }
  });
  
  const unpaidExpenses = allExpenses
    .filter(e => e.payments.length === 0)
    .filter(e => {
      const created = new Date(e.createdAt);
      const createdYear = created.getFullYear();
      const createdMonth = created.getMonth() + 1;
      return createdYear < today.getFullYear() || (createdYear === today.getFullYear() && createdMonth <= today.getMonth() + 1);
    })
    .sort((a, b) => Math.min(a.dueDay, daysInMonth) - Math.min(b.dueDay, daysInMonth));

  // Fetch the dedicated General Expenses person to display its highlighted stats
  const generalExpensesPerson = await prisma.person.findFirst({
    where: { nameEnglish: { contains: 'General Expenses' } },
    include: { transactions: true }
  });

  let geBalance = 0;
  if (generalExpensesPerson) {
    generalExpensesPerson.transactions.forEach((tr: any) => {
      if (tr.type === "CREDIT") geBalance += tr.amount;
      if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") geBalance -= tr.amount;
    });
  }

  return (
    <div>
      {/* Print-Only Professional Header */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Master Financial Report</h1>
        <p className="text-gray-500 mt-1 font-medium">Generated on: {currentDate}</p>
        {(dateFrom || dateTo) && (
          <p className="text-indigo-600 mt-2 font-bold bg-indigo-50 inline-block px-3 py-1 rounded">
            Filtered Date Range: {dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : 'Start'} to {dateTo ? new Date(dateTo).toLocaleDateString('en-GB') : 'Present'}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-4 no-print">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <div className="flex space-x-4 rtl:space-x-reverse">
          <Link 
            href={`/print-all${dateFrom || dateTo || includeExp ? `?${new URLSearchParams({ ...(dateFrom && {dateFrom}), ...(dateTo && {dateTo}), ...(includeExp && {includeExp: 'true'}) }).toString()}` : ''}`} 
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm transition"
          >
            {t("exportAll")}
          </Link>
          <PrintButton />
        </div>
      </div>

      <DateRangeFilter />

      {/* General Expenses Highlighted Box */}
      {generalExpensesPerson && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 dark:from-red-900/30 dark:to-orange-900/30 dark:border-red-800 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center no-print">
          <div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-400 flex items-center gap-2">
              <span className="text-2xl">📉</span> General Expenses Overview
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Currently running balance: <span className="font-bold">{geBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link 
              href={includeExp ? "?" : "?includeExp=true"} 
              className={`px-4 py-2 rounded font-medium text-sm transition border ${includeExp ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' : 'bg-white text-red-700 border-red-300 hover:bg-red-50'}`}
            >
              {includeExp ? "✓ Merged in Master Totals" : "Include in Master Totals"}
            </Link>
            <Link href={`/persons/${generalExpensesPerson.id}`} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black font-medium text-sm transition shadow">
              Open Ledger
            </Link>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="?" className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border hover:border-black dark:hover:border-white transition-colors ${!filter ? 'border-black dark:border-white ring-1 ring-black dark:ring-white' : 'border-gray-100 dark:border-gray-700'}`}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t("netBalance")}</dt>
            <dd className={`mt-1 text-2xl font-semibold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {netBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </dd>
          </div>
        </Link>
        <Link href="?filter=credit" className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border hover:border-green-600 transition-colors ${filter === 'credit' ? 'border-green-600 ring-1 ring-green-600' : 'border-gray-100 dark:border-gray-700'}`}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t("totalCredit")}</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
          </div>
        </Link>
        <Link href="?filter=debit" className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border hover:border-red-600 transition-colors ${filter === 'debit' ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-100 dark:border-gray-700'}`}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t("totalDebit")}</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
          </div>
        </Link>
        <Link href="?filter=profit" className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border hover:border-orange-600 transition-colors ${filter === 'profit' ? 'border-orange-600 ring-1 ring-orange-600' : 'border-gray-100 dark:border-gray-700'}`}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t("totalProfitPaid")}</dt>
            <dd className="mt-1 text-2xl font-semibold text-orange-600 dark:text-orange-400">{totalProfitPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
          </div>
        </Link>
        <Link href="?filter=given" className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border hover:border-blue-600 transition-colors ${filter === 'given' ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-100 dark:border-gray-700'}`}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t("totalToBeGiven")}</dt>
            <dd className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">{totalToBeGiven.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
          </div>
        </Link>
        <Link href="?filter=taken" className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border hover:border-purple-600 transition-colors ${filter === 'taken' ? 'border-purple-600 ring-1 ring-purple-600' : 'border-gray-100 dark:border-gray-700'}`}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t("totalToBeTaken")}</dt>
            <dd className="mt-1 text-2xl font-semibold text-purple-600 dark:text-purple-400">{totalToBeTaken.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
          </div>
        </Link>
        <Link href="/persons" className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border hover:border-gray-900 dark:hover:border-white transition-colors border-gray-100 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t("totalAccounts")}</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{personsCount}</dd>
          </div>
        </Link>
      </div>

      {Object.keys(categoryTotals).length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Expenses by Category</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([catName, total]) => {
                const defaultEmojis: Record<string, string> = {
                  "Electricity": "⚡", "Rent": "🏷️", "Salary": "👤",
                  "Inventory": "🛒", "Transport": "🚗", "Food": "🍽️",
                  "Maintenance": "⚙️", "Tax": "🧾", "Personal": "🏠"
                };
                const customCat = customCategories.find(c => c.name === catName);
                const emoji = customCat ? customCat.emoji : (defaultEmojis[catName] || '📌');
                return (
                  <div key={catName} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <span className="text-xl">{emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{catName}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {!filter ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
          
          {/* Upcoming / Unpaid Expenses Widget */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden lg:col-span-3">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 bg-yellow-50 dark:bg-yellow-900/30 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-yellow-900 dark:text-yellow-300">
                Unpaid Monthly Expenses
              </h3>
              <Link href="/expenses" className="text-sm text-yellow-700 dark:text-yellow-400 hover:underline font-medium">View All</Link>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {unpaidExpenses.map((expense) => (
                <li key={expense.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-gray-900 dark:text-white">{expense.nameEnglish}</span>
                    <span className="text-xs text-red-500 font-medium mt-1">Due: Day {Math.min(expense.dueDay, daysInMonth)}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {expense.expectedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
              {unpaidExpenses.length === 0 && (
                <li className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">All monthly expenses are paid! 🎉</li>
              )}
            </ul>
          </div>

          {/* Top Balances */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 bg-green-50 dark:bg-green-900/30">
              <h3 className="text-lg leading-6 font-medium text-green-900 dark:text-green-300">
                {t("topCreditors")}
              </h3>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {topCreditors.map((person) => (
                <li key={person.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                  <Link href={`/persons/${person.id}`} className="hover:underline flex flex-col">
                    <span className="font-sans font-medium text-blue-600 dark:text-blue-400">{person.nameEnglish}</span>
                    <span className="font-urdu text-sm text-gray-500 dark:text-gray-400">{person.nameUrdu}</span>
                  </Link>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{person.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
              {topCreditors.length === 0 && (
                <li className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">No accounts with positive balances.</li>
              )}
            </ul>
          </div>

          {/* Top Debts */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 bg-red-50 dark:bg-red-900/30">
              <h3 className="text-lg leading-6 font-medium text-red-900 dark:text-red-300">
                {t("topDebtors")}
              </h3>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {topDebtors.map((person) => (
                <li key={person.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                  <Link href={`/persons/${person.id}`} className="hover:underline flex flex-col">
                    <span className="font-sans font-medium text-blue-600 dark:text-blue-400">{person.nameEnglish}</span>
                    <span className="font-urdu text-sm text-gray-500 dark:text-gray-400">{person.nameUrdu}</span>
                  </Link>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {person.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
              {topDebtors.length === 0 && (
                <li className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">No accounts with negative balances.</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 flex justify-between items-center no-print">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {filterTitle}
            </h3>
            <Link href="?" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Clear Filter
            </Link>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{tTx("date")}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{t("account")}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{tTx("description")}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{tTx("amount")}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((tr) => {
                  const d = tr.date ? new Date(tr.date) : null;
                  const formattedDate = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : "-";
                  const typeDisplay = tr.type === "DEBIT_PROFIT" ? "Profit Paid" : (tr.type === "TO_BE_GIVEN" ? "To Be Given" : (tr.type === "TO_BE_TAKEN" ? "To Be Taken" : tr.type));
                  const colorClass = tr.type === 'DEBIT' ? 'text-red-600 dark:text-red-400' : (tr.type === 'DEBIT_PROFIT' ? 'text-orange-600 dark:text-orange-400' : (tr.type === 'TO_BE_GIVEN' ? 'text-blue-600 dark:text-blue-400' : (tr.type === 'TO_BE_TAKEN' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400')));
                  const sign = tr.type === 'TO_BE_GIVEN' ? '*' : (tr.type === 'TO_BE_TAKEN' ? '^' : (tr.type === 'DEBIT' || tr.type === 'DEBIT_PROFIT' ? '-' : '+'));

                  return (
                    <tr key={tr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formattedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        <Link href={`/persons/${tr.personId}`} className="hover:underline flex flex-col">
                          <span className="font-sans">{tr.person.nameEnglish}</span>
                          <span className="font-urdu text-xs text-gray-500 dark:text-gray-400">{tr.person.nameUrdu}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="font-sans">{tr.descriptionEnglish}</div>
                        <div className="font-urdu text-xs text-gray-500 dark:text-gray-400">{tr.descriptionUrdu}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${colorClass}`}>
                        {sign}{tr.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print-Only Professional Footer / Summary */}
      <div className="hidden print:block mt-12 pt-8 border-t border-gray-300">
        <div className="flex justify-between items-end text-sm text-gray-500">
          <div>
            <p className="font-bold text-gray-700 mb-1">Executive Summary:</p>
            <p>The business currently maintains an active ledger of <span className="font-semibold text-gray-900">{personsCount}</span> accounts.</p>
            <p>Net standing balance is evaluated at <span className={`font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>.</p>
          </div>
          <div className="text-right">
            <p>Authorized Signature: ______________________</p>
            <p className="mt-4 text-xs">System Generated Document • Internal Use Only</p>
          </div>
        </div>
      </div>

    </div>
  );
}
