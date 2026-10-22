"use client";

import { useState } from "react";

export function AutoTranslateInputs({ 
  enLabel, 
  urLabel, 
  enName, 
  urName,
  defaultEn = "",
  defaultUr = ""
}: { 
  enLabel: string, 
  urLabel: string, 
  enName: string, 
  urName: string,
  defaultEn?: string,
  defaultUr?: string
}) {
  const [enText, setEnText] = useState(defaultEn);
  const [urText, setUrText] = useState(defaultUr);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!enText) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: enText, sourceLang: 'en', targetLang: 'ur' })
      });
      const data = await res.json();
      if (data.translatedText) {
        setUrText(data.translatedText);
      }
    } catch (e) {
      console.error(e);
    }
    setIsTranslating(false);
  };

  return (
    <>
      <div className="w-full sm:w-auto flex-1 relative">
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{enLabel}</label>
         <div className="relative">
           <input 
             type="text" 
             name={enName} 
             value={enText}
             onChange={e => setEnText(e.target.value)}
             onBlur={handleTranslate}
             required 
             className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border font-sans text-black dark:text-white bg-white dark:bg-gray-700 pr-10" 
           />
           {isTranslating && (
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
               <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             </div>
           )}
         </div>
      </div>
      <div className="w-full sm:w-auto flex-1">
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{urLabel}</label>
         <input 
           type="text" 
           name={urName} 
           value={urText}
           onChange={e => setUrText(e.target.value)}
           required 
           dir="rtl" 
           className="mt-1 shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border font-urdu text-black dark:text-white bg-white dark:bg-gray-700" 
         />
      </div>
    </>
  );
}
