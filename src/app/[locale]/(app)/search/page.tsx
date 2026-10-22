import prisma from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { TransactionRow } from "@/components/TransactionRow";
import { getUserRole } from "@/lib/auth";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const role = await getUserRole();
  const isAdmin = role === "ADMIN";

  if (!query) {
    return <div className="p-8 text-center text-gray-500">Please enter a search query.</div>;
  }

  // 1. Search Persons
  const persons = await prisma.person.findMany({
    where: {
      OR: [
        { nameEnglish: { contains: query } },
        { nameUrdu: { contains: query } },
        { id: { startsWith: query } }
      ]
    },
    take: 10
  });

  const queryNum = parseFloat(query);
  const isQueryNum = !isNaN(queryNum);

  // 2. Search Transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { descriptionEnglish: { contains: query } },
        { descriptionUrdu: { contains: query } },
        { type: { contains: query } },
        ...(isQueryNum ? [{ amount: queryNum }] : [])
      ]
    },
    include: { person: true },
    orderBy: { date: 'desc' },
    take: 20
  });

  // 3. Search Notes
  const notes = await prisma.note.findMany({
    where: {
      text: { contains: query }
    },
    include: { person: true },
    take: 10
  });

  const allPersons = transactions.length > 0 ? await prisma.person.findMany({
    select: { id: true, nameEnglish: true, nameUrdu: true },
    orderBy: { nameEnglish: 'asc' }
  }) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Results for "{query}"</h1>

      {persons.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Accounts ({persons.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {persons.map(p => (
              <Link key={p.id} href={`/persons/${p.id}`} className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition">
                <div className="text-xs text-gray-500 mb-1 font-mono">{p.id.substring(0,6).toUpperCase()}</div>
                <div className="font-bold text-blue-600 dark:text-blue-400">{p.nameEnglish}</div>
                <div className="text-sm font-urdu text-gray-600 dark:text-gray-300">{p.nameUrdu}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Notes ({notes.length})</h2>
          <ul className="space-y-3">
            {notes.map(n => (
              <li key={n.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm border border-yellow-100 dark:border-yellow-900/50">
                <p className="text-gray-900 dark:text-white mb-2">{n.text}</p>
                {(n as any).person && (
                  <Link href={`/persons/${n.personId}`} className="text-xs text-indigo-600 hover:underline">
                    Linked to: {(n as any).person.nameEnglish}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Transactions ({transactions.length})</h2>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date / Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  {isAdmin && <th className="px-6 py-3"></th>}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map(tr => (
                  <TransactionRow key={tr.id} transaction={tr} isAdmin={isAdmin} showAccountName={true} allPersons={allPersons} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {persons.length === 0 && notes.length === 0 && transactions.length === 0 && (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
