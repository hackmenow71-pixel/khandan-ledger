"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { updatePerson } from "@/app/actions";

export function EditPersonForm({ person }: { person: { id: string, nameEnglish: string, nameUrdu: string, phone?: string | null, address?: string | null } }) {
  const t = useTranslations("Persons");
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="flex items-start space-x-4 rtl:space-x-reverse">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">{person.nameEnglish}</h1>
          <h2 className="text-xl text-gray-600 font-urdu">{person.nameUrdu}</h2>
          
          {(person.phone || person.address) && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {person.phone && (
                <p>📞 <a href={`tel:${person.phone}`} className="hover:underline">{person.phone}</a></p>
              )}
              {person.address && (
                <p>📍 {person.address}</p>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="mt-1 text-sm text-blue-600 hover:text-blue-800 no-print border border-blue-600 rounded px-2 py-1"
        >
          {t("edit")}
        </button>
      </div>
    );
  }

  return (
    <form action={async (formData) => {
      await updatePerson(formData);
      setIsEditing(false);
    }} className="flex flex-col space-y-3 no-print max-w-md">
      <input type="hidden" name="id" value={person.id} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name (En)</label>
          <input 
            type="text" 
            name="nameEnglish" 
            defaultValue={person.nameEnglish} 
            required 
            className="w-full shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 rounded-md p-1.5 border text-black font-sans" 
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name (Ur)</label>
          <input 
            type="text" 
            name="nameUrdu" 
            defaultValue={person.nameUrdu} 
            required 
            dir="rtl"
            className="w-full shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 rounded-md p-1.5 border text-black font-urdu" 
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phone</label>
          <input 
            type="tel" 
            name="phone" 
            defaultValue={person.phone || ""} 
            placeholder="0300..."
            className="w-full shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 rounded-md p-1.5 border text-black font-sans" 
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Address</label>
          <input 
            type="text" 
            name="address" 
            defaultValue={person.address || ""} 
            placeholder="Address..."
            className="w-full shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 rounded-md p-1.5 border text-black font-sans" 
          />
        </div>
      </div>
      <div className="flex space-x-2 rtl:space-x-reverse pt-1">
        <button type="submit" className="text-sm bg-green-600 text-white rounded px-4 py-1.5 hover:bg-green-700">
          {t("save")}
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="text-sm bg-gray-200 text-gray-800 rounded px-4 py-1.5 hover:bg-gray-300">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
