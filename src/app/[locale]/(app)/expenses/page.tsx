import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { ExpenseTracker } from "@/components/ExpenseTracker";
import { PrintButton } from "@/components/PrintButton";
import { EmailButton } from "@/components/EmailButton";
import { getUserRole } from "@/lib/auth";
import { ExpenseLedger } from "@/components/ExpenseLedger";

export default async function ExpensesPage() {
  const t = await getTranslations("Expenses");
  const role = await getUserRole();
  const isAdmin = role === "ADMIN";

  const expenses = await prisma.recurringExpense.findMany({
    include: { payments: true },
    orderBy: { dueDay: 'asc' }
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <div className="flex gap-4">
          {isAdmin && <EmailButton />}
          <PrintButton />
        </div>
      </div>
      
      <div className="hidden print:block mb-8 text-center border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Monthly Expenses Report</h1>
      </div>
      
      {isAdmin && (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6 mb-8 no-print">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t("addExpense")}</h2>
        <AddExpenseForm />
      </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
        <div className="px-4 py-5 sm:p-6">
          <ExpenseTracker expenses={expenses} isAdmin={isAdmin} />
        </div>
      </div>

      <ExpenseLedger expenses={expenses} />
    </div>
  );
}
