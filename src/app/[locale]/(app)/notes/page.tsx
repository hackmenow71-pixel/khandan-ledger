import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { NotesList } from "@/components/NotesList";
import { AddNoteForm } from "@/components/AddNoteForm";
import { getUserRole } from "@/lib/auth";

export default async function NotesPage() {
  const t = await getTranslations("Notes");
  const role = await getUserRole();
  const isAdmin = role === "ADMIN";
  
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: 'desc' },
    include: { person: true }
  });

  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const allExpenses = await prisma.recurringExpense.findMany({
    include: { payments: { where: { month: currentMonthStr } } }
  });
  
  const overdueExpenses = allExpenses
    .filter(e => e.payments.length === 0)
    .filter(e => {
      const created = new Date(e.createdAt);
      const createdYear = created.getFullYear();
      const createdMonth = created.getMonth() + 1;
      return createdYear < today.getFullYear() || (createdYear === today.getFullYear() && createdMonth <= today.getMonth() + 1);
    })
    .filter(e => {
      const actualDueDay = Math.min(e.dueDay, daysInMonth);
      return actualDueDay < today.getDate(); // Overdue!
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      </div>
      
      {overdueExpenses.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 shadow rounded-lg border border-red-200 dark:border-red-800 p-6 mb-8">
          <h2 className="text-lg font-bold text-red-900 dark:text-red-400 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Overdue Expense Alerts
          </h2>
          <ul className="space-y-3">
            {overdueExpenses.map(exp => (
              <li key={exp.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-red-100 dark:border-red-900/50">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{exp.nameEnglish} <span className="text-sm font-normal text-gray-500 font-urdu">({exp.nameUrdu})</span></div>
                  <div className="text-sm text-red-600 dark:text-red-400">Overdue by {today.getDate() - Math.min(exp.dueDay, daysInMonth)} days (Was due on the {Math.min(exp.dueDay, daysInMonth)}th)</div>
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-lg">
                  {exp.expectedAmount.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAdmin && (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t("addNote")}</h2>
        <AddNoteForm />
      </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <NotesList notes={notes} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}