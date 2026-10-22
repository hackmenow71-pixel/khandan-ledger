import prisma from "@/lib/prisma";

export default async function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: firstDay, lte: lastDay }
    },
    include: { person: true },
    orderBy: { date: "asc" }
  });

  // Group by day number
  const byDay: Record<number, typeof transactions> = {};
  transactions.forEach(tr => {
    if (tr.date) {
      const day = new Date(tr.date).getDate();
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(tr);
    }
  });

  const monthName = today.toLocaleString("en-US", { month: "long", year: "numeric" });
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📅 Transaction Calendar — {monthName}</h1>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day === today.getDate();
            const txs = day ? (byDay[day] || []) : [];
            return (
              <div key={i} className={`min-h-[80px] p-2 border-b border-r border-gray-100 dark:border-gray-700 ${!day ? "bg-gray-50 dark:bg-gray-900/30" : ""}`}>
                {day && (
                  <>
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full mb-1 ${isToday ? "bg-indigo-600 text-white" : "text-gray-700 dark:text-gray-300"}`}>
                      {day}
                    </span>
                    {txs.slice(0, 3).map((tr, j) => {
                      const color = tr.type === "CREDIT" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" :
                        tr.type === "DEBIT" || tr.type === "DEBIT_PROFIT" ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
                      return (
                        <div key={j} className={`text-[10px] px-1 py-0.5 rounded mb-0.5 truncate font-sans ${color}`} title={tr.descriptionEnglish}>
                          {tr.person.nameEnglish} · {tr.amount.toLocaleString()}
                        </div>
                      );
                    })}
                    {txs.length > 3 && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">+{txs.length - 3} more</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's transactions list */}
      {byDay[today.getDate()]?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Today's Transactions</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {byDay[today.getDate()].map(tr => (
              <div key={tr.id} className="px-6 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-sans">{tr.person.nameEnglish}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tr.descriptionEnglish} · {tr.type}</p>
                </div>
                <span className={`text-sm font-bold ${tr.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                  {tr.type === "CREDIT" ? "+" : "-"}{tr.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
