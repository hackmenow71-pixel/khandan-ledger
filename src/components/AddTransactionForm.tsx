"use client";

import { useTranslations } from "next-intl";
import React, { useState, useTransition } from "react";
import { addTransaction } from "@/app/actions";
import { numberToWordsEn, numberToWordsUr } from "@/lib/numberToWords";

export function AddTransactionForm({ 
  personId,
  purposes = [],
  customCategories = [],
  templates = []
}: { 
  personId: string;
  purposes?: { en: string, ur: string }[];
  customCategories?: { id: string, name: string, emoji: string }[];
  templates?: any[];
}) {
  const t = useTranslations("Transactions");
  const [type, setType] = useState("CREDIT");
  
  // Description states for auto-fill logic
  const [descEn, setDescEn] = useState("");
  const [descUr, setDescUr] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [discountStr, setDiscountStr] = useState("");
  const [weightStr, setWeightStr] = useState("");
  const [quantityStr, setQuantityStr] = useState("");
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const rawAmount = parseFloat(amountStr.replace(/,/g, "")) || 0;
  const discount = parseFloat(discountStr.replace(/,/g, "")) || 0;
  const amount = rawAmount - discount;
  const isValidAmount = !isNaN(amount) && amount > 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d.]/g, "");
    const parts = val.split(".");
    if (parts[0]) parts[0] = parseInt(parts[0], 10).toLocaleString("en-US");
    setAmountStr(parts.join("."));
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d.]/g, "");
    const parts = val.split(".");
    if (parts[0]) parts[0] = parseInt(parts[0], 10).toLocaleString("en-US");
    setDiscountStr(parts.join("."));
  };

  const handleDescEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescEn(val);
    const matched = purposes.find(p => p.en.toLowerCase() === val.toLowerCase());
    if (matched) setDescUr(matched.ur);
  };

  const loadTemplate = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    if (!tpl) return;
    setType(tpl.type);
    setDescEn(tpl.descriptionEnglish);
    setDescUr(tpl.descriptionUrdu);
    setAmountStr(tpl.amount.toLocaleString("en-US", { maximumFractionDigits: 2 }));
    setDiscountStr("");
    setWeightStr("");
    setQuantityStr("");
    if (tpl.category) setCategory(tpl.category);
  };

  const [isPending, startTransition] = React.useTransition();

  return (
    <form action={(formData) => {
      formData.set("amount", amount.toString());
      
      // Append discount info if provided
      if (discount > 0) {
        const currentEn = formData.get("descriptionEnglish") || "";
        const currentUr = formData.get("descriptionUrdu") || "";
        formData.set("descriptionEnglish", `${currentEn} (Discount: ${discount.toLocaleString()})`);
        formData.set("descriptionUrdu", `${currentUr} (چھوٹ: ${discount.toLocaleString()})`);
      }

      // Append PCB info if provided
      if (category.toUpperCase() === "PCB") {
        const wt = parseFloat(weightStr);
        const qty = parseFloat(quantityStr);
        if (!isNaN(wt) && wt > 0) {
          const rate = (amount / wt).toLocaleString("en-US", { maximumFractionDigits: 2 });
          const qtyStr = !isNaN(qty) ? `Qty: ${qty}, ` : "";
          const qtyUr = !isNaN(qty) ? `تعداد: ${qty}, ` : "";
          
          const currentEn = formData.get("descriptionEnglish") || "";
          const currentUr = formData.get("descriptionUrdu") || "";
          formData.set("descriptionEnglish", `${currentEn} (${qtyStr}Wt: ${wt}kg, Rate: ${rate}/kg)`);
          formData.set("descriptionUrdu", `${currentUr} (${qtyUr}وزن: ${wt}kg, ریٹ: ${rate}/kg)`);
        }
      }

      // Instantly clear form UI for fast data entry
      setAmountStr("");
      setDiscountStr("");
      setWeightStr("");
      setQuantityStr("");
      setDescEn("");
      setDescUr("");
      const form = document.getElementById('tx-form') as HTMLFormElement;
      if (form) form.reset();

      // Run database save in background without blocking
      startTransition(() => {
        addTransaction(formData);
      });
    }} id="tx-form" className="space-y-4">
      <input type="hidden" name="personId" value={personId} />
      
      {purposes.length > 0 && (
        <datalist id="purposes-en">
          {purposes.map((p, i) => <option key={i} value={p.en} />)}
        </datalist>
      )}

      {templates && templates.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Load Template</label>
          <select 
            onChange={(e) => loadTemplate(e.target.value)} 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md border text-black dark:text-white bg-white dark:bg-gray-700"
          >
            <option value="">— Select a saved template —</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("type")}</label>
          <select name="type" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md border text-black">
            <option value="CREDIT">Credit (جمع)</option>
            <option value="DEBIT">Debit (خرچ)</option>
            <option value="DEBIT_PROFIT">Debit - Profit Paid (ادا کردہ منافع)</option>
            <option value="TO_BE_GIVEN">To Be Given (دینے والی رقم)</option>
            <option value="TO_BE_TAKEN">To Be Taken (لینے والی رقم)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("amount")}</label>
          <input 
            type="text" 
            value={amountStr}
            onChange={handleAmountChange}
            required 
            className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black" 
          />
          {isValidAmount && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-sans">{numberToWordsEn(amount)}</p>
              <p className="font-urdu" dir="rtl">{numberToWordsUr(amount)}</p>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount / Arrears <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
          <input 
            type="text" 
            value={discountStr}
            onChange={handleDiscountChange}
            placeholder="0"
            className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black placeholder-gray-400" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("descEn")}</label>
          <div className="relative">
            <input 
              type="text" 
              name="descriptionEnglish" 
              list="purposes-en"
              value={descEn}
              onChange={handleDescEnChange}
              onBlur={async () => {
                if (!descEn) return;
                setIsTranslating(true);
                try {
                  const res = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: descEn })
                  });
                  const data = await res.json();
                  if (data.translatedText) setDescUr(data.translatedText);
                } catch (e) {}
                setIsTranslating(false);
              }}
              required 
              autoComplete="off"
              className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-sans text-black pr-10" 
            />
            {isTranslating && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none mt-1">
                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("descUr")}</label>
          <input 
            type="text" 
            name="descriptionUrdu" 
            value={descUr}
            onChange={e => setDescUr(e.target.value)}
            required 
            dir="rtl" 
            autoComplete="off"
            className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-urdu text-black" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("date")} {(type === "TO_BE_GIVEN" || type === "TO_BE_TAKEN") && <span className="text-gray-400 text-xs font-normal">(Optional)</span>}
          </label>
          <input 
            type="date" 
            name="date" 
            defaultValue={new Date().toISOString().split('T')[0]} 
            required={type !== "TO_BE_GIVEN" && type !== "TO_BE_TAKEN"}
            className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border font-sans text-black" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category <span className="text-gray-400 text-xs font-normal">(Optional)</span>
          </label>
          <select 
            name="category" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md border text-black"
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
              <option value="Electricity">⚡ Electricity (بجلی)</option>
              <option value="Rent">🏷️ Rent (کرایہ)</option>
              <option value="Salary">👤 Salary (تنخواہ)</option>
              <option value="Inventory">🛒 Inventory (مال)</option>
              <option value="Transport">🚗 Transport (ٹرانسپورٹ)</option>
              <option value="Food">🍽️ Food (کھانا)</option>
              <option value="Maintenance">⚙️ Maintenance (مرمت)</option>
              <option value="Tax">🧾 Tax (ٹیکس)</option>
              <option value="Personal">🏠 Personal (ذاتی)</option>
              <option value="Other">📌 Other (دیگر)</option>
              </optgroup>
            </select>
          </div>
          
          {category.toUpperCase() === "PCB" && (
            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mass / Weight (kg)</label>
                <input 
                  type="number" 
                  value={weightStr}
                  onChange={e => setWeightStr(e.target.value)}
                  step="any"
                  placeholder="e.g. 50"
                  className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                <input 
                  type="number" 
                  value={quantityStr}
                  onChange={e => setQuantityStr(e.target.value)}
                  placeholder="e.g. 5 bags"
                  className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-black" 
                />
              </div>
              {weightStr && amount > 0 && !isNaN(parseFloat(weightStr)) && (
                <div className="col-span-1 sm:col-span-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-700">
                  Calculated Rate: <span className="font-bold text-black dark:text-white">{(amount / parseFloat(weightStr)).toLocaleString("en-US", { maximumFractionDigits: 2 })} / kg</span>
                </div>
              )}
            </div>
          )}

        </div>
      <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800">
        {t("addTransaction")}
      </button>
    </form>
  );
}
