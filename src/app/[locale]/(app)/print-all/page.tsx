import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";
import { Link } from "@/i18n/routing";

export default async function PrintAllPage({ searchParams }: { searchParams: Promise<{ dateFrom?: string; dateTo?: string; includeExp?: string }> }) {
  const t = await getTranslations("Transactions");
  const resolvedParams = await searchParams;
  const dateFrom = resolvedParams.dateFrom;
  const dateTo = resolvedParams.dateTo;
  const includeExp = resolvedParams.includeExp === 'true';

  const nameFilter = includeExp ? {} : {
    nameEnglish: { not: { contains: 'General Expenses' } }
  };

  const persons = await prisma.person.findMany({
    where: nameFilter,
    include: { 
      transactions: { 
        orderBy: [
          { date: 'asc' },
          { type: 'asc' },
          { createdAt: 'asc' }
        ],
        where: {
          ...(dateFrom || dateTo ? {
            date: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59') } : {})
            }
          } : {})
        }
      } 
    },
    orderBy: { nameEnglish: 'asc' }
  });

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 no-print mb-8 border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Export: All Ledgers</h1>
            <p className="text-gray-500 mt-1">This page combines all accounts into a single view for mass printing.</p>
            {(dateFrom || dateTo) && (
              <p className="text-indigo-600 mt-3 font-bold bg-indigo-50 inline-block px-3 py-1.5 border border-indigo-200 rounded-md">
                📅 Filtered Date Range: {dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : 'Start'} to {dateTo ? new Date(dateTo).toLocaleDateString('en-GB') : 'Present'}
              </p>
            )}
          </div>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
              Back to Dashboard
            </Link>
            <PrintButton />
          </div>
        </div>
      </div>

      {persons.map((person, index) => {
        let balance = 0;
        let toBeGiven = 0;
        let toBeTaken = 0;
        person.transactions.forEach(tr => {
          if (tr.type === "CREDIT") balance += tr.amount;
          if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") balance -= tr.amount;
          if (tr.type === "TO_BE_GIVEN") toBeGiven += tr.amount;
          if (tr.type === "TO_BE_TAKEN") toBeTaken += tr.amount;
        });

        return (
          <div key={person.id} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 print:w-full print:max-w-none print:px-0" style={{ pageBreakAfter: index < persons.length - 1 ? 'always' : 'auto' }}>
            
            {/* Header for each person's page */}
            <div className="mb-6 flex justify-between items-end border-b-2 border-gray-800 pb-2 print:mt-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 font-sans">{person.nameEnglish}</h2>
                <h2 className="text-xl text-gray-600 font-urdu mt-1">{person.nameUrdu}</h2>
                <div className="mt-2 text-xs text-gray-400 font-mono inline-block mr-4">ID: {person.id.substring(0, 6).toUpperCase()}</div>
                {(dateFrom || dateTo) && (
                  <div className="mt-2 text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-sm inline-block">
                    📅 Filtered: {dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : 'Start'} to {dateTo ? new Date(dateTo).toLocaleDateString('en-GB') : 'Present'}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Net Standing Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* To Be Given / Taken Summary if any */}
            {(toBeGiven > 0 || toBeTaken > 0) && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {toBeGiven > 0 && (
                  <div className="border border-blue-200 p-2 flex justify-between items-center bg-blue-50">
                    <span className="font-bold text-blue-900">To Be Given</span>
                    <span className="font-bold text-blue-700">*{toBeGiven.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {toBeTaken > 0 && (
                  <div className="border border-purple-200 p-2 flex justify-between items-center bg-purple-50">
                    <span className="font-bold text-purple-900">To Be Taken</span>
                    <span className="font-bold text-purple-700">^{toBeTaken.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Table */}
            <div className="border border-gray-300">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase rtl:text-right">{t("date")}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase rtl:text-right">{t("type")}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase rtl:text-right">{t("description")}</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase rtl:text-right">{t("amount")}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    let runningBalance = 0;
                    return person.transactions.map((tr) => {
                      if (tr.type === "CREDIT") runningBalance += tr.amount;
                      if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") runningBalance -= tr.amount;
                      
                      const d = tr.date ? new Date(tr.date) : null;
                      const formattedDate = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : "-";
                      const typeDisplay = tr.type === "DEBIT_PROFIT" ? "Profit Paid" : (tr.type === "TO_BE_GIVEN" ? "To Be Given" : (tr.type === "TO_BE_TAKEN" ? "To Be Taken" : tr.type));
                      const colorClass = tr.type === 'DEBIT' ? 'text-red-600' : (tr.type === 'DEBIT_PROFIT' ? 'text-orange-600' : (tr.type === 'TO_BE_GIVEN' ? 'text-blue-600' : (tr.type === 'TO_BE_TAKEN' ? 'text-purple-600' : 'text-green-600')));
                      const sign = tr.type === 'TO_BE_GIVEN' ? '*' : (tr.type === 'TO_BE_TAKEN' ? '^' : (tr.type === 'DEBIT' || tr.type === 'DEBIT_PROFIT' ? '-' : '+'));

                      return (
                        <tr key={tr.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formattedDate}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{typeDisplay}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <div className="font-sans">{tr.descriptionEnglish}</div>
                            <div className="font-urdu text-gray-500 text-xs">{tr.descriptionUrdu}</div>
                          </td>
                          <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold ${colorClass}`}>
                            <div>{sign}{tr.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            {runningBalance !== undefined && tr.type !== 'TO_BE_GIVEN' && tr.type !== 'TO_BE_TAKEN' && (
                              <div className="text-[10px] font-semibold text-gray-400 mt-1">
                                Bal: {runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                  {person.transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                        No transactions recorded for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer for each person's page */}
            <div className="mt-8 text-xs text-gray-400 flex justify-between">
              <span>Account: {person.nameEnglish}</span>
              <span>Generated: {currentDate} • Master Export</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}