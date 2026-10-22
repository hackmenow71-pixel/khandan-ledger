"use client";

import { useTranslations } from "next-intl";
import { addExpense } from "@/app/actions/expenses";

export function AddExpenseForm() {
  const t = useTranslations("Expenses");

  return (
    <form action={addExpense as any} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("nameEn")}</label>
        <input type="text" name="nameEnglish" required className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border font-sans text-black dark:text-white bg-white dark:bg-gray-700" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("nameUr")}</label>
        <input type="text" name="nameUrdu" required dir="rtl" className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border font-urdu text-black dark:text-white bg-white dark:bg-gray-700" />
      </div>
      <div className="w-32">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("expectedAmount")}</label>
        <input type="number" step="0.01" name="expectedAmount" required className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border font-sans text-black dark:text-white bg-white dark:bg-gray-700" />
      </div>
      <div className="w-36">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t("dueDate")}</label>
        <input type="date" name="dueDate" required className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border font-sans text-black dark:text-white bg-white dark:bg-gray-700" />
      </div>
      <button type="submit" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
        {t("addExpense")}
      </button>
    </form>
  );
}
