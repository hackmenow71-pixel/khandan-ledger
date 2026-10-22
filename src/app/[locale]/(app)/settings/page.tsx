import prisma from "@/lib/prisma";
import { getUserRole } from "@/lib/auth";
import { addCategory, deleteCategory, saveTemplate, deleteTemplate } from "@/app/actions/extras";

export default async function SettingsPage() {
  const isAdmin = await getUserRole() === "ADMIN";
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  const templates = await prisma.transactionTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Custom Categories */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🏷️ Custom Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your own transaction categories</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          {isAdmin && (
            <form action={addCategory as any} className="flex gap-2 items-end flex-wrap">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Emoji</label>
                <input name="emoji" defaultValue="📌" className="w-16 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-center text-lg bg-white dark:bg-gray-700 text-black dark:text-white" maxLength={2} />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category Name</label>
                <input name="name" required placeholder="e.g. Commission" className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
              </div>
              <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-md hover:bg-gray-800 dark:hover:bg-gray-200">Add</button>
            </form>
          )}
          <div className="flex flex-wrap gap-2">
            {categories.length === 0 && <p className="text-sm text-gray-400">No custom categories yet.</p>}
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 text-sm">
                <span>{cat.emoji} {cat.name}</span>
                {isAdmin && (
                  <form action={deleteCategory as any} className="inline">
                    <input type="hidden" name="id" value={cat.id} />
                    <button type="submit" className="text-red-400 hover:text-red-600 ml-1 text-xs font-bold">✕</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Templates */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Transaction Templates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saved templates for quick transaction entry</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          {isAdmin && (
            <form action={saveTemplate as any} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input name="label" required placeholder="Template name (e.g. Monthly Rent)" className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white sm:col-span-3" />
              <input name="descriptionEnglish" required placeholder="Description (English)" className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white font-sans" />
              <input name="descriptionUrdu" required placeholder="تفصیل (اردو)" dir="rtl" className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white font-urdu" />
              <input name="amount" required type="number" step="0.01" placeholder="Amount" className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
              <select name="type" className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white">
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
                <option value="DEBIT_PROFIT">Profit Paid</option>
                <option value="TO_BE_GIVEN">To Be Given</option>
                <option value="TO_BE_TAKEN">To Be Taken</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 sm:col-span-3">Save Template</button>
            </form>
          )}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {templates.length === 0 && <p className="text-sm text-gray-400">No templates saved yet.</p>}
            {templates.map(tpl => (
              <div key={tpl.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{tpl.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">{tpl.type} · {tpl.descriptionEnglish} · {tpl.amount.toLocaleString()}</p>
                </div>
                {isAdmin && (
                  <form action={deleteTemplate as any}>
                    <input type="hidden" name="id" value={tpl.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
