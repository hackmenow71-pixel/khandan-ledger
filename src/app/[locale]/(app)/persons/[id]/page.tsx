import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { addTransaction } from "@/app/actions";
import { notFound } from "next/navigation";

import { PrintButton } from "@/components/PrintButton";
import { EditPersonForm } from "@/components/EditPersonForm";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { TransactionRow } from "@/components/TransactionRow";
import { NotesList } from "@/components/NotesList";
import { AddNoteForm } from "@/components/AddNoteForm";
import { InventoryList } from "@/components/InventoryList";
import { UploadFileForm } from "@/components/UploadFileForm";
import { MobileExportButton } from "@/components/MobileExportButton";
import { getUserRole } from "@/lib/auth";
import { ChequeTracker } from "@/components/ChequeTracker";
import { updatePersonContact } from "@/app/actions/extras";
import { DateRangeFilter } from "@/components/DateRangeFilter";

export default async function PersonDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ dateFrom?: string; dateTo?: string }> }) {
  const { id } = await params;
  const resolvedParams = await searchParams;
  const dateFrom = resolvedParams.dateFrom;
  const dateTo = resolvedParams.dateTo;
  const t = await getTranslations("Transactions");
  const tNotes = await getTranslations("Notes");
  const tInventory = await getTranslations("Inventory");
  const role = await getUserRole();
  const isAdmin = role === "ADMIN";
  
  const person = await prisma.person.findUnique({
    where: { id },
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
              ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59') } : {}),
            }
          } : {})
        }
      },
      notes: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { createdAt: 'desc' } },
      cheques: { orderBy: { date: 'desc' } }
    }
  });

  const customCategories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const templates = await prisma.transactionTemplate.findMany({ orderBy: { label: 'asc' } });
  const allPersons = await prisma.person.findMany({
    select: { id: true, nameEnglish: true, nameUrdu: true },
    orderBy: { nameEnglish: 'asc' }
  });

  if (!person) notFound();

  let balance = 0;
  let toBeGiven = 0;
  let toBeTaken = 0;
  person.transactions.forEach(tr => {
    if (tr.type === "CREDIT") balance += tr.amount;
    if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") balance -= tr.amount;
    if (tr.type === "TO_BE_GIVEN") toBeGiven += tr.amount;
    if (tr.type === "TO_BE_TAKEN") toBeTaken += tr.amount;
  });

  // Extract unique purposes for this account
  const uniquePurposesMap = new Map();
  person.transactions.forEach(tr => {
    const key = tr.descriptionEnglish + "|" + tr.descriptionUrdu;
    if (!uniquePurposesMap.has(key)) {
      uniquePurposesMap.set(key, { en: tr.descriptionEnglish, ur: tr.descriptionUrdu });
    }
  });
  const purposes = Array.from(uniquePurposesMap.values());

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="bg-gray-100 text-gray-500 font-mono text-xs px-2 py-1 rounded border border-gray-200 inline-block mb-2">
            ID: {person.id.substring(0, 6).toUpperCase()}
          </div>
          {isAdmin ? (
            <EditPersonForm person={{ id: person.id, nameEnglish: person.nameEnglish, nameUrdu: person.nameUrdu, phone: person.phone, address: person.address }} />
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-sans">{person.nameEnglish}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-urdu">{person.nameUrdu}</p>
              {(person.phone || person.address) && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {person.phone && (
                    <p>📞 <a href={`tel:${person.phone}`} className="hover:underline">{person.phone}</a></p>
                  )}
                  {person.address && (
                    <p>📍 {person.address}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {(dateFrom || dateTo) && (
            <div className="mt-3 hidden print:block text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-md inline-block">
              📅 Date Filter: {dateFrom ? new Date(dateFrom).toLocaleDateString('en-GB') : 'Start'} to {dateTo ? new Date(dateTo).toLocaleDateString('en-GB') : 'Present'}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end space-y-4 rtl:space-y-reverse">
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex gap-2">
            <MobileExportButton 
              url={`/api/export/${person.id}`} 
              fileName={`${person.nameEnglish.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ledger.xlsx`} 
            />
            <PrintButton />
          </div>
          </div>
        </div>
      </div>

      {(toBeGiven > 0 || toBeTaken > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 no-print">
          {toBeGiven > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/30 shadow-sm rounded-lg border border-blue-100 dark:border-blue-900 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 font-sans">To Be Given</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 font-urdu">دینے والی رقم</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  *{toBeGiven.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
          {toBeTaken > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/30 shadow-sm rounded-lg border border-purple-100 dark:border-purple-900 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 font-sans">To Be Taken</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400 font-urdu">لینے والی رقم</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  ^{toBeTaken.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 mb-8 no-print">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">{t("addTransaction")}</h3>
          <AddTransactionForm personId={person.id} purposes={purposes} customCategories={customCategories} templates={templates} />
        </div>
      </div>
      )}


      <DateRangeFilter />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{t("date")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{t("type")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{t("description")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rtl:text-right">{t("amount")}</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider no-print"></th>}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(() => {
                let runningBalance = 0;
                return person.transactions.map((tr) => {
                  if (tr.type === "CREDIT") runningBalance += tr.amount;
                  if (tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT") runningBalance -= tr.amount;
                  return (
                    <TransactionRow key={tr.id} transaction={tr} runningBalance={runningBalance} purposes={purposes} isAdmin={isAdmin} customCategories={customCategories} allPersons={allPersons} />
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <ChequeTracker personId={person.id} cheques={person.cheques as any} isAdmin={isAdmin} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        {/* Notes Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{tNotes("title")}</h2>
          {isAdmin && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6 mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{tNotes("addNote")}</h3>
            <AddNoteForm personId={person.id} />
          </div>
          )}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden px-4 py-5 sm:p-6">
            <NotesList notes={person.notes} isAdmin={isAdmin} />
          </div>
        </div>

        {/* Inventory Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{tInventory("title")}</h2>
          {isAdmin && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6 mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{tInventory("uploadFile")}</h3>
            <UploadFileForm personId={person.id} />
          </div>
          )}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden px-4 py-5 sm:p-6">
            <InventoryList files={person.files} isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
}
