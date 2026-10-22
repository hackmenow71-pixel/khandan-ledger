"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";

export function PersonList({ persons, tEdit, isAdmin = true }: { 
  persons: { 
    id: string; 
    nameEnglish: string; 
    nameUrdu: string;
    balance?: number;
    _count?: { transactions: number };
  }[],
  tEdit: string,
  isAdmin?: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = persons.filter(p => {
    const accId = p.id.substring(0, 6).toUpperCase();
    const term = searchTerm.toLowerCase();
    return (
      accId.includes(term.toUpperCase()) ||
      p.nameEnglish.toLowerCase().includes(term) ||
      p.nameUrdu.includes(term)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search by Name or Account ID (e.g. F47AC1)..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md shadow-sm focus:ring-black focus:border-black block text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-black dark:text-white bg-white dark:bg-gray-800 font-sans"
        />
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filtered.map(person => {
            const accountId = person.id.substring(0, 6).toUpperCase();
            const txCount = person._count?.transactions || 0;
            const balance = person.balance || 0;
            const balanceColor = balance > 0 ? "text-green-600 dark:text-green-400" : balance < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400";
            const balanceSign = balance > 0 ? "+" : "";
            return (
              <li key={person.id}>
                <Link href={`/persons/${person.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-mono text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                        {accountId}
                      </div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate font-sans">
                        {person.nameEnglish}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-urdu">
                        {person.nameUrdu}
                      </p>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-sans hidden sm:block">
                        ({txCount} {txCount === 1 ? 'entry' : 'entries'})
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-4 rtl:space-x-reverse">
                      <div className={`text-sm font-semibold ${balanceColor}`}>
                        {balanceSign}{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {isAdmin && (
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                        {tEdit}
                      </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No accounts found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
