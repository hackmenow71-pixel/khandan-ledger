import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { ReportsCharts } from "@/components/ReportsCharts";
import { PrintButton } from "@/components/PrintButton";

export default async function ReportsPage() {
  const t = await getTranslations("Dashboard");

  // Fetch all transactions to build analytics
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'asc' },
    where: {
      person: {
        nameEnglish: { not: { contains: 'General Expenses' } }
      }
    }
  });

  let totalToBeGiven = 0;
  let totalToBeTaken = 0;
  let totalProfitAllTime = 0;
  const categoryTotals: Record<string, number> = {};

  // Monthly aggregation (Last 6 months for charts)
  const monthlyData: Record<string, { credit: number, debit: number, profit: number }> = {};
  
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthlyData[key] = { credit: 0, debit: 0, profit: 0 };
  }

  // All-time monthly ledger (every month that has data)
  const allMonthlyLedger: Record<string, { credit: number, debit: number, profitPaid: number, net: number, sortKey: string }> = {};

  transactions.forEach(tr => {
    // Pie Chart Stats
    if (tr.type === "TO_BE_GIVEN") totalToBeGiven += tr.amount;
    if (tr.type === "TO_BE_TAKEN") totalToBeTaken += tr.amount;
    if (tr.type === "DEBIT_PROFIT") totalProfitAllTime += tr.amount;

    // Category breakdown (for DEBIT transactions with a category)
    if ((tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") && (tr as any).category) {
      const cat = (tr as any).category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + tr.amount;
    }

    // Bar Chart & Profit Stats (last 6 months)
    if (tr.date) {
      const d = new Date(tr.date);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData[key]) {
        if (tr.type === "CREDIT") monthlyData[key].credit += tr.amount;
        if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") monthlyData[key].debit += tr.amount;
        if (tr.type === "DEBIT_PROFIT") monthlyData[key].profit += tr.amount;
      }

      // All-time monthly ledger
      if (tr.type === "CREDIT" || tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") {
        const year = d.getFullYear();
        const month = d.getMonth();
        const sortKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        if (!allMonthlyLedger[label]) {
          allMonthlyLedger[label] = { credit: 0, debit: 0, profitPaid: 0, net: 0, sortKey };
        }
        if (tr.type === "CREDIT") allMonthlyLedger[label].credit += tr.amount;
        if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") allMonthlyLedger[label].debit += tr.amount;
        if (tr.type === "DEBIT_PROFIT") allMonthlyLedger[label].profitPaid += tr.amount;
      }
    }
  });

  // Compute net per month
  Object.keys(allMonthlyLedger).forEach(month => {
    allMonthlyLedger[month].net = allMonthlyLedger[month].credit - allMonthlyLedger[month].debit;
  });

  // Sort months newest first
  const sortedMonthlyLedger = Object.entries(allMonthlyLedger)
    .sort(([, a], [, b]) => b.sortKey.localeCompare(a.sortKey));

  // Sort categories by value
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const pieData = [];
  // Expanded color palette for more rings
  const chartColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e", "#0ea5e9"];
  
  let othersValue = 0;
  // Increase limit to 8 individual categories before grouping into 'Others'
  for (let i = 0; i < sortedCategories.length; i++) {
    if (i < 8) {
      pieData.push({ 
        name: sortedCategories[i][0] || "Uncategorized", 
        value: sortedCategories[i][1], 
        color: chartColors[i % chartColors.length] 
      });
    } else {
      othersValue += sortedCategories[i][1];
    }
  }
  if (othersValue > 0) {
    pieData.push({ name: "Others", value: othersValue, color: "#9ca3af" });
  }

  if (pieData.length === 0) {
    pieData.push({ name: "No Expenses", value: 1, color: "#e5e7eb" });
  }

  const barData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    credit: data.credit,
    debit: data.debit
  }));

  const profitData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    profit: data.profit
  }));

  const labels = {
    titlePie: "Expense Categories Breakdown",
    titleBar: "6-Month Cash Flow (Credit vs Debit)",
    titleProfit: "6-Month Business Profit (Paid Out)",
    credit: t("totalCredit"),
    debit: t("totalDebit")
  };

  const netBalance = totalToBeTaken - totalToBeGiven;
  const fiSabiLillah = Math.max(0, netBalance * 0.02);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <PrintButton />
      </div>

      {/* Print-Only Professional Header */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1 font-medium">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
      </div>
      
      {/* Fi Sabi Lillah Card */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 font-urdu flex items-center gap-2" dir="rtl">
            <span>فی سبیل اللہ</span>
            <span dir="ltr" className="font-sans font-medium text-xl">(2%)</span>
          </h2>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 font-sans mt-1">
            Charity Allocation (2% of Net Balance: {netBalance.toLocaleString()})
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
            {fiSabiLillah.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <ReportsCharts pieData={pieData} barData={barData} profitData={profitData} labels={labels} />

      {/* Category Breakdown Table */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 mt-8">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">💸 Expense Category Breakdown</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total debit spending grouped by category</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, total]) => {
                const maxVal = Math.max(...Object.values(categoryTotals));
                const pct = Math.round((total / maxVal) * 100);
                return (
                  <div key={category} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{category}</div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="w-32 text-right text-sm font-bold text-red-600 dark:text-red-400 shrink-0">
                      {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ===== Monthly Ledger Table ===== */}
      {sortedMonthlyLedger.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 mt-8">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📆 Monthly Financial Ledger</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Automatic month-by-month summary — {sortedMonthlyLedger.length} month{sortedMonthlyLedger.length !== 1 ? 's' : ''} of records
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Profit Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {sortedMonthlyLedger.map(([month, data], idx) => (
                  <tr key={month} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${idx === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 font-semibold' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {idx === 0 && <span className="inline-block mr-2 text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-semibold">Current</span>}
                      {month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-medium">
                      {data.credit > 0 ? `+${fmt(data.credit)}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400 font-medium">
                      {data.debit > 0 ? `-${fmt(data.debit)}` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600 dark:text-orange-400 font-medium">
                      {data.profitPaid > 0 ? fmt(data.profitPaid) : '—'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${data.net >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {data.net >= 0 ? `+${fmt(data.net)}` : fmt(data.net)}
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr className="bg-gray-100 dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">All Time Total</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-green-700 dark:text-green-400">
                    +{fmt(sortedMonthlyLedger.reduce((s, [, d]) => s + d.credit, 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-red-700 dark:text-red-400">
                    -{fmt(sortedMonthlyLedger.reduce((s, [, d]) => s + d.debit, 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-orange-700 dark:text-orange-400">
                    {fmt(sortedMonthlyLedger.reduce((s, [, d]) => s + d.profitPaid, 0))}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-black ${sortedMonthlyLedger.reduce((s, [, d]) => s + d.net, 0) >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {(() => { const n = sortedMonthlyLedger.reduce((s, [, d]) => s + d.net, 0); return n >= 0 ? `+${fmt(n)}` : fmt(n); })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

