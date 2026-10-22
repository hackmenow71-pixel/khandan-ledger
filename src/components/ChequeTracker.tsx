"use client";

import { useState } from "react";
import { addCheque, updateChequeStatus, deleteCheque } from "@/app/actions/extras";

type Cheque = {
  id: string;
  personId: string;
  chequeNumber: string;
  bankName: string;
  amount: number;
  status: string;
  date: Date;
};

export function ChequeTracker({ personId, cheques, isAdmin }: {
  personId: string;
  cheques: Cheque[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  const statusColor = (s: string) =>
    s === "CLEARED" ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" :
    s === "BOUNCED" ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" :
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 mb-8 no-print">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🏦 Cheques ({cheques.length})</h3>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-6 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {isAdmin && (
            <form action={addCheque as any} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input type="hidden" name="personId" value={personId} />
              <input name="chequeNumber" required placeholder="Cheque No." className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
              <input name="bankName" required placeholder="Bank Name" className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
              <input name="amount" required type="number" step="0.01" placeholder="Amount" className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
              <div className="flex gap-2">
                <input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-black dark:text-white" />
                <button type="submit" className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-md hover:bg-gray-800">Add</button>
              </div>
            </form>
          )}

          {cheques.length === 0 && <p className="text-sm text-gray-400">No cheques recorded.</p>}

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {cheques.map(chq => (
              <div key={chq.id} className="py-3 flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white font-sans">
                    #{chq.chequeNumber} — {chq.bankName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rs. {chq.amount.toLocaleString()} · {new Date(chq.date).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(chq.status)}`}>{chq.status}</span>
                  {isAdmin && (
                    <>
                      <form action={updateChequeStatus as any} className="inline">
                        <input type="hidden" name="id" value={chq.id} />
                        <input type="hidden" name="personId" value={personId} />
                        <select name="status" defaultValue={chq.status} onChange={e => {
                          (e.target.form as HTMLFormElement)?.requestSubmit();
                        }} className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-black dark:text-white">
                          <option value="PENDING">Pending</option>
                          <option value="CLEARED">Cleared</option>
                          <option value="BOUNCED">Bounced</option>
                        </select>
                      </form>
                      <form action={deleteCheque as any} className="inline">
                        <input type="hidden" name="id" value={chq.id} />
                        <input type="hidden" name="personId" value={personId} />
                        <button type="submit" onClick={e => { if (!confirm("Delete cheque?")) e.preventDefault(); }} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
