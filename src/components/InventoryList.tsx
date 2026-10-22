"use client";

import { useTranslations } from "next-intl";
import { deleteFile } from "@/app/actions/inventory";
import { useTransition } from "react";
import { Link } from "@/i18n/routing";

export function InventoryList({ files, isAdmin = true }: { files: any[], isAdmin?: boolean }) {
  const t = useTranslations("Inventory");
  const [isPending, startTransition] = useTransition();

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {files.map((file) => {
        const d = new Date(file.createdAt);
        const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        return (
          <li key={file.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <a href={`/api/files/${file.id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium break-all">
                {file.name}
              </a>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formattedDate} • {file.mimeType}
                {file.person && (
                  <span className="ml-2">
                    | {t("linkedAccount")}: <Link href={`/persons/${file.personId}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{file.person.nameEnglish}</Link>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href={`/api/files/${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
              >
                {t("view")}
              </a>
              {isAdmin && (
              <button
                onClick={() => {
                  if(confirm(t("delete") + "?")) {
                    startTransition(() => deleteFile(file.id));
                  }
                }}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
              >
                {t("delete")}
              </button>
              )}
            </div>
          </li>
        );
      })}
      {files.length === 0 && (
        <li className="py-4 text-gray-500 dark:text-gray-400 text-sm">{t("noFiles")}</li>
      )}
    </ul>
  );
}
