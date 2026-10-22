"use client";

import { useTranslations } from "next-intl";
import { toggleNote, deleteNote } from "@/app/actions/notes";
import { useTransition } from "react";
import { Link } from "@/i18n/routing";

export function NotesList({ notes, isAdmin = true }: { notes: any[], isAdmin?: boolean }) {
  const t = useTranslations("Notes");
  const [isPending, startTransition] = useTransition();

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {notes.map((note) => (
        <li key={note.id} className="py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
            <input
              type="checkbox"
              checked={note.isCompleted}
              onChange={(e) => startTransition(() => toggleNote(note.id, e.target.checked))}
              disabled={!isAdmin}
              className="h-5 w-5 text-indigo-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className={`flex flex-col ${note.isCompleted ? 'opacity-50 line-through' : ''}`}>
              <span className="text-gray-900 dark:text-white">{note.text}</span>
              {note.person && (
                <Link href={`/persons/${note.personId}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  {t("linkedAccount")}: {note.person.nameEnglish} ({note.person.nameUrdu})
                </Link>
              )}
            </div>
          </div>
          {isAdmin && (
          <button
            onClick={() => {
              if(confirm(t("delete") + "?")) {
                startTransition(() => deleteNote(note.id));
              }
            }}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm ml-4"
          >
            {t("delete")}
          </button>
          )}
        </li>
      ))}
      {notes.length === 0 && (
        <li className="py-4 text-gray-500 dark:text-gray-400 text-sm">{t("noNotes")}</li>
      )}
    </ul>
  );
}