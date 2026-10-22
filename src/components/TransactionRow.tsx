"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { updateTransaction, deleteTransaction } from "@/app/actions";

import { numberToWordsEn, numberToWordsUr } from "@/lib/numberToWords";
import { Link } from "@/i18n/routing";
import { CopyTransactionModal } from "@/components/CopyTransactionModal";

export function TransactionRow({ 
  transaction,
  runningBalance,
  purposes,
  isAdmin = true,
  showAccountName = false,
  customCategories = [],
  allPersons = []
}: { 
  transaction: {
    id: string;
    personId: string;
    date: Date | null;
    type: string;
    descriptionEnglish: string;
    descriptionUrdu: string;
    amount: number;
    category?: string | null;
  };
  runningBalance?: number;
  purposes?: { en: string, ur: string }[];
  isAdmin?: boolean;
  showAccountName?: boolean;
  customCategories?: { id: string, name: string, emoji: string }[];
  allPersons?: { id: string, nameEnglish: string, nameUrdu: string }[];
}) {
  const t = useTranslations("Transactions");
  const [isEditing, setIsEditing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const safePurposes = purposes || [];

  // Edit state
  const initialDateStr = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : "";
  const [dateStr, setDateStr] = useState(initialDateStr);
  const [type, setType] = useState(transaction.type);
  const [descEn, setDescEn] = useState(transaction.descriptionEnglish);
  const [descUr, setDescUr] = useState(transaction.descriptionUrdu);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category || "");

  let formattedDate = "-";
  if (transaction.date) {
    const d = new Date(transaction.date);
    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  const typeDisplay = transaction.type === "DEBIT_PROFIT" ? "Profit Paid" : (transaction.type === "TO_BE_GIVEN" ? "To Be Given" : (transaction.type === "TO_BE_TAKEN" ? "To Be Taken" : transaction.type));
  const colorClass = transaction.type === 'DEBIT' ? 'text-red-600' : (transaction.type === 'DEBIT_PROFIT' ? 'text-orange-600' : (transaction.type === 'TO_BE_GIVEN' ? 'text-blue-600' : (transaction.type === 'TO_BE_TAKEN' ? 'text-purple-600' : 'text-green-600')));
  const sign = transaction.type === 'TO_BE_GIVEN' ? '*' : (transaction.type === 'TO_BE_TAKEN' ? '^' : (transaction.type === 'DEBIT' || transaction.type === 'DEBIT_PROFIT' ? '-' : '+'));

  if (!isEditing) {
    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {formattedDate}
          {showAccountName && (transaction as any).person && (
            <div className="mt-1">
              <Link href={`/persons/${transaction.personId}`} className="text-xs text-indigo-600 hover:underline">
                Account: {(transaction as any).person.nameEnglish}
              </Link>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{typeDisplay}</td>
        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
          <div className="font-sans">{transaction.descriptionEnglish}</div>
          <div className="font-urdu text-gray-500 dark:text-gray-400">{transaction.descriptionUrdu}</div>
          {transaction.category && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-sans">
              {transaction.category}
            </span>
          )}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${colorClass}`}>
          <div>{sign}{transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 font-normal font-sans mt-1">{numberToWordsEn(transaction.amount)}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 font-normal font-urdu" dir="rtl">{numberToWordsUr(transaction.amount)}</div>
          {runningBalance !== undefined && transaction.type !== 'TO_BE_GIVEN' && transaction.type !== 'TO_BE_TAKEN' && (
            <div className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Bal: {runningBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </td>
        {isAdmin && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 no-print text-right">
          <Link href={`/receipt/${transaction.id}`} target="_blank" className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 mr-3 rtl:ml-3 rtl:mr-0 inline-flex items-center" title="Generate Receipt">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Receipt
          </Link>
          <button 
            type="button" 
            onClick={() => setIsCopying(true)} 
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 mr-3 rtl:ml-3 rtl:mr-0 inline-flex items-center" 
            title="Copy to other account(s)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 rtl:ml-1 rtl:mr-0">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            {t("copy") || "Copy"}
          </button>
          <button onClick={() => setIsEditing(true)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 rtl:ml-3 rtl:mr-0">{t("edit")}</button>
          <form action={deleteTransaction as any} className="inline-block">
            <input type="hidden" name="id" value={transaction.id} />
            <input type="hidden" name="personId" value={transaction.personId} />
            <button type="submit" className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" onClick={(e) => {
              if(!confirm("Are you sure?")) e.preventDefault();
            }}>{t("delete")}</button>
          </form>

          {isCopying && (
            <CopyTransactionModal
              isOpen={isCopying}
              onClose={() => setIsCopying(false)}
              transaction={transaction}
              allPersons={allPersons}
              customCategories={customCategories}
            />
          )}
        </td>
        )}
      </tr>
    );
  }

  return (
    <tr className="bg-yellow-50 dark:bg-yellow-900/20">
      <td colSpan={5} className="px-6 py-4">
        <form action={async (formData) => {
          await updateTransaction(formData);
          setIsEditing(false);
        }} className="flex flex-col space-y-4">
          <input type="hidden" name="id" value={transaction.id} />
          <input type="hidden" name="personId" value={transaction.personId} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">
                {t("date")} {(type === "TO_BE_GIVEN" || type === "TO_BE_TAKEN") && <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-1">(Optional)</span>}
              </label>
              <input type="date" name="date" value={dateStr} onChange={e => setDateStr(e.target.value)} required={type !== "TO_BE_GIVEN" && type !== "TO_BE_TAKEN"} className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-1 border text-black dark:text-white bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">{t("type")}</label>
              <select name="type" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-1 border text-black dark:text-white bg-white dark:bg-gray-700">
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
                <option value="DEBIT_PROFIT">Profit Paid</option>
                <option value="TO_BE_GIVEN">To Be Given</option>
                <option value="TO_BE_TAKEN">To Be Taken</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">Description (En)</label>
              <input type="text" name="descriptionEnglish" list={`purposes-edit-${transaction.id}`} value={descEn} onChange={(e) => {
                const val = e.target.value;
                setDescEn(val);
                const matched = safePurposes.find(p => p.en.toLowerCase() === val.toLowerCase());
                if (matched) setDescUr(matched.ur);
              }} required autoComplete="off" className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-1 border font-sans text-black dark:text-white bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">Description (Ur)</label>
              <input type="text" name="descriptionUrdu" value={descUr} onChange={e => setDescUr(e.target.value)} required dir="rtl" autoComplete="off" className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-1 border font-urdu text-black dark:text-white bg-white dark:bg-gray-700" />
            </div>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400">{t("amount")}</label>
              <input type="number" step="0.01" name="amount" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-1 border text-black dark:text-white bg-white dark:bg-gray-700" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400">Category</label>
              <select 
                name="category" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="mt-1 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-1 border text-black dark:text-white bg-white dark:bg-gray-700"
              >
                <option value="">— None —</option>
                {customCategories && customCategories.length > 0 && (
                  <optgroup label="Custom Categories">
                    {customCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Default Categories">
                  <option value="Electricity">⚡ Electricity</option>
                  <option value="Rent">🏷️ Rent</option>
                  <option value="Salary">👤 Salary</option>
                  <option value="Inventory">🛒 Inventory</option>
                  <option value="Transport">🚗 Transport</option>
                  <option value="Food">🍽️ Food</option>
                  <option value="Maintenance">⚙️ Maintenance</option>
                  <option value="Tax">🧾 Tax</option>
                  <option value="Personal">🏠 Personal</option>
                  <option value="Other">📌 Other</option>
                </optgroup>
              </select>
            </div>
            <div className="flex-1 flex justify-end items-end pb-1 space-x-2 rtl:space-x-reverse">
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
              <button type="submit" className="px-3 py-1 text-sm text-white bg-blue-600 dark:bg-blue-500 rounded hover:bg-blue-700 dark:hover:bg-blue-600">Save</button>
            </div>
          </div>
          {safePurposes.length > 0 && (
            <datalist id={`purposes-edit-${transaction.id}`}>
              {safePurposes.map((p, i) => <option key={i} value={p.en} />)}
            </datalist>
          )}
        </form>
      </td>
    </tr>
  );
}
