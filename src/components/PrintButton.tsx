"use client";

import { useTranslations } from "next-intl";

export function PrintButton() {
  const t = useTranslations("Dashboard");

  return (
    <button 
      onClick={() => window.print()}
      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 no-print"
    >
      {t("exportAll")}
    </button>
  );
}
