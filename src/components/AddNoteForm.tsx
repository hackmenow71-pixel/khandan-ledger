"use client";

import { useTranslations } from "next-intl";
import { addNote } from "@/app/actions/notes";
import { useRef } from "react";

export function AddNoteForm({ personId }: { personId?: string }) {
  const t = useTranslations("Notes");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={async (formData) => {
      await addNote(formData);
      formRef.current?.reset();
    }} ref={formRef} className="mt-4 flex gap-4">
      <input type="hidden" name="personId" value={personId || ""} />
      <input
        type="text"
        name="text"
        required
        placeholder={t("noteText")}
        className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white"
      />
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
      >
        {t("addNote")}
      </button>
    </form>
  );
}