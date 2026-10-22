"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { copyTransactionToAccounts, getAllPersonsForCopy } from "@/app/actions";
import { numberToWordsEn, numberToWordsUr } from "@/lib/numberToWords";

interface PersonOption {
  id: string;
  nameEnglish: string;
  nameUrdu: string;
}

interface CopyTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  allPersons?: PersonOption[];
  customCategories?: { id: string; name: string; emoji: string }[];
}

export function CopyTransactionModal({
  isOpen,
  onClose,
  transaction,
  allPersons = [],
  customCategories = []
}: CopyTransactionModalProps) {
  const t = useTranslations("Transactions");

  const [personsList, setPersonsList] = useState<PersonOption[]>(allPersons);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Editable transaction fields
  const initialDateStr = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : "";
  const [dateStr, setDateStr] = useState(initialDateStr);
  const [type, setType] = useState(transaction.type);
  const [amountStr, setAmountStr] = useState(transaction.amount.toString());
  const [descEn, setDescEn] = useState(transaction.descriptionEnglish);
  const [descUr, setDescUr] = useState(transaction.descriptionUrdu);
  const [category, setCategory] = useState(transaction.category || "");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load persons list if not provided
  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setSelectedPersonIds([]);
      setSearchQuery("");
      setType(transaction.type);
      setAmountStr(transaction.amount.toString());
      setDateStr(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : "");
      setDescEn(transaction.descriptionEnglish);
      setDescUr(transaction.descriptionUrdu);
      setCategory(transaction.category || "");
      setErrorMessage(null);
      setSuccessMessage(null);

      if (allPersons.length === 0) {
        setIsLoadingPersons(true);
        getAllPersonsForCopy()
          .then((res) => {
            setPersonsList(res || []);
          })
          .catch(() => {})
          .finally(() => setIsLoadingPersons(false));
      } else {
        setPersonsList(allPersons);
      }
    }
  }, [isOpen, transaction, allPersons]);

  if (!isOpen || !mounted) return null;

  const parsedAmount = parseFloat(amountStr) || 0;
  const isOppositeAvailable = transaction.type === "CREDIT" || transaction.type === "DEBIT";
  const oppositeType = transaction.type === "CREDIT" ? "DEBIT" : "CREDIT";

  // Filter accounts excluding current person
  const candidatePersons = personsList.filter(p => p.id !== transaction.personId);
  const filteredPersons = candidatePersons.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.nameEnglish.toLowerCase().includes(q) || p.nameUrdu.includes(q);
  });

  const togglePersonSelection = (id: string) => {
    setSelectedPersonIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredPersons.map(p => p.id);
    setSelectedPersonIds(prev => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleClearSelection = () => {
    setSelectedPersonIds([]);
  };

  const handleCopy = async () => {
    if (selectedPersonIds.length === 0) {
      setErrorMessage("Please select at least one account to copy to.");
      return;
    }
    if (parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await copyTransactionToAccounts({
        sourcePersonId: transaction.personId,
        targetPersonIds: selectedPersonIds,
        type,
        amount: parsedAmount,
        dateStr: dateStr || null,
        descriptionEnglish: descEn,
        descriptionUrdu: descUr,
        category: category || null
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
      } else {
        setSuccessMessage(`Successfully copied to ${selectedPersonIds.length} account(s)!`);
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to copy transaction.");
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Copy Transaction to Other Accounts
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select target accounts and customize details before copying
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center space-x-2 rtl:space-x-reverse">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center space-x-2 rtl:space-x-reverse">
              <span>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Choose Target Accounts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2 rtl:space-x-reverse">
                <span>Select Target Accounts</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                  {selectedPersonIds.length} selected
                </span>
              </label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Select All Filtered
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-gray-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Account Search Filter */}
            <div className="relative mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 Search accounts by name (English or Urdu)..."
                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 rtl:right-auto rtl:left-3"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Scrollable Person Checklist */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-44 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60 bg-gray-50/50 dark:bg-gray-900/30">
              {isLoadingPersons ? (
                <div className="p-4 text-center text-xs text-gray-500">Loading accounts...</div>
              ) : filteredPersons.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  {candidatePersons.length === 0 ? "No other accounts available." : "No accounts match your search."}
                </div>
              ) : (
                filteredPersons.map(person => {
                  const isChecked = selectedPersonIds.includes(person.id);
                  return (
                    <label
                      key={person.id}
                      onClick={() => togglePersonSelection(person.id)}
                      className={`flex items-center justify-between px-3.5 py-2 cursor-pointer transition select-none ${
                        isChecked 
                          ? "bg-emerald-50/80 dark:bg-emerald-950/40" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {person.nameEnglish}
                        </span>
                      </div>
                      <span className="text-xs font-urdu text-gray-500 dark:text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">
                        {person.nameUrdu}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Transaction Details Configuration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Transaction Details to Copy
            </h3>

            {/* Type selector & quick reverse */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t("type")}
                </label>
                {isOppositeAvailable && (
                  <button
                    type="button"
                    onClick={() => setType(type === "CREDIT" ? "DEBIT" : "CREDIT")}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 rtl:space-x-reverse"
                  >
                    <span>⇄</span>
                    <span>Switch to {type === "CREDIT" ? "Debit" : "Credit"}</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="CREDIT">Credit (جمع)</option>
                  <option value="DEBIT">Debit (خرچ)</option>
                  <option value="DEBIT_PROFIT">Profit Paid (ادا کردہ منافع)</option>
                  <option value="TO_BE_GIVEN">To Be Given (دینے والی رقم)</option>
                  <option value="TO_BE_TAKEN">To Be Taken (لینے والی رقم)</option>
                </select>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setType(transaction.type)}
                    className={`flex-1 text-xs py-2 px-2.5 rounded border ${
                      type === transaction.type 
                        ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 border-transparent font-medium" 
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Original: {transaction.type}
                  </button>
                  {isOppositeAvailable && (
                    <button
                      type="button"
                      onClick={() => setType(oppositeType)}
                      className={`flex-1 text-xs py-2 px-2.5 rounded border ${
                        type === oppositeType 
                          ? "bg-indigo-600 text-white border-transparent font-medium" 
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      Reverse: {oppositeType}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("amount")}
                </label>
                <input
                  type="number"
                  step="any"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  required
                  className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-black dark:text-white bg-white dark:bg-gray-700"
                />
                {parsedAmount > 0 && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <div>{numberToWordsEn(parsedAmount)}</div>
                    <div className="font-urdu" dir="rtl">{numberToWordsUr(parsedAmount)}</div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("date")}
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-black dark:text-white bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (English)
                </label>
                <input
                  type="text"
                  value={descEn}
                  onChange={e => setDescEn(e.target.value)}
                  required
                  className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-black dark:text-white bg-white dark:bg-gray-700 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Urdu)
                </label>
                <input
                  type="text"
                  value={descUr}
                  onChange={e => setDescUr(e.target.value)}
                  required
                  dir="rtl"
                  className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-black dark:text-white bg-white dark:bg-gray-700 font-urdu"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="block w-full text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border text-black dark:text-white bg-white dark:bg-gray-700"
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
                  <option value="PCB">📦 PCB</option>
                  <option value="Other">📌 Other</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {selectedPersonIds.length === 0 ? (
              <span>Select at least 1 account</span>
            ) : (
              <span>Ready to copy to <strong className="text-emerald-600 dark:text-emerald-400">{selectedPersonIds.length}</strong> account(s)</span>
            )}
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={selectedPersonIds.length === 0 || isSubmitting || parsedAmount <= 0}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Copying...
                </>
              ) : (
                `Copy to ${selectedPersonIds.length} Account${selectedPersonIds.length === 1 ? "" : "s"}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
